package com.fluxcore.fluxcore_erp.chat;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice(assignableTypes = ChatController.class)
public class ChatErrors {
    @ExceptionHandler(ChatFailure.class)
    ResponseEntity<Map<String, String>> failure(ChatFailure error) {
        var builder = ResponseEntity.status(error.status());
        if (error.status().value() == 429) builder.header("Retry-After", "60");
        return builder.body(Map.of("mensagem", error.getMessage()));
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, HttpMessageNotReadableException.class})
    ResponseEntity<Map<String, String>> invalid(Exception error) {
        return ResponseEntity.badRequest().body(Map.of("mensagem",
                "Envie um histórico alternado, começando e terminando com sua pergunta, com até 20 mensagens e 2.000 caracteres por texto."));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> unexpected(Exception error) {
        return ResponseEntity.internalServerError().body(Map.of("mensagem", "Não foi possível consultar os dados agora. Tente novamente."));
    }
}
