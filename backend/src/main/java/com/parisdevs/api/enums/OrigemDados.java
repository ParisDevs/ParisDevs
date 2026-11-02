package com.parisdevs.api.enums;

public enum OrigemDados {
    MANUAL,
    IMPORTACAO,
    ITAU,
    XP,
    PLUGGY;

    public static OrigemDados de(String valor) {
        if (valor == null || valor.isBlank()) {
            return MANUAL;
        }
        return OrigemDados.valueOf(valor.trim().toUpperCase());
    }
}
