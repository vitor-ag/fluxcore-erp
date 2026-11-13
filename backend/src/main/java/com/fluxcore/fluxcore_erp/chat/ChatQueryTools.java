package com.fluxcore.fluxcore_erp.chat;

import com.fluxcore.fluxcore_erp.domain.*;
import com.fluxcore.fluxcore_erp.repository.*;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ChatQueryTools {
    static final int LIST_LIMIT = 20;
    static final int SEARCH_LIMIT = 10;
    private final LancamentoRepository lancamentos;
    private final ProdutoRepository produtos;
    private final ClienteRepository clientes;

    public ChatQueryTools(LancamentoRepository lancamentos, ProdutoRepository produtos, ClienteRepository clientes) {
        this.lancamentos = lancamentos; this.produtos = produtos; this.clientes = clientes;
    }

    public record Lista<T>(List<T> itens, int totalEncontrado, int limite, boolean listaParcial) {}
    public record Financeiro(List<LancamentoDado> itens, int totalEncontrado, int limite, boolean listaParcial,
            BigDecimal valorTotalNaoCancelado, String totalFormatado, String criterio, boolean canceladosExcluidosDosTotais) {}
    public record LancamentoDado(Long id, String descricao, String tipo, String categoria, String status,
            String dataLancamento, String dataFormatada, BigDecimal valor, String valorFormatado) {}
    public record ProdutoDado(Long id, String nome, String sku, String categoria, Integer quantidade,
            int estoqueMinimo, BigDecimal precoVenda, String precoFormatado, BigDecimal valorEstoqueAPrecoVenda,
            String valorEstoqueFormatado, boolean estoqueBaixo) {}
    public record ClienteDado(Long id, String nome, String documento, String email, String telefone, String tipo) {}
    public record Filtro(LocalDate inicio, LocalDate fim, String status, String tipo, String categoria) {}

    public Financeiro pendencias(String tipo) {
        validateType(tipo, false);
        var items = lancamentos.findAll().stream()
                .filter(item -> ChatFinancialRules.pending(item.getStatus()))
                .filter(item -> tipo.equals(item.getTipo()))
                .sorted(orderByDate()).toList();
        return financeiro(items, "Pendentes por data de lançamento, mais antigos primeiro. Total de todos os encontrados, antes do limite.");
    }

    public Financeiro lancamentos(Filtro filter) {
        validateType(filter.tipo(), true);
        if (filter.inicio() != null && filter.fim() != null && filter.inicio().isAfter(filter.fim())) {
            throw new IllegalArgumentException("A data final deve ser igual ou posterior à inicial.");
        }
        if (filter.status() != null && !Set.of("Todos", "Pendente", "Concluído", "Cancelado").contains(filter.status())) {
            throw new IllegalArgumentException("Escolha Todos, Pendente, Concluído ou Cancelado para o status.");
        }
        var items = lancamentos.findAll().stream()
                .filter(item -> filter.inicio() == null || !item.getData().isBefore(filter.inicio()))
                .filter(item -> filter.fim() == null || !item.getData().isAfter(filter.fim()))
                .filter(item -> filter.tipo() == null || filter.tipo().equals(item.getTipo()))
                .filter(item -> filter.categoria() == null || normalize(filter.categoria()).equals(normalize(item.getCategoria())))
                .filter(item -> matchesStatus(item.getStatus(), filter.status()))
                .sorted(orderByDate().reversed()).toList();
        return financeiro(items, "Data de lançamento, mais recentes primeiro. Sem status informado, cancelados ficam fora. Total dos não cancelados de todo o filtro, antes do limite.");
    }

    public Lista<ProdutoDado> produtosEstoqueBaixo() {
        var items = produtos.findAllByOrderByNomeAsc().stream()
                .filter(item -> item.getQuantidade() <= minimum(item)).map(this::produto).toList();
        return limited(items, LIST_LIMIT);
    }

    public Lista<ProdutoDado> buscarProduto(String termo) {
        var query = searchTerm(termo);
        var items = produtos.findAllByOrderByNomeAsc().stream()
                .filter(item -> contains(query, item.getNome(), item.getSku(), item.getCategoria()))
                .map(this::produto).toList();
        return limited(items, SEARCH_LIMIT);
    }

    public Lista<ClienteDado> buscarCliente(String termo) {
        var query = searchTerm(termo);
        var items = clientes.findAllByOrderByNomeAsc().stream()
                .filter(item -> contains(query, item.getNome(), item.getDocumento(), item.getEmail(), item.getTelefone()))
                .map(item -> new ClienteDado(item.getId(), text(item.getNome()), text(item.getDocumento()),
                        text(item.getEmail()), text(item.getTelefone()), text(item.getTipo()))).toList();
        return limited(items, SEARCH_LIMIT);
    }

    private Financeiro financeiro(List<Lancamento> items, String criterio) {
        var total = items.stream().filter(item -> !ChatFinancialRules.cancelled(item.getStatus()))
                .map(item -> ChatFinancialRules.cents(item.getValor())).reduce(new BigDecimal("0.00"), BigDecimal::add);
        return new Financeiro(items.stream().limit(LIST_LIMIT).map(this::lancamento).toList(), items.size(),
                LIST_LIMIT, items.size() > LIST_LIMIT, total, ChatFinancialRules.brl(total), criterio, true);
    }

    private LancamentoDado lancamento(Lancamento item) {
        return new LancamentoDado(item.getId(), text(item.getDescricao()), text(item.getTipo()), text(item.getCategoria()),
                text(item.getStatus()), item.getData().toString(), item.getData().format(DateTimeFormatter.ofPattern("dd/MM/uuuu")),
                ChatFinancialRules.cents(item.getValor()), ChatFinancialRules.brl(ChatFinancialRules.cents(item.getValor())));
    }

    private ProdutoDado produto(Produto item) {
        var preco = ChatFinancialRules.cents(item.getPreco());
        var value = preco.multiply(BigDecimal.valueOf(item.getQuantidade()));
        return new ProdutoDado(item.getId(), text(item.getNome()), text(item.getSku()), text(item.getCategoria()),
                item.getQuantidade(), minimum(item), preco, ChatFinancialRules.brl(preco), value,
                ChatFinancialRules.brl(value), item.getQuantidade() <= minimum(item));
    }

    private static boolean matchesStatus(String actual, String filter) {
        if (filter == null) return !ChatFinancialRules.cancelled(actual);
        return switch (filter) {
            case "Todos" -> true;
            case "Concluído" -> ChatFinancialRules.settled(actual);
            case "Pendente" -> ChatFinancialRules.pending(actual);
            case "Cancelado" -> ChatFinancialRules.cancelled(actual);
            default -> false;
        };
    }

    static void validateType(String tipo, boolean optional) {
        if ((tipo == null && optional) || "Entrada".equals(tipo) || "Saída".equals(tipo)) return;
        throw new IllegalArgumentException("Informe Entrada para receber ou Saída para pagar.");
    }
    private static int minimum(Produto item) { return item.getEstoqueMinimo() == null ? 0 : item.getEstoqueMinimo(); }
    private static Comparator<Lancamento> orderByDate() {
        return Comparator.comparing(Lancamento::getData).thenComparing(Lancamento::getId, Comparator.nullsLast(Comparator.naturalOrder()));
    }
    private static <T> Lista<T> limited(List<T> items, int limit) {
        return new Lista<>(items.stream().limit(limit).toList(), items.size(), limit, items.size() > limit);
    }
    private static String searchTerm(String value) {
        if (value == null || value.isBlank() || value.length() > 100) throw new IllegalArgumentException("Informe um termo de busca entre 1 e 100 caracteres.");
        return normalize(value.strip());
    }
    private static boolean contains(String query, String... fields) {
        return Arrays.stream(fields).anyMatch(value -> normalize(value).contains(query));
    }
    private static String normalize(String value) {
        return value == null ? "" : Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
    }
    // Limita o conteúdo enviado ao provedor; textos continuam sendo dados, nunca instruções.
    private static String text(String value) { return value == null || value.length() <= 300 ? value : value.substring(0, 300) + "…"; }
}
