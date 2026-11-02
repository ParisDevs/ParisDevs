package com.parisdevs.api.exception;

public class EquipeNaoEncontradoException extends RuntimeException {
    public EquipeNaoEncontradoException() {
        super("Não encontrado.");
    }

    public EquipeNaoEncontradoException(String message) {
        super(message);
    }
}
