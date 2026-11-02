package com.parisdevs.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.CONFLICT)
public class OperacaoDuplicadaException extends RuntimeException {

    public OperacaoDuplicadaException() {
        super("Este lançamento já existe nesta conta e não foi importado de novo.");
    }
}
