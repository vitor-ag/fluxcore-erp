package com.fluxcore.fluxcore_erp.chat;

import com.openai.models.chat.completions.*;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ChatServiceTest {
    private final ChatProvider provider = mock(ChatProvider.class);
    private final SaldoTool saldo = mock(SaldoTool.class);
    private final ChatQueryTools queries = mock(ChatQueryTools.class);
    private final ChatService service = new ChatService(provider, new ChatToolCatalog(saldo, queries),
            new ChatConfiguration.ChatPrompt("instruções"),
            new ChatProperties("", "", "", Duration.ofSeconds(20), 800, 2, 10));
    private final ChatRequest request = new ChatRequest(List.of(new ChatRequest.Mensagem("usuario", "Qual o saldo?")));

    private ChatProvider.Turn call(String name, String arguments) {
        var call = ChatCompletionMessageFunctionToolCall.builder().id("call-1")
                .function(ChatCompletionMessageFunctionToolCall.Function.builder().name(name).arguments(arguments).build()).build();
        return new ChatProvider.Turn("", List.of(new ChatProvider.ToolCall("call-1", name, arguments)),
                List.of(ChatCompletionMessageParam.ofAssistant(ChatCompletionAssistantMessageParam.builder().addToolCall(call).build())));
    }

    @Test void executaFerramentaEEnviaResultadoComCallId() {
        var zero = java.math.BigDecimal.ZERO;
        when(saldo.consultar()).thenReturn(new SaldoTool.Saldo(zero, zero, zero, "R$ 0,00", "R$ 0,00", "R$ 0,00", 0, true));
        when(provider.responder(anyString(), anyList())).thenReturn(call("saldoRealizado", "{}"),
                new ChatProvider.Turn("Nenhum lançamento registrado.", List.of(), List.of()));
        assertEquals("Nenhum lançamento registrado.", service.responder(request));
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<ChatCompletionMessageParam>> inputs = ArgumentCaptor.forClass(List.class);
        verify(provider, times(2)).responder(eq("instruções"), inputs.capture());
        var output = inputs.getAllValues().get(1).getLast().asTool();
        assertEquals("call-1", output.toolCallId());
        assertTrue(output.content().asText().contains("semLancamentos"));
        verify(saldo).consultar();
    }

    @Test void bloqueiaFerramentaDesconhecida() {
        when(provider.responder(anyString(), anyList())).thenReturn(call("excluir", "{}"));
        assertThrows(ChatFailure.class, () -> service.responder(request));
        verifyNoInteractions(saldo);
    }

    @Test void rejeitaArgumentosExtrasOuJsonInvalido() {
        for (String args : List.of("{\"id\":1}", "quebrado", "[]", "null")) {
            when(provider.responder(anyString(), anyList())).thenReturn(call("saldoRealizado", args));
            assertThrows(ChatFailure.class, () -> service.responder(request));
        }
        verifyNoInteractions(saldo);
    }

    @Test void encerraLacoInfinito() {
        when(provider.responder(anyString(), anyList())).thenReturn(call("saldoRealizado", "{}"));
        when(saldo.consultar()).thenReturn(null);
        assertThrows(ChatFailure.class, () -> service.responder(request));
        verify(provider, times(3)).responder(anyString(), anyList());
        verify(saldo, times(2)).consultar();
    }

    @Test void rejeitaRespostaVazia() {
        when(provider.responder(anyString(), anyList())).thenReturn(new ChatProvider.Turn(" ", List.of(), List.of()));
        assertThrows(ChatFailure.class, () -> service.responder(request));
    }

    @Test void propagaFalhaControladaSemInventarSaldo() {
        when(provider.responder(anyString(), anyList())).thenThrow(new ChatFailure(org.springframework.http.HttpStatus.GATEWAY_TIMEOUT, "Tente novamente."));
        assertThrows(ChatFailure.class, () -> service.responder(request));
        verifyNoInteractions(saldo);
    }

    @Test void devolveErroDaFerramentaComoDadoSemConsultarBanco() {
        when(provider.responder(anyString(), anyList())).thenReturn(call("pendencias", "{\"tipo\":42}"),
                new ChatProvider.Turn("Você quer consultar entradas ou saídas?", List.of(), List.of()));
        assertEquals("Você quer consultar entradas ou saídas?", service.responder(request));
        verifyNoInteractions(queries);
        verifyNoInteractions(saldo);
    }

    @Test void permiteSequenciaDeConsultasDiferentes() {
        when(queries.pendencias("Entrada")).thenReturn(null);
        when(queries.produtosEstoqueBaixo()).thenReturn(new ChatQueryTools.Lista<>(List.of(), 0, 20, false));
        when(provider.responder(anyString(), anyList())).thenReturn(call("pendencias", "{\"tipo\":\"Entrada\"}"),
                call("produtosEstoqueBaixo", "{}"), new ChatProvider.Turn("Consulta concluída.", List.of(), List.of()));
        assertEquals("Consulta concluída.", service.responder(request));
        verify(queries).pendencias("Entrada");
        verify(queries).produtosEstoqueBaixo();
        verifyNoInteractions(saldo);
    }
}
