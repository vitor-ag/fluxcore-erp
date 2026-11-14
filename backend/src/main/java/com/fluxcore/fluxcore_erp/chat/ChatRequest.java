package com.fluxcore.fluxcore_erp.chat;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record ChatRequest(
        @NotEmpty @Size(max = 20) List<@NotNull @Valid Mensagem> mensagens) {
    public record Mensagem(
            @NotNull @Pattern(regexp = "usuario|assistente") String papel,
            @NotBlank @Size(max = 2000) String texto) {}

    @AssertTrue
    public boolean isHistoricoValido() {
        if (mensagens == null || mensagens.isEmpty()) return true;
        int total = 0;
        for (int i = 0; i < mensagens.size(); i++) {
            var mensagem = mensagens.get(i);
            if (mensagem == null) return false;
            if (!(i % 2 == 0 ? "usuario" : "assistente").equals(mensagem.papel())) return false;
            if (mensagem.texto() != null) total += mensagem.texto().length();
        }
        return mensagens.size() % 2 == 1 && total <= 16000;
    }
}
