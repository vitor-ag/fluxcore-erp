package com.fluxcore.fluxcore_erp.chat;

import java.time.Clock;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class ChatRateLimiter {
    private record Window(long start, int count) {}
    private final Map<String, Window> windows = new HashMap<>();
    private final Clock clock;
    private final int limit;

    @org.springframework.beans.factory.annotation.Autowired
    public ChatRateLimiter(ChatProperties properties) { this(properties.requestsPerMinute(), Clock.systemUTC()); }
    ChatRateLimiter(int limit, Clock clock) { this.limit = limit; this.clock = clock; }

    public synchronized void acquire(String address) {
        long now = clock.millis();
        windows.entrySet().removeIf(entry -> now - entry.getValue().start() >= 60000);
        var window = windows.get(address);
        if (window == null) {
            if (windows.size() >= 10000) throw limited();
            window = new Window(now, 0);
        }
        if (window.count() >= limit) throw limited();
        windows.put(address, new Window(window.start(), window.count() + 1));
    }

    private ChatFailure limited() {
        return new ChatFailure(HttpStatus.TOO_MANY_REQUESTS, "Muitas perguntas em pouco tempo. Aguarde um minuto e tente novamente.");
    }
}
