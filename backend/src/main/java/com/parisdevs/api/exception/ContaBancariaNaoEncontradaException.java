package com.parisdevs.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.NOT_FOUND)
public class ContaBancariaNaoEncontradaException extends RuntimeException {

    public ContaBancariaNaoEncontradaException() {
        super("A conta bancaria informada não foi encontrada no sistema");
    }
}
