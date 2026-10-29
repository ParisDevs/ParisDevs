package com.parisdevs.api.exception;

public class TokenAusenteException extends RuntimeException {

    public TokenAusenteException() {
        super("Informe o token de acesso.");
    }
}
