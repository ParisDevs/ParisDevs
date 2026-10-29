package com.parisdevs.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST)
public class CnpjInvalidoException extends RuntimeException {

    public CnpjInvalidoException() {
        super("O CNPJ deve ter 14 dígitos.");
    }
}
