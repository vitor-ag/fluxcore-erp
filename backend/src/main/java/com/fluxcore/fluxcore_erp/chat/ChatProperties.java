package com.fluxcore.fluxcore_erp.chat;

import java.time.Duration;
import jakarta.validation.constraints.*;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties("fluxcore.chat")
public record ChatProperties(String apiKey, String model, String baseUrl, @NotNull Duration timeout,
        @Min(100) @Max(2000) int maxOutputTokens, @Min(1) @Max(5) int maxIterations,
        @Min(1) @Max(60) int requestsPerMinute) {
    @AssertTrue
    public boolean isTimeoutValido() {
        return timeout != null && !timeout.isNegative() && !timeout.isZero() && timeout.toSeconds() <= 30;
    }

    @Override public String toString() { return "ChatProperties[configuração protegida]"; }
}
