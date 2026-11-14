package com.fluxcore.fluxcore_erp.chat;

import java.time.Clock;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ChatRateLimiterTest {
    @Test void renovaJanelaESepareEnderecos() {
        var clock = mock(Clock.class);
        when(clock.millis()).thenReturn(0L);
        var limiter = new ChatRateLimiter(1, clock);
        limiter.acquire("a");
        assertThrows(ChatFailure.class, () -> limiter.acquire("a"));
        assertDoesNotThrow(() -> limiter.acquire("b"));
        when(clock.millis()).thenReturn(60000L);
        assertDoesNotThrow(() -> limiter.acquire("a"));
    }
}
