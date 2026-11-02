package com.parisdevs.api.exception;

public class AssistenteNaoConfiguradoException extends RuntimeException {

    public AssistenteNaoConfiguradoException(String provedor) {
        super("O assistente ainda não tem chave do " + provedor
                + ". Salve a chave em Configurações, API de IA, ou defina a variável correspondente no servidor.");
    }
}
