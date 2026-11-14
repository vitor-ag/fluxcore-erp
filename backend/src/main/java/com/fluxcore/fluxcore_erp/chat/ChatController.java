package com.fluxcore.fluxcore_erp.chat;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService service;
    private final ChatRateLimiter limiter;

    public ChatController(ChatService service, ChatRateLimiter limiter) {
        this.service = service;
        this.limiter = limiter;
    }

    public record ChatResponse(String resposta) {}

    @PostMapping
    public ChatResponse enviar(@Valid @RequestBody ChatRequest request, HttpServletRequest servlet) {
        // Não confiar em X-Forwarded-For enviado pelo próprio cliente.
        limiter.acquire(servlet.getRemoteAddr());
        return new ChatResponse(service.responder(request));
    }
}
