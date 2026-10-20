package com.parisdevs.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST)
public class FilialObrigatoriaException extends RuntimeException{

    public FilialObrigatoriaException() {
        super("A filial é obrigatória para o cadastro do usuário.");
    }
}
