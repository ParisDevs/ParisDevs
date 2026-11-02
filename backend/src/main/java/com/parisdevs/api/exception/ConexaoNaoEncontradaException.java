package com.parisdevs.api.exception;

public class ConexaoNaoEncontradaException extends RuntimeException {
    public ConexaoNaoEncontradaException() {
        super("Conexão não encontrada.");
    }
}
