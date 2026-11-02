package com.parisdevs.api.exception;

public class OperacaoProtegidaException extends RuntimeException {
    public OperacaoProtegidaException() {
        super("Lançamento vindo do banco. A correção é uma nova sincronização.");
    }
}
