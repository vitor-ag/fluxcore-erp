package com.fluxcore.fluxcore_erp.api;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PastOrPresent;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class BusinessFlowController {
    private final JdbcTemplate jdbc;
    private final NamedParameterJdbcTemplate namedJdbc;

    public BusinessFlowController(JdbcTemplate jdbc, NamedParameterJdbcTemplate namedJdbc) {
        this.jdbc = jdbc;
        this.namedJdbc = namedJdbc;
    }

    @PostMapping("/vendas/confirmar")
    @Transactional
    public Map<String, Object> confirmSale(@Valid @RequestBody SaleRequest request, Authentication authentication) {
        int userId = userId(authentication);
        requireExists("clientes", request.clienteId());
        validateUniqueProducts(request.itens().stream().map(SaleLine::produtoId).toList());

        List<LockedSaleLine> lines = new ArrayList<>();
        BigDecimal subtotal = money(BigDecimal.ZERO);
        for (SaleLine line : request.itens().stream().sorted(Comparator.comparing(SaleLine::produtoId)).toList()) {
            var product = jdbc.query("""
                    SELECT nome, preco_venda, quantidade_atual, ativo
                    FROM produtos WHERE id = ? FOR UPDATE
                    """, rs -> {
                if (!rs.next()) throw notFound("Produto", line.produtoId());
                if (!rs.getBoolean("ativo")) throw invalid("Produto " + line.produtoId() + " está inativo.");
                BigDecimal price = rs.getBigDecimal("preco_venda");
                BigDecimal stock = rs.getBigDecimal("quantidade_atual");
                if (price == null || stock == null) throw invalid("Produto precisa ter preço de venda e estoque cadastrados.");
                if (stock.compareTo(line.quantidade()) < 0) throw invalid("Estoque insuficiente para o produto " + line.produtoId() + ".");
                return new LockedSaleLine(line.produtoId(), rs.getString("nome"), line.quantidade(), money(price));
            }, line.produtoId());
            lines.add(product);
            subtotal = subtotal.add(lineSubtotal(product.preco(), product.quantidade()));
        }

        BigDecimal discount = request.desconto() == null ? money(BigDecimal.ZERO) : money(request.desconto());
        if (discount.compareTo(subtotal) > 0) throw invalid("O desconto não pode ser maior que o subtotal.");
        BigDecimal total = money(subtotal.subtract(discount));
        LocalDateTime now = LocalDateTime.now();
        int saleId = insert("""
                INSERT INTO vendas (cliente_id, usuario_id, `data`, status, forma_pagamento, desconto, total)
                VALUES (:clientId, :userId, :createdAt, 'CONFIRMADA', :paymentMethod, :discount, :total)
                """, new MapSqlParameterSource().addValue("clientId", request.clienteId())
                .addValue("userId", userId).addValue("createdAt", now)
                .addValue("paymentMethod", request.formaPagamento().trim())
                .addValue("discount", discount).addValue("total", total));

        for (LockedSaleLine line : lines) {
            BigDecimal lineTotal = lineSubtotal(line.preco(), line.quantidade());
            jdbc.update("""
                    INSERT INTO venda_itens (venda_id, produto_id, quantidade, preco_unitario, subtotal)
                    VALUES (?, ?, ?, ?, ?)
                    """, saleId, line.produtoId(), line.quantidade(), line.preco(), lineTotal);
            jdbc.update("UPDATE produtos SET quantidade_atual = quantidade_atual - ? WHERE id = ?",
                    line.quantidade(), line.produtoId());
            jdbc.update("""
                    INSERT INTO movimentacoes_estoque
                    (produto_id, usuario_id, tipo, quantidade, motivo, origem, origem_id, `data`)
                    VALUES (?, ?, 'SAIDA', ?, ?, 'VENDA', ?, ?)
                    """, line.produtoId(), userId, line.quantidade(), "Venda confirmada #" + saleId, saleId, now);
        }

        int financeId = createFinancialEntry("RECEITA", "Venda #" + saleId, total, request.dataVencimento(),
                request.dataPagamento(), "VENDA", saleId, userId);
        return Map.of("id", saleId, "cliente_id", request.clienteId(), "usuario_id", userId,
                "status", "CONFIRMADA", "forma_pagamento", request.formaPagamento(),
                "subtotal", subtotal, "desconto", discount, "total", total,
                "lancamento_financeiro_id", financeId, "itens", saleLines(lines));
    }

    @PostMapping("/compras/confirmar")
    @Transactional
    public Map<String, Object> confirmPurchase(@Valid @RequestBody PurchaseRequest request, Authentication authentication) {
        int userId = userId(authentication);
        requireExists("fornecedores", request.fornecedorId());
        validateUniqueProducts(request.itens().stream().map(PurchaseLine::produtoId).toList());

        List<LockedPurchaseLine> lines = request.itens().stream()
                .sorted(Comparator.comparing(PurchaseLine::produtoId))
                .map(line -> {
                    var product = jdbc.query("SELECT nome, ativo FROM produtos WHERE id = ? FOR UPDATE", rs -> {
                        if (!rs.next()) throw notFound("Produto", line.produtoId());
                        if (!rs.getBoolean("ativo")) throw invalid("Produto " + line.produtoId() + " está inativo.");
                        return new LockedPurchaseLine(line.produtoId(), rs.getString("nome"), line.quantidade(), money(line.precoUnitario()));
                    }, line.produtoId());
                    return product;
                }).toList();
        BigDecimal subtotal = lines.stream().map(line -> lineSubtotal(line.preco(), line.quantidade()))
                .reduce(money(BigDecimal.ZERO), BigDecimal::add);
        LocalDateTime now = LocalDateTime.now();
        int purchaseId = insert("""
                INSERT INTO compras (fornecedor_id, usuario_id, `data`, status, forma_pagamento, subtotal, total)
                VALUES (:supplierId, :userId, :createdAt, 'CONFIRMADA', :paymentMethod, :subtotal, :total)
                """, new MapSqlParameterSource().addValue("supplierId", request.fornecedorId())
                .addValue("userId", userId).addValue("createdAt", now)
                .addValue("paymentMethod", request.formaPagamento().trim())
                .addValue("subtotal", subtotal).addValue("total", subtotal));

        for (LockedPurchaseLine line : lines) {
            BigDecimal lineTotal = lineSubtotal(line.preco(), line.quantidade());
            jdbc.update("""
                    INSERT INTO compra_itens (compra_id, produto_id, quantidade, preco_unitario, subtotal)
                    VALUES (?, ?, ?, ?, ?)
                    """, purchaseId, line.produtoId(), line.quantidade(), line.preco(), lineTotal);
            jdbc.update("UPDATE produtos SET quantidade_atual = COALESCE(quantidade_atual, 0) + ? WHERE id = ?",
                    line.quantidade(), line.produtoId());
            jdbc.update("""
                    INSERT INTO movimentacoes_estoque
                    (produto_id, usuario_id, tipo, quantidade, motivo, origem, origem_id, `data`)
                    VALUES (?, ?, 'ENTRADA', ?, ?, 'COMPRA', ?, ?)
                    """, line.produtoId(), userId, line.quantidade(), "Compra confirmada #" + purchaseId, purchaseId, now);
        }

        int financeId = createFinancialEntry("DESPESA", "Compra #" + purchaseId, subtotal,
                request.dataVencimento(), request.dataPagamento(), "COMPRA", purchaseId, userId);
        return Map.of("id", purchaseId, "fornecedor_id", request.fornecedorId(), "usuario_id", userId,
                "status", "CONFIRMADA", "forma_pagamento", request.formaPagamento(),
                "subtotal", subtotal, "total", subtotal,
                "lancamento_financeiro_id", financeId, "itens", purchaseLines(lines));
    }

    private int createFinancialEntry(String type, String description, BigDecimal value,
                                     LocalDate dueDate, LocalDate paidDate, String origin,
                                     int originId, int userId) {
        String status = paidDate == null ? "PENDENTE" : "PAGO";
        return insert("""
                INSERT INTO lancamentos_financeiros
                (tipo, descricao, valor, data_vencimento, data_pagamento, status, origem, origem_id, usuario_id)
                VALUES (:type, :description, :value, :dueDate, :paidDate, :status, :origin, :originId, :userId)
                """, new MapSqlParameterSource().addValue("type", type).addValue("description", description)
                .addValue("value", value).addValue("dueDate", dueDate).addValue("paidDate", paidDate)
                .addValue("status", status).addValue("origin", origin).addValue("originId", originId)
                .addValue("userId", userId));
    }

    private int insert(String sql, MapSqlParameterSource parameters) {
        var keyHolder = new org.springframework.jdbc.support.GeneratedKeyHolder();
        namedJdbc.update(sql, parameters, keyHolder, new String[] {"id"});
        Number key = keyHolder.getKey();
        if (key == null) throw new IllegalStateException("O banco não retornou o ID criado.");
        return key.intValue();
    }

    private int userId(Authentication authentication) {
        Integer id = jdbc.query("SELECT id FROM usuarios WHERE LOWER(email) = LOWER(?) AND ativo = TRUE",
                rs -> rs.next() ? rs.getInt(1) : null, authentication.getName());
        if (id == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não está ativo.");
        return id;
    }

    private void requireExists(String table, int id) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM `" + table + "` WHERE id = ?", Integer.class, id);
        if (count == null || count == 0) throw notFound(table, id);
    }

    private void validateUniqueProducts(List<Integer> productIds) {
        Set<Integer> unique = new HashSet<>(productIds);
        if (unique.size() != productIds.size()) throw invalid("Envie cada produto uma única vez por operação.");
    }

    private List<Map<String, Object>> saleLines(List<LockedSaleLine> lines) {
        return lines.stream().map(line -> Map.<String, Object>of("produto_id", line.produtoId(),
                "produto", line.nome(), "quantidade", line.quantidade(), "preco_unitario", line.preco(),
                "subtotal", lineSubtotal(line.preco(), line.quantidade()))).toList();
    }

    private List<Map<String, Object>> purchaseLines(List<LockedPurchaseLine> lines) {
        return lines.stream().map(line -> Map.<String, Object>of("produto_id", line.produtoId(),
                "produto", line.nome(), "quantidade", line.quantidade(), "preco_unitario", line.preco(),
                "subtotal", lineSubtotal(line.preco(), line.quantidade()))).toList();
    }

    private BigDecimal lineSubtotal(BigDecimal price, BigDecimal quantity) {
        return money(price.multiply(quantity));
    }

    private BigDecimal money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private ResponseStatusException notFound(String kind, int id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, kind + " " + id + " não encontrado.");
    }

    private ResponseStatusException invalid(String message) {
        return new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, message);
    }

    public record SaleRequest(@NotNull @Positive Integer clienteId,
                              @NotBlank @jakarta.validation.constraints.Size(max = 100) String formaPagamento,
                              @DecimalMin("0.00") @Digits(integer = 13, fraction = 2) BigDecimal desconto,
                              LocalDate dataVencimento, @PastOrPresent LocalDate dataPagamento,
                              @NotEmpty List<@Valid SaleLine> itens) {}

    public record SaleLine(@NotNull @Positive Integer produtoId,
                           @NotNull @Positive @Digits(integer = 12, fraction = 3) BigDecimal quantidade) {}

    public record PurchaseRequest(@NotNull @Positive Integer fornecedorId,
                                  @NotBlank @jakarta.validation.constraints.Size(max = 100) String formaPagamento,
                                  LocalDate dataVencimento, @PastOrPresent LocalDate dataPagamento,
                                  @NotEmpty List<@Valid PurchaseLine> itens) {}

    public record PurchaseLine(@NotNull @Positive Integer produtoId,
                               @NotNull @Positive @Digits(integer = 12, fraction = 3) BigDecimal quantidade,
                               @NotNull @DecimalMin("0.00") @Digits(integer = 13, fraction = 2) BigDecimal precoUnitario) {}

    private record LockedSaleLine(int produtoId, String nome, BigDecimal quantidade, BigDecimal preco) {}
    private record LockedPurchaseLine(int produtoId, String nome, BigDecimal quantidade, BigDecimal preco) {}
}
