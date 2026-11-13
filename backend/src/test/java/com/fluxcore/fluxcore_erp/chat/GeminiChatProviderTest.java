package com.fluxcore.fluxcore_erp.chat;

import com.sun.net.httpserver.HttpServer;
import com.openai.models.chat.completions.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.*;
import tools.jackson.databind.json.JsonMapper;
import static org.junit.jupiter.api.Assertions.*;

class GeminiChatProviderTest {
    private HttpServer server;
    private GeminiChatProvider provider;
    private int status = 200;
    private String body;
    private long delay;
    private final AtomicInteger requests = new AtomicInteger();
    private final AtomicReference<String> request = new AtomicReference<>();
    private final AtomicReference<String> authorization = new AtomicReference<>();
    private final JsonMapper json = JsonMapper.builder().build();

    private static final String TOOL_RESPONSE = """
            {"id":"resp-1","object":"chat.completion","created":1,"model":"modelo-simulado","choices":[
            {"index":0,"finish_reason":"tool_calls","message":{"role":"assistant","content":null,"tool_calls":[
            {"id":"call-1","type":"function","function":{"name":"saldoRealizado","arguments":"{}"},
            "extra_content":{"google":{"thought_signature":"assinatura-simulada"}}}]}}]}
            """;
    private static final String FINAL_RESPONSE = """
            {"id":"resp-2","object":"chat.completion","created":1,"model":"modelo-simulado","choices":[
            {"index":0,"finish_reason":"stop","message":{"role":"assistant","content":"Nenhum lançamento registrado."}}]}
            """;

    @BeforeEach void setup() throws Exception {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/chat/completions", exchange -> {
            requests.incrementAndGet();
            request.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
            if (delay > 0) {
                try { Thread.sleep(delay); } catch (InterruptedException interrupted) { Thread.currentThread().interrupt(); }
            }
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, bytes.length);
            try (var output = exchange.getResponseBody()) { output.write(bytes); }
        });
        server.start();
        provider = configured(Duration.ofSeconds(2));
    }

    private GeminiChatProvider configured(Duration timeout) {
        return new GeminiChatProvider(new ChatProperties("chave-falsa-gemini", "modelo-simulado",
                "http://127.0.0.1:" + server.getAddress().getPort(), timeout, 800, 5, 10));
    }
    @AfterEach void cleanup() { provider.close(); server.stop(0); }

    @Test void usaChatCompletionsComChaveSomenteNoHeaderESeisFerramentas() {
        body = TOOL_RESPONSE;
        var result = provider.responder("instruções", List.of());
        assertEquals("saldoRealizado", result.calls().getFirst().name());
        var payload = json.readTree(request.get());
        assertEquals("Bearer chave-falsa-gemini", authorization.get());
        assertFalse(request.get().contains("chave-falsa"));
        assertEquals("modelo-simulado", payload.get("model").asString());
        assertEquals(800, payload.get("max_tokens").asInt());
        assertEquals("system", payload.get("messages").get(0).get("role").asString());
        assertEquals("instruções", payload.get("messages").get(0).get("content").asString());
        assertEquals(6, payload.get("tools").size());
        assertFalse(payload.has("instructions"));
        assertFalse(payload.has("input"));
        for (var tool : payload.get("tools")) {
            assertEquals("function", tool.get("type").asString());
            assertTrue(tool.get("function").has("parameters"));
        }
    }

    @Test void preservaAssinaturaDoGeminiECallIdNaRodadaSeguinte() {
        body = TOOL_RESPONSE;
        var first = provider.responder("prompt", List.of());
        var followUp = new ArrayList<>(first.continuation());
        followUp.add(ChatCompletionMessageParam.ofTool(ChatCompletionToolMessageParam.builder()
                .toolCallId("call-1").content("{\"saldoRealizado\":0}").build()));
        body = FINAL_RESPONSE;
        assertEquals("Nenhum lançamento registrado.", provider.responder("prompt", followUp).text());
        var messages = json.readTree(request.get()).get("messages");
        assertEquals("assinatura-simulada", messages.get(1).get("tool_calls").get(0)
                .get("extra_content").get("google").get("thought_signature").asString());
        assertEquals("call-1", messages.get(2).get("tool_call_id").asString());
        assertEquals(2, requests.get());
    }

    @Test void trataCotaSemVazarDetalhesNemRepetirChamadas() {
        status = 429;
        body = "{\"error\":{\"message\":\"segredo-interno\",\"status\":\"RESOURCE_EXHAUSTED\"}}";
        var error = assertThrows(ChatFailure.class, () -> provider.responder("prompt", List.of()));
        assertEquals(503, error.status().value());
        assertFalse(error.getMessage().contains("segredo-interno"));
        assertEquals(1, requests.get());
    }

    @Test void trataChaveSemPermissao() {
        status = 403; body = "{\"error\":{\"message\":\"chave-falsa-gemini\"}}";
        var error = assertThrows(ChatFailure.class, () -> provider.responder("prompt", List.of()));
        assertEquals(503, error.status().value()); assertFalse(error.getMessage().contains("chave-falsa"));
    }

    @Test void rejeitaRespostaCortadaOuBloqueada() {
        for (String reason : List.of("length", "content_filter")) {
            body = FINAL_RESPONSE.replace("\"stop\"", "\"" + reason + "\"");
            assertEquals(502, assertThrows(ChatFailure.class, () -> provider.responder("prompt", List.of())).status().value());
        }
    }

    @Test void semChaveNaoChamaRede() {
        var disabled = new GeminiChatProvider(new ChatProperties("", "gemini-3.5-flash-lite", "https://generativelanguage.googleapis.com/v1beta/openai/", Duration.ofSeconds(2), 800, 5, 10));
        assertEquals(503, assertThrows(ChatFailure.class, () -> disabled.responder("prompt", List.of())).status().value());
        assertEquals(0, requests.get());
    }

    @Test void falhaDoProvedorViraBadGateway() {
        status = 500; body = "{\"error\":{\"message\":\"segredo\"}}";
        assertEquals(502, assertThrows(ChatFailure.class, () -> provider.responder("prompt", List.of())).status().value());
    }

    @Test void timeoutNaoRepeteRequisicao() {
        provider.close(); provider = configured(Duration.ofMillis(500)); body = "{}"; delay = 1500;
        assertEquals(504, assertThrows(ChatFailure.class, () -> provider.responder("prompt", List.of())).status().value());
    }
}
