package com.fluxcore.fluxcore_erp.chat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

@Configuration
@EnableConfigurationProperties(ChatProperties.class)
public class ChatConfiguration {
    @Bean
    ChatPrompt chatPrompt() throws IOException {
        var resource = new ClassPathResource("prompts/system.md");
        return new ChatPrompt(resource.getContentAsString(StandardCharsets.UTF_8));
    }

    public record ChatPrompt(String text) {}
}
