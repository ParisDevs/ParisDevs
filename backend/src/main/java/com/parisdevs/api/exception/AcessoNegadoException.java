package com.parisdevs.api.exception;

public class AcessoNegadoException extends RuntimeException {
    public AcessoNegadoException() {
        super("Você não tem permissão para esta ação.");
    }

    public AcessoNegadoException(String message) {
        super(message);
    }
}
