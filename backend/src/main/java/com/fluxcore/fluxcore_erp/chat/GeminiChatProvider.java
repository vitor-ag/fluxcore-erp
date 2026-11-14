package com.fluxcore.fluxcore_erp.chat;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.core.Timeout;
import com.openai.errors.OpenAIException;
import com.openai.errors.OpenAIIoException;
import com.openai.errors.OpenAIServiceException;
import com.openai.models.FunctionDefinition;
import com.openai.models.FunctionParameters;
import com.openai.models.ReasoningEffort;
import com.openai.models.chat.completions.*;
import jakarta.annotation.PreDestroy;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class GeminiChatProvider implements ChatProvider {
    private final OpenAIClient client;
    private final ChatProperties properties;

    public GeminiChatProvider(ChatProperties properties) {
        this.properties = properties;
        client = blank(properties.apiKey()) || blank(properties.model()) || blank(properties.baseUrl())
                ? null : OpenAIOkHttpClient.builder().apiKey(properties.apiKey())
                .baseUrl(properties.baseUrl()).timeout(Timeout.builder()
                        .connect(Duration.ofSeconds(5)).read(properties.timeout())
                        .write(properties.timeout()).request(properties.timeout()).build())
                .maxRetries(0).build();
    }

    @Override
    public Turn responder(String prompt, List<ChatCompletionMessageParam> input) {
        if (client == null) throw new ChatFailure(HttpStatus.SERVICE_UNAVAILABLE,
                "O assistente ainda não foi configurado com a chave do Google AI Studio.");
        try {
            // Camada de compatibilidade oficial do Gemini; não usa a Responses API da OpenAI.
            var params = ChatCompletionCreateParams.builder().model(properties.model())
                    .addMessage(ChatCompletionSystemMessageParam.builder().content(prompt).build())
                    .maxTokens((long) properties.maxOutputTokens()).reasoningEffort(ReasoningEffort.LOW);
            input.forEach(params::addMessage);
            for (var tool : ChatToolCatalog.definitions()) {
                var definition = FunctionDefinition.builder().name(tool.name())
                        .description(tool.description().orElse("Consulta somente leitura"))
                        .parameters(FunctionParameters.builder().putAllAdditionalProperties(
                                tool.parameters().orElseThrow()._additionalProperties()).build()).build();
                params.addTool(ChatCompletionFunctionTool.builder().function(definition).build());
            }
            var response = client.chat().completions().create(params.build());
            if (response.choices().size() != 1) throw invalidResponse();
            var choice = response.choices().getFirst();
            var message = choice.message();
            var calls = new ArrayList<ToolCall>();
            for (var call : message.toolCalls().orElse(List.of())) {
                if (!call.isFunction()) throw invalidResponse();
                var function = call.asFunction();
                if (function.id().isBlank()) throw invalidResponse();
                calls.add(new ToolCall(function.id(), function.function().name(), function.function().arguments()));
            }
            var reason = choice.finishReason();
            if (calls.isEmpty() && !reason.equals(ChatCompletion.Choice.FinishReason.STOP)) throw invalidResponse();
            if (!calls.isEmpty() && !reason.equals(ChatCompletion.Choice.FinishReason.TOOL_CALLS)) throw invalidResponse();
            // toParam preserva os metadados das chamadas, incluindo thought signatures do Gemini.
            return new Turn(message.content().orElse(""), List.copyOf(calls),
                    List.of(ChatCompletionMessageParam.ofAssistant(message.toParam())));
        } catch (OpenAIServiceException error) {
            if (error.statusCode() == 429) throw new ChatFailure(HttpStatus.SERVICE_UNAVAILABLE,
                    "A cota de consultas do assistente está indisponível agora. Tente novamente mais tarde.");
            if (error.statusCode() == 401 || error.statusCode() == 403) throw new ChatFailure(HttpStatus.SERVICE_UNAVAILABLE,
                    "Não foi possível autorizar o assistente. Verifique a configuração do Google AI Studio.");
            throw new ChatFailure(HttpStatus.BAD_GATEWAY, "Não foi possível acessar o assistente agora. Tente novamente mais tarde.");
        } catch (OpenAIIoException error) {
            throw new ChatFailure(HttpStatus.GATEWAY_TIMEOUT, "O assistente não respondeu a tempo. Tente novamente.");
        } catch (OpenAIException error) {
            throw invalidResponse();
        }
    }

    private ChatFailure invalidResponse() {
        return new ChatFailure(HttpStatus.BAD_GATEWAY, "Não foi possível concluir a resposta do assistente. Tente novamente.");
    }
    private static boolean blank(String value) { return value == null || value.isBlank(); }
    @PreDestroy void close() { if (client != null) client.close(); }
}
