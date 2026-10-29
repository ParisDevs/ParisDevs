package com.parisdevs.api.exception;

public class TokenExpiradoException extends RuntimeException {

    public TokenExpiradoException() {
        super("Sessão expirada. Entre novamente.");
    }
}
