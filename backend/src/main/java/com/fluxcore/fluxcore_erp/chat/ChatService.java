package com.fluxcore.fluxcore_erp.chat;

import com.openai.models.chat.completions.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Semaphore;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import tools.jackson.databind.json.JsonMapper;

@Service
public class ChatService {
    private final ChatProvider provider;
    private final ChatToolCatalog tools;
    private final ChatConfiguration.ChatPrompt prompt;
    private final ChatProperties properties;
    private final JsonMapper json = JsonMapper.builder().build();
    private final Semaphore active = new Semaphore(2);

    public ChatService(ChatProvider provider, ChatToolCatalog tools,
            ChatConfiguration.ChatPrompt prompt, ChatProperties properties) {
        this.provider = provider;
        this.tools = tools;
        this.prompt = prompt;
        this.properties = properties;
    }

    public String responder(ChatRequest request) {
        if (!active.tryAcquire()) throw new ChatFailure(HttpStatus.TOO_MANY_REQUESTS,
                "O assistente está ocupado. Aguarde um instante e tente novamente.");
        try { return conversar(request); }
        finally { active.release(); }
    }

    private String conversar(ChatRequest request) {
        var input = new ArrayList<ChatCompletionMessageParam>();
        for (var message : request.mensagens()) {
            input.add("usuario".equals(message.papel())
                    ? ChatCompletionMessageParam.ofUser(ChatCompletionUserMessageParam.builder().content(message.texto()).build())
                    : ChatCompletionMessageParam.ofAssistant(ChatCompletionAssistantMessageParam.builder().content(message.texto()).build()));
        }
        int executed = 0;
        for (int round = 0; round <= properties.maxIterations(); round++) {
            var response = provider.responder(prompt.text(), List.copyOf(input));
            if (response.calls().isEmpty()) {
                if (response.text() == null || response.text().isBlank()) throw invalidResponse();
                return response.text();
            }
            if (round == properties.maxIterations() || executed + response.calls().size() > 5) {
                throw new ChatFailure(HttpStatus.BAD_GATEWAY, "A consulta ficou longa demais. Faça uma pergunta mais específica.");
            }
            input.addAll(response.continuation());
            for (var call : response.calls()) {
                var result = json.writeValueAsString(tools.execute(call.name(), call.arguments()));
                input.add(ChatCompletionMessageParam.ofTool(ChatCompletionToolMessageParam.builder()
                        .toolCallId(call.id()).content(result).build()));
                executed++;
            }
        }
        throw invalidResponse();
    }

    private ChatFailure invalidResponse() {
        return new ChatFailure(HttpStatus.BAD_GATEWAY, "Não foi possível concluir a consulta. Tente novamente.");
    }
}
