package com.fluxcore.fluxcore_erp.api;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PlanningController {
    private final JdbcTemplate jdbc;

    public PlanningController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    record Month(YearMonth month, BigDecimal income, BigDecimal expenses) {
        BigDecimal net() { return income.subtract(expenses); }
    }
    record Projection(String month, BigDecimal income, BigDecimal expenses, BigDecimal balance) {}

    @GetMapping("/api/planejamento")
    public Map<String, Object> overview() {
        YearMonth current = YearMonth.now();
        List<Month> history = new ArrayList<>();
        for (int offset = 3; offset >= 0; offset--) {
            YearMonth month = current.minusMonths(offset);
            history.add(new Month(month, total(month, "Entrada"), total(month, "Saída")));
        }
        Month actual = history.getLast();
        List<Month> baseline = history.subList(0, 3);
        BigDecimal income = average(baseline.stream().map(Month::income).toList());
        BigDecimal expenses = average(baseline.stream().map(Month::expenses).toList());
        BigDecimal balance = jdbc.queryForObject("""
                SELECT COALESCE(SUM(CASE WHEN tipo = 'Entrada' THEN valor
                                         WHEN tipo = 'Saída' THEN -valor ELSE 0 END), 0)
                FROM lancamentos_financeiros
                WHERE LOWER(status) IN ('pago','recebido','confirmado','confirmada')
                """, BigDecimal.class);
        List<Projection> projections = new ArrayList<>();
        if (income.signum() != 0 || expenses.signum() != 0) {
            for (int offset = 1; offset <= 3; offset++) {
                balance = balance.add(income).subtract(expenses);
                projections.add(new Projection(current.plusMonths(offset).toString(), income, expenses, balance));
            }
        }
        LocalDate start = current.atDay(1);
        var goals = jdbc.queryForList("""
                SELECT id, tipo, valor_meta FROM metas WHERE mes_referencia >= ? AND mes_referencia < ?
                ORDER BY id
                """, start, current.plusMonths(1).atDay(1));
        BigDecimal sales = jdbc.queryForObject("""
                SELECT COALESCE(SUM(total),0) FROM vendas WHERE UPPER(status) = 'CONFIRMADA'
                AND data >= ? AND data < ?
                """, BigDecimal.class, start, current.plusMonths(1).atDay(1));
        var stockAlerts = jdbc.queryForList("""
                SELECT m.id, p.nome, m.tipo, m.quantidade, m.motivo, m.data
                FROM movimentacoes_estoque m JOIN produtos p ON p.id = m.produto_id
                WHERE m.origem = 'Conferência' OR m.origem = 'CONFERENCIA'
                   OR m.quantidade > 1.5 * (SELECT AVG(h.quantidade) FROM movimentacoes_estoque h
                        WHERE h.produto_id = m.produto_id AND h.tipo = m.tipo
                        AND h.data < m.data AND h.data >= DATE_SUB(m.data, INTERVAL 90 DAY)
                        HAVING COUNT(*) >= 3)
                ORDER BY m.data DESC, m.id DESC LIMIT 20
                """);
        return Map.of("vendas", sales, "alertasEstoque", stockAlerts,
                "alertaEntradas", income.signum() > 0 && actual.income().compareTo(income.multiply(new BigDecimal("1.5"))) > 0,
                "projecoes", projections, "metas", goals, "entradas", actual.income(),
                "saidas", actual.expenses(), "resultado", actual.net(),
                "alertaSaidas", expenses.signum() > 0 && actual.expenses().compareTo(expenses.multiply(new BigDecimal("1.5"))) > 0,
                "saldoContas", jdbc.queryForObject("SELECT COALESCE(SUM(COALESCE(c.saldo_atual,0) + COALESCE((SELECT SUM(CASE WHEN l.tipo = 'Entrada' THEN l.valor WHEN l.tipo = 'Saída' THEN -l.valor ELSE 0 END) FROM lancamentos_financeiros l WHERE l.conta_financeira_id = c.id AND LOWER(l.status) IN ('pago','recebido','confirmado','confirmada')),0)),0) FROM contas_financeiras c", BigDecimal.class));
    }

    private BigDecimal total(YearMonth month, String type) {
        return jdbc.queryForObject("""
                SELECT COALESCE(SUM(valor),0) FROM lancamentos_financeiros
                WHERE tipo = ? AND LOWER(status) IN ('pago','recebido','confirmado','confirmada')
                AND COALESCE(data_pagamento, data_vencimento) >= ?
                AND COALESCE(data_pagamento, data_vencimento) < ?
                """, BigDecimal.class, type, month.atDay(1), month.plusMonths(1).atDay(1));
    }

    private BigDecimal average(List<BigDecimal> values) {
        return values.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(values.size()), 2, RoundingMode.HALF_UP);
    }
}
