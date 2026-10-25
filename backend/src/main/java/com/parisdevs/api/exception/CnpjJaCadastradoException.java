package com.parisdevs.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT)
public class CnpjJaCadastradoException extends RuntimeException {

    public CnpjJaCadastradoException() {
        super("O CNPJ informado já está cadastrado no sistema.");
    }
}
