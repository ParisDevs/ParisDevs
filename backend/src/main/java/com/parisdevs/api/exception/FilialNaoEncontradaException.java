package com.parisdevs.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.NOT_FOUND)
public class FilialNaoEncontradaException extends RuntimeException{

    public FilialNaoEncontradaException() {
        super("A filial informada não foi encontrada no sistema.");
    }

}
