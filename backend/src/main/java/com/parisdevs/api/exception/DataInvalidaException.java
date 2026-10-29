package com.parisdevs.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST)
public class DataInvalidaException extends RuntimeException {

    public DataInvalidaException() {
        super("Informe uma data válida no formato YYYY-MM-DD.");
    }
}
