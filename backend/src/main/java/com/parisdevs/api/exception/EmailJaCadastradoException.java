package com.parisdevs.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT)
public class EmailJaCadastradoException extends RuntimeException {

    public EmailJaCadastradoException() {
        super("O e-mail informado já está cadastrado no sistema.");
    }

}
