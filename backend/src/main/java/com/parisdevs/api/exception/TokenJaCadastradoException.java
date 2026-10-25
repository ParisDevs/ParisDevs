package com.parisdevs.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT)
public class TokenJaCadastradoException extends RuntimeException {

    public TokenJaCadastradoException() {
        super("O token informado já está associado a outra filial.");
    }
}
