package com.fluxcore.fluxcore_erp.chat;

import com.fluxcore.fluxcore_erp.domain.Lancamento;
import com.fluxcore.fluxcore_erp.repository.LancamentoRepository;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SaldoToolTest {
    private final LancamentoRepository repository = mock(LancamentoRepository.class);
    private final SaldoTool tool = new SaldoTool(repository);

    private Lancamento item(String tipo, String status, String valor) {
        var item = new Lancamento();
        item.setTipo(tipo); item.setStatus(status); item.setValor(new BigDecimal(valor));
        return item;
    }

    @Test void somaSomenteConcluidosEmCaixaMistaSemCancelados() {
        when(repository.findAll()).thenReturn(List.of(
                item("Entrada", "pAgO", "0.10"), item("Entrada", "RECEBIDO", "0.20"),
                item("Entrada", "Confirmado", "10.00"), item("Saída", "cOnFiRmAdA", "3.00"),
                item("Entrada", "Pendente", "1000"), item("Saída", "Pendente", "500"),
                item("Entrada", "Cancelado", "900"), item("Saída", "CANCELADA", "800"),
                item("Entrada", null, "50")));
        var result = tool.consultar();
        assertEquals(new BigDecimal("10.30"), result.entradasConcluidas());
        assertEquals(new BigDecimal("3.00"), result.saidasConcluidas());
        assertEquals(new BigDecimal("7.30"), result.saldoRealizado());
        assertEquals(4, result.quantidadeConcluidos());
        assertFalse(result.semLancamentos());
        verify(repository).findAll();
        verifyNoMoreInteractions(repository);
    }

    @Test void bancoVazioRetornaZeroComIndicacaoDeAusencia() {
        when(repository.findAll()).thenReturn(List.of());
        assertTrue(tool.consultar().semLancamentos());
        assertEquals(new BigDecimal("0.00"), tool.consultar().saldoRealizado());
    }

    @Test void saldoNegativoNaoViraSaldoBancarioNemLucro() {
        when(repository.findAll()).thenReturn(List.of(item("Saída", "Pago", "17.35")));
        assertEquals(new BigDecimal("-17.35"), tool.consultar().saldoRealizado());
    }
}
