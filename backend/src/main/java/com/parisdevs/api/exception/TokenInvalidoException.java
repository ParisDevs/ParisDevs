package com.parisdevs.api.exception;

public class TokenInvalidoException extends RuntimeException {

    public TokenInvalidoException() {
        super("Token inválido.");
    }
}
