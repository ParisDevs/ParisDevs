package com.parisdevs.api.enums;

public enum AmbienteConexao {
    SANDBOX,
    PRODUCAO;

    public static AmbienteConexao de(String valor) {
        if (valor == null || valor.isBlank()) {
            return SANDBOX;
        }
        return AmbienteConexao.valueOf(valor.trim().toUpperCase());
    }
}
