package com.parisdevs.api.exception;

public class ProvedorNaoConfiguradoException extends RuntimeException {
    public ProvedorNaoConfiguradoException(String provedor) {
        super("Informe a credencial de " + provedor + " no servidor. Ela não fica no navegador.");
    }
}
