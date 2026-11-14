package com.fluxcore.fluxcore_erp.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/estoque")
public class StockMovementController {
    private final JdbcTemplate jdbc;

    public StockMovementController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/movimentos")
    public Object movements() {
        return jdbc.queryForList("""
                SELECT m.id, p.nome, m.tipo, m.quantidade, m.motivo, m.origem, m.data
                FROM movimentacoes_estoque m JOIN produtos p ON p.id = m.produto_id
                ORDER BY m.data DESC, m.id DESC LIMIT 100
                """);
    }

    @PostMapping("/conferencia")
    @Transactional
    public Map<String, BigDecimal> reconcile(@Valid @RequestBody Count request, Authentication auth) {
        BigDecimal before = jdbc.query("""
                SELECT COALESCE(quantidade_atual, 0) FROM produtos WHERE id = ? FOR UPDATE
                """, rs -> rs.next() ? rs.getBigDecimal(1) : null, request.produtoId());
        if (before == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado.");
        BigDecimal quantity = BigDecimal.valueOf(request.quantidade());
        String mode = request.modo() == null ? "Conferência" : request.modo();
        BigDecimal delta = switch (mode) {
            case "Conferência" -> quantity.subtract(before);
            case "Entrada" -> quantity;
            case "Saída" -> quantity.negate();
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de movimento inválido.");
        };
        if (before.add(delta).signum() < 0) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Estoque insuficiente.");
        }
        if (delta.signum() == 0) return Map.of("diferenca", delta);
        jdbc.update("UPDATE produtos SET quantidade_atual = ? WHERE id = ?", before.add(delta), request.produtoId());
        jdbc.update("""
                INSERT INTO movimentacoes_estoque (produto_id, usuario_id, tipo, quantidade, motivo, origem, data)
                VALUES (?, (SELECT id FROM usuarios WHERE email = ?), ?, ?, ?, ?, ?)
                """, request.produtoId(), auth.getName(), delta.signum() > 0 ? "ENTRADA" : "SAIDA",
                delta.abs(), request.motivo().trim(), mode, LocalDateTime.now());
        return Map.of("diferenca", delta);
    }

    record Count(@NotNull Integer produtoId, @NotNull @Min(0) Integer quantidade, String modo,
                 @NotBlank @Size(max = 500) String motivo) {}
}
