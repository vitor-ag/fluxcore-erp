package com.fluxcore.fluxcore_erp.api;

import java.util.List;
import java.util.Map;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.ColumnMapRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;

/** Initial, table-shaped REST API for the MVP data model. */
@RestController
@RequestMapping("/api")
public class MvpCrudController {
    private final JdbcTemplate jdbc;
    private final NamedParameterJdbcTemplate namedJdbc;

    public MvpCrudController(JdbcTemplate jdbc, NamedParameterJdbcTemplate namedJdbc) {
        this.jdbc = jdbc;
        this.namedJdbc = namedJdbc;
    }

    @GetMapping("/model")
    public List<Map<String, Object>> model() {
        return jdbc.queryForList("""
                SELECT TABLE_NAME AS table_name, COLUMN_NAME AS column_name,
                       DATA_TYPE AS data_type, IS_NULLABLE AS nullable,
                       COLUMN_KEY AS column_key, EXTRA AS extra
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME IN (%s)
                ORDER BY TABLE_NAME, ORDINAL_POSITION
                """.formatted(MvpResource.values().length == 0 ? "''" : tableList()));
    }

    @GetMapping("/{table}")
    public List<Map<String, Object>> list(@PathVariable String table) {
        String name = tableName(table);
        return jdbc.query("SELECT " + readableColumns(name) + " FROM `" + name + "` ORDER BY id", new ColumnMapRowMapper());
    }

    @GetMapping("/{table}/{id}")
    public Map<String, Object> get(@PathVariable String table, @PathVariable int id) {
        String name = tableName(table);
        return jdbc.query("SELECT " + readableColumns(name) + " FROM `" + name + "` WHERE id = ?", new ColumnMapRowMapper(), id)
                .stream().findFirst().orElseThrow(() -> notFound(name, id));
    }

    @PostMapping("/{table}")
    public Map<String, Object> create(@PathVariable String table, @RequestBody Map<String, Object> values,
                                      Authentication authentication) {
        String name = tableName(table);
        requireGenericWriteAllowed(name);
        Map<String, Object> fields = writableFields(name, values);
        if (fields.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe ao menos um campo para criar o registro.");
        }
        applyCreateDefaults(name, fields);
        validateBusinessFields(name, fields);
        if (name.equals("lancamentos_financeiros")) {
            fields.put("usuario_id", authenticatedUserId(authentication));
        }
        String columns = fields.keySet().stream().map(column -> "`" + column + "`").collect(java.util.stream.Collectors.joining(", "));
        String parameters = fields.keySet().stream().map(column -> ":" + column).collect(java.util.stream.Collectors.joining(", "));
        KeyHolder keyHolder = new GeneratedKeyHolder();
        namedJdbc.update("INSERT INTO `" + name + "` (" + columns + ") VALUES (" + parameters + ")",
                new MapSqlParameterSource(fields), keyHolder, new String[] {"id"});
        Number key = keyHolder.getKey();
        if (key == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível obter o id criado.");
        }
        return get(name, key.intValue());
    }

    @PatchMapping("/{table}/{id}")
    public Map<String, Object> update(@PathVariable String table, @PathVariable int id,
                                      @RequestBody Map<String, Object> values) {
        String name = tableName(table);
        requireGenericWriteAllowed(name);
        Map<String, Object> current = get(name, id);
        ensureFinancialEntryIsManual(name, id);
        Map<String, Object> fields = writableFields(name, values);
        if (fields.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe ao menos um campo para atualizar.");
        }
        Map<String, Object> merged = new java.util.LinkedHashMap<>(current);
        merged.putAll(fields);
        if (name.equals("produtos")) {
            LocalDateTime updatedAt = LocalDateTime.now();
            fields.put("atualizado_em", updatedAt);
            merged.put("atualizado_em", updatedAt);
        }
        validateBusinessFields(name, merged);
        String assignments = fields.keySet().stream()
                .map(column -> "`" + column + "` = :" + column)
                .collect(java.util.stream.Collectors.joining(", "));
        MapSqlParameterSource parameters = new MapSqlParameterSource(fields).addValue("recordId", id);
        namedJdbc.update("UPDATE `" + name + "` SET " + assignments + " WHERE id = :recordId", parameters);
        return get(name, id);
    }

    @DeleteMapping("/{table}/{id}")
    public void delete(@PathVariable String table, @PathVariable int id) {
        String name = tableName(table);
        requireGenericWriteAllowed(name);
        get(name, id);
        ensureFinancialEntryIsManual(name, id);
        jdbc.update("DELETE FROM `" + name + "` WHERE id = ?", id);
    }

    private String tableName(String table) {
        if (!MvpResource.containsTable(table)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Recurso fora do modelo MVP.");
        }
        return table.toLowerCase(java.util.Locale.ROOT);
    }

    private Map<String, Object> writableFields(String table, Map<String, Object> values) {
        if (values == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O corpo JSON é obrigatório.");
        }
        List<ColumnInfo> columns = jdbc.query("""
                SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH,
                       NUMERIC_PRECISION, NUMERIC_SCALE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME <> 'id'
                """, (rs, row) -> new ColumnInfo(rs.getString("COLUMN_NAME"), rs.getString("DATA_TYPE"),
                rs.getString("COLUMN_TYPE"), nullableLong(rs, "CHARACTER_MAXIMUM_LENGTH"),
                nullableLong(rs, "NUMERIC_PRECISION"), nullableLong(rs, "NUMERIC_SCALE")), table);
        var allowed = columns.stream().collect(java.util.stream.Collectors.toMap(
                column -> column.name().toLowerCase(java.util.Locale.ROOT), column -> column));
        var result = new java.util.LinkedHashMap<String, Object>();
        for (var entry : values.entrySet()) {
            ColumnInfo columnInfo = allowed.get(entry.getKey().toLowerCase(java.util.Locale.ROOT));
            if (columnInfo == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Campo não previsto no modelo para " + table + ": " + entry.getKey());
            }
            String column = columnInfo.name();
            if (table.equals("usuarios") && column.equalsIgnoreCase("senha_hash")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "senha_hash deve ser definido pelo fluxo de autenticação.");
            }
            if (table.equals("usuarios") && column.equalsIgnoreCase("role")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "O perfil do usuário não pode ser alterado pela API CRUD.");
            }
            if (table.equals("produtos") && column.equalsIgnoreCase("quantidade_atual")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "O estoque deve ser alterado por uma movimentação de entrada ou saída.");
            }
            if (table.equals("lancamentos_financeiros")
                    && (column.equalsIgnoreCase("origem") || column.equalsIgnoreCase("origem_id")
                    || column.equalsIgnoreCase("usuario_id"))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "A origem e o usuário do lançamento são controlados pela API.");
            }
            result.put(column, normalizeValue(table, columnInfo, entry.getValue()));
        }
        return result;
    }

    private Object normalizeValue(String table, ColumnInfo column, Object value) {
        if (value == null) return null;
        String type = column.dataType().toLowerCase(java.util.Locale.ROOT);
        try {
            if (List.of("varchar", "char", "text", "tinytext", "mediumtext", "longtext").contains(type)) {
                String text = value.toString();
                if (column.maxLength() != null && text.codePointCount(0, text.length()) > column.maxLength()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            column.name() + " excede o limite de " + column.maxLength() + " caracteres.");
                }
                return text;
            }
            if (type.equals("decimal") || type.equals("numeric")) {
                BigDecimal number = new BigDecimal(value.toString());
                if (table.equals("produtos") && isNonNegativeField(column.name()) && number.signum() < 0) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, column.name() + " não pode ser negativo.");
                }
                if (column.scale() != null) number = number.setScale(column.scale().intValue(), RoundingMode.UNNECESSARY);
                if (column.precision() != null && number.precision() > column.precision()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, column.name() + " excede a precisão permitida.");
                }
                return number;
            }
            if (type.equals("date")) return LocalDate.parse(value.toString());
            if (type.equals("datetime") || type.equals("timestamp")) {
                return LocalDateTime.parse(value.toString().replace(' ', 'T'));
            }
            if (column.columnType().toLowerCase(java.util.Locale.ROOT).startsWith("tinyint(1)")) {
                if (value instanceof Boolean) return value;
                String bool = value.toString().toLowerCase(java.util.Locale.ROOT);
                if (bool.equals("true") || bool.equals("1")) return true;
                if (bool.equals("false") || bool.equals("0")) return false;
                throw new IllegalArgumentException();
            }
            if (type.matches("tinyint|smallint|mediumint|int|integer|bigint")) {
                return new BigDecimal(value.toString()).intValueExact();
            }
            return value;
        } catch (NumberFormatException | ArithmeticException | java.time.DateTimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Valor ou formato inválido para o campo " + column.name() + ".");
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Valor ou formato inválido para o campo " + column.name() + ".");
        }
    }

    private void validateBusinessFields(String table, Map<String, Object> fields) {
        Map<String, List<String>> requiredByTable = Map.ofEntries(
                Map.entry("clientes", List.of("nome")),
                Map.entry("fornecedores", List.of("nome")),
                Map.entry("categorias_produto", List.of("nome")),
                Map.entry("produtos", List.of("nome", "unidade_medida", "preco_custo", "preco_venda")),
                Map.entry("categorias_financeiras", List.of("nome", "tipo")),
                Map.entry("contas_financeiras", List.of("nome", "tipo", "saldo_atual")),
                Map.entry("lancamentos_financeiros", List.of("tipo", "descricao", "valor")),
                Map.entry("metas", List.of("tipo", "valor_meta", "mes_referencia")),
                Map.entry("empresa", List.of("razao_social")),
                Map.entry("previsoes_financeiras", List.of("mes_referencia", "valor_previsto", "metodo")),
                Map.entry("alertas_discrepancia", List.of("tipo", "referencia_tabela", "referencia_id", "descricao")));
        for (String field : requiredByTable.getOrDefault(table, List.of())) {
            Object value = valueIgnoreCase(fields, field);
            if (value == null || value instanceof String text && text.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " é obrigatório para " + table + ".");
            }
        }
        Object email = valueIgnoreCase(fields, "email");
        if (email instanceof String text && !text.isBlank()
                && !text.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email precisa ter um formato válido.");
        }
    }

    private Object valueIgnoreCase(Map<String, Object> values, String key) {
        return values.entrySet().stream().filter(entry -> entry.getKey().equalsIgnoreCase(key))
                .map(Map.Entry::getValue).findFirst().orElse(null);
    }

    private void applyCreateDefaults(String table, Map<String, Object> fields) {
        if (!table.equals("produtos")) return;
        fields.putIfAbsent("ativo", true);
        fields.putIfAbsent("quantidade_atual", BigDecimal.ZERO.setScale(3));
        fields.putIfAbsent("estoque_minimo", BigDecimal.ZERO.setScale(3));
        fields.putIfAbsent("criado_em", LocalDateTime.now());
        fields.putIfAbsent("atualizado_em", LocalDateTime.now());
    }

    private Long nullableLong(java.sql.ResultSet rs, String column) throws java.sql.SQLException {
        long value = rs.getLong(column);
        return rs.wasNull() ? null : value;
    }

    private record ColumnInfo(String name, String dataType, String columnType,
                              Long maxLength, Long precision, Long scale) {}

    private ResponseStatusException notFound(String table, int id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro " + id + " não encontrado em " + table + ".");
    }

    private String tableList() {
        return java.util.Arrays.stream(MvpResource.values())
                .map(resource -> "'" + resource.tableName() + "'")
                .collect(java.util.stream.Collectors.joining(", "));
    }

    private String readableColumns(String table) {
        return table.equals("usuarios")
                ? "`id`, `nome`, `email`, `role`, `ativo`, `criado_em`"
                : "*";
    }

    private void requireGenericWriteAllowed(String table) {
        if (java.util.Set.of("usuarios", "vendas", "venda_itens", "compras", "compra_itens",
                "movimentacoes_estoque").contains(table)) {
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED,
                    "Use o endpoint de autenticação ou de confirmação do fluxo para alterar este recurso.");
        }
    }

    private boolean isNonNegativeField(String column) {
        return java.util.Set.of("preco_custo", "preco_venda", "estoque_minimo")
                .contains(column.toLowerCase(java.util.Locale.ROOT));
    }

    private int authenticatedUserId(Authentication authentication) {
        Integer id = jdbc.query("SELECT id FROM usuarios WHERE LOWER(email) = LOWER(?) AND ativo = TRUE",
                rs -> rs.next() ? rs.getInt(1) : null, authentication.getName());
        if (id == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não está ativo.");
        return id;
    }

    private void ensureFinancialEntryIsManual(String table, int id) {
        if (!table.equals("lancamentos_financeiros")) return;
        String origin = jdbc.query("SELECT origem FROM lancamentos_financeiros WHERE id = ?",
                rs -> rs.next() ? rs.getString("origem") : null, id);
        if (origin != null) {
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED,
                    "Lançamentos originados por venda ou compra não podem ser alterados pelo CRUD.");
        }
    }
}
