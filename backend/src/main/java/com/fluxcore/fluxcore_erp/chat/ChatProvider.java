package com.fluxcore.fluxcore_erp.chat;

import com.openai.models.chat.completions.ChatCompletionMessageParam;
import java.util.List;

public interface ChatProvider {
    record ToolCall(String id, String name, String arguments) {}
    record Turn(String text, List<ToolCall> calls, List<ChatCompletionMessageParam> continuation) {}
    Turn responder(String prompt, List<ChatCompletionMessageParam> input);
}
