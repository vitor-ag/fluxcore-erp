package com.fluxcore.fluxcore_erp.api;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/** Tables included in the approved MVP data model. */
public enum MvpResource {
    clientes, fornecedores, categorias_produto, produtos, vendas, venda_itens,
    compras, compra_itens, movimentacoes_estoque, usuarios,
    categorias_financeiras, contas_financeiras, lancamentos_financeiros, metas,
    empresa, previsoes_financeiras, alertas_discrepancia;

    private static final Set<String> TABLES = Arrays.stream(values())
            .map(MvpResource::tableName)
            .collect(Collectors.toUnmodifiableSet());

    public String tableName() {
        return name().toLowerCase(Locale.ROOT);
    }

    public static boolean containsTable(String table) {
        return table != null && TABLES.contains(table.toLowerCase(Locale.ROOT));
    }
}
