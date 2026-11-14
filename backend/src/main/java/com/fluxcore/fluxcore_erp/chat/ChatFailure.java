package com.fluxcore.fluxcore_erp.chat;

import org.springframework.http.HttpStatus;

public final class ChatFailure extends RuntimeException {
    private final HttpStatus status;

    public ChatFailure(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus status() { return status; }
}
