package com.fluxcore.fluxcore_erp.chat;

import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ChatToolCatalogTest {
    private final SaldoTool saldo = mock(SaldoTool.class);
    private final ChatQueryTools queries = mock(ChatQueryTools.class);
    private final ChatToolCatalog catalog = new ChatToolCatalog(saldo, queries);

    @Test void expõeSomenteSeisFerramentasDeConsulta() {
        assertEquals(java.util.Set.of("saldoRealizado", "pendencias", "lancamentos", "produtosEstoqueBaixo", "buscarProduto", "buscarCliente"),
                ChatToolCatalog.definitions().stream().map(com.openai.models.responses.FunctionTool::name).collect(java.util.stream.Collectors.toSet()));
        assertTrue(ChatToolCatalog.definitions().stream().allMatch(tool -> tool.strict().orElse(false)));
    }

    @Test void despachaTodosFiltrosTipados() {
        catalog.execute("lancamentos", "{\"periodoInicio\":\"2026-01-01\",\"periodoFim\":\"2026-01-31\",\"status\":\"Pendente\",\"tipo\":\"Saída\",\"categoria\":\"Serviços\"}");
        verify(queries).lancamentos(new ChatQueryTools.Filtro(LocalDate.parse("2026-01-01"), LocalDate.parse("2026-01-31"), "Pendente", "Saída", "Serviços"));
        catalog.execute("buscarProduto", "{\"termo\":\"cabo\"}"); verify(queries).buscarProduto("cabo");
        catalog.execute("buscarCliente", "{\"termo\":\"Ana\"}"); verify(queries).buscarCliente("Ana");
        catalog.execute("produtosEstoqueBaixo", "{}"); verify(queries).produtosEstoqueBaixo();
        catalog.execute("pendencias", "{\"tipo\":\"Entrada\"}"); verify(queries).pendencias("Entrada");
    }

    @Test void permiteFiltrosOpcionaisNulos() {
        catalog.execute("lancamentos", "{\"periodoInicio\":null,\"periodoFim\":null,\"status\":null,\"tipo\":null,\"categoria\":null}");
        verify(queries).lancamentos(new ChatQueryTools.Filtro(null, null, null, null, null));
    }

    @Test void rejeitaArgumentosMalformadosExtrasTiposEDatasInvalidasAntesDaConsulta() {
        for (String args : new String[]{"null", "[]", "quebrado", "{\"sql\":\"delete\"}", "{\"periodoInicio\":42}",
                "{\"periodoInicio\":\"2026-02-30\"}", "{\"periodoInicio\":\"01/01/2026\"}", "{\"categoria\":\"" + "a".repeat(101) + "\"}"}) {
            assertTrue(catalog.execute("lancamentos", args) instanceof Map<?, ?>);
        }
        verifyNoInteractions(saldo, queries);
    }

    @Test void ferramentaDesconhecidaNaoExecutaNada() {
        assertThrows(ChatFailure.class, () -> catalog.execute("excluirCliente", "{}"));
        verifyNoInteractions(saldo, queries);
    }

    @Test void falhaDeBancoNaoSeTornaListaVaziaNemDetalheParaIA() {
        when(queries.produtosEstoqueBaixo()).thenThrow(new IllegalStateException("banco indisponível"));
        assertThrows(IllegalStateException.class, () -> catalog.execute("produtosEstoqueBaixo", "{}"));
    }
}
