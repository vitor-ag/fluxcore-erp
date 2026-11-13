package com.fluxcore.fluxcore_erp.chat;

import com.openai.core.JsonValue;
import com.openai.models.responses.FunctionTool;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Service
public class ChatToolCatalog {
    private final SaldoTool saldo;
    private final ChatQueryTools queries;
    private final JsonMapper json = JsonMapper.builder().build();

    public ChatToolCatalog(SaldoTool saldo, ChatQueryTools queries) { this.saldo = saldo; this.queries = queries; }

    public static List<FunctionTool> definitions() {
        return List.of(
                definition("saldoRealizado", "Saldo realizado e totais concluídos de todo o histórico. Não é saldo bancário.", Map.of()),
                definition("pendencias", "Pendências a receber (Entrada) ou a pagar (Saída), mais antigas primeiro, por data de lançamento. Sem vencimentos. Total completo e até 20 itens.",
                        Map.of("tipo", enumeration(false, "Entrada", "Saída"))),
                definition("lancamentos", "Consulta lançamentos por datas inclusivas de lançamento, status agrupado, tipo e categoria exata. Até 20 mais recentes e total antes do limite. Filtros não utilizados devem ser null. Por padrão exclui cancelados; Todos permite vê-los sem somar seus valores.",
                        Map.of("periodoInicio", optional("Data inicial de lançamento AAAA-MM-DD, ou null."),
                                "periodoFim", optional("Data final de lançamento AAAA-MM-DD, ou null."),
                                "status", enumeration(true, "Todos", "Pendente", "Concluído", "Cancelado"),
                                "tipo", enumeration(true, "Entrada", "Saída"), "categoria", optional("Categoria exata, ou null."))),
                definition("produtosEstoqueBaixo", "Produtos com quantidade menor ou igual ao estoque mínimo; até 20 itens. Valores são a preço de venda, não custo.", Map.of()),
                definition("buscarProduto", "Busca literal por nome, SKU ou categoria, sem distinguir caixa/acentos. Até 10 produtos. Valor de estoque a preço de venda.",
                        Map.of("termo", Map.of("type", "string", "minLength", 1, "maxLength", 100))),
                definition("buscarCliente", "Busca literal por nome, documento, e-mail ou telefone; até 10 clientes. Não há vínculo com lançamentos nem valor em aberto por cliente.",
                        Map.of("termo", Map.of("type", "string", "minLength", 1, "maxLength", 100))));
    }

    public Object execute(String name, String arguments) {
        Set<String> allowed = switch (name) {
            case "saldoRealizado", "produtosEstoqueBaixo" -> Set.of();
            case "pendencias" -> Set.of("tipo");
            case "buscarProduto", "buscarCliente" -> Set.of("termo");
            case "lancamentos" -> Set.of("periodoInicio", "periodoFim", "status", "tipo", "categoria");
            default -> throw new ChatFailure(HttpStatus.BAD_GATEWAY, "Não foi possível concluir a consulta. Tente novamente.");
        };
        JsonNode args;
        try {
            if (arguments == null || arguments.length() > 2000) return invalidArguments();
            args = json.readTree(arguments);
            if (!args.isObject() || !allowed.containsAll(args.propertyNames())) return invalidArguments();
            for (var entry : args.properties()) {
                if (!entry.getValue().isNull() && (!entry.getValue().isString() || entry.getValue().asString().length() > 100)) return invalidArguments();
            }
        } catch (RuntimeException error) { return invalidArguments(); }
        try {
            return switch (name) {
                case "saldoRealizado" -> saldo.consultar();
                case "pendencias" -> queries.pendencias(value(args, "tipo"));
                case "lancamentos" -> queries.lancamentos(new ChatQueryTools.Filtro(date(args, "periodoInicio"), date(args, "periodoFim"),
                        value(args, "status"), value(args, "tipo"), value(args, "categoria")));
                case "produtosEstoqueBaixo" -> queries.produtosEstoqueBaixo();
                case "buscarProduto" -> queries.buscarProduto(value(args, "termo"));
                case "buscarCliente" -> queries.buscarCliente(value(args, "termo"));
                default -> throw new IllegalStateException("Ferramenta não registrada");
            };
        } catch (IllegalArgumentException error) {
            return Map.of("erro", "Não foi possível consultar com esses filtros. Peça ao usuário para confirmar período, tipo, status ou termo de busca.");
        }
    }

    private static Map<String, String> invalidArguments() {
        return Map.of("erro", "Não foi possível consultar com esses filtros. Solicite uma pergunta mais específica.");
    }
    private static String value(JsonNode args, String key) {
        var node = args.get(key);
        return node == null || node.isNull() ? null : node.asString();
    }
    private static LocalDate date(JsonNode args, String key) {
        var value = value(args, key);
        if (value == null) return null;
        if (!value.matches("\\d{4}-\\d{2}-\\d{2}")) throw new IllegalArgumentException("Data inválida");
        try { return LocalDate.parse(value); }
        catch (DateTimeParseException error) { throw new IllegalArgumentException("Data inválida"); }
    }
    private static Map<String, Object> optional(String description) {
        return Map.of("type", List.of("string", "null"), "description", description, "maxLength", 100);
    }
    private static Map<String, Object> enumeration(boolean nullable, String... values) {
        var options = new ArrayList<Object>(List.of(values));
        if (nullable) options.add(null);
        return Map.of("type", nullable ? List.of("string", "null") : "string", "enum", options);
    }
    private static FunctionTool definition(String name, String description, Map<String, ?> properties) {
        return FunctionTool.builder().name(name).description(description).strict(true)
                .parameters(FunctionTool.Parameters.builder()
                        .putAdditionalProperty("type", JsonValue.from("object"))
                        .putAdditionalProperty("properties", JsonValue.from(properties))
                        .putAdditionalProperty("required", JsonValue.from(new TreeSet<>(properties.keySet())))
                        .putAdditionalProperty("additionalProperties", JsonValue.from(false)).build()).build();
    }
}
