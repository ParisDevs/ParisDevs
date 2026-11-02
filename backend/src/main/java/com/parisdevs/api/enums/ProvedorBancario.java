package com.parisdevs.api.enums;

public enum ProvedorBancario {
    ITAU,
    XP,
    PLUGGY;

    public OrigemDados origem() {
        return switch (this) {
            case ITAU -> OrigemDados.ITAU;
            case XP -> OrigemDados.XP;
            case PLUGGY -> OrigemDados.PLUGGY;
        };
    }

    public static ProvedorBancario de(String valor) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException("Informe o provedor.");
        }
        return ProvedorBancario.valueOf(valor.trim().toUpperCase());
    }
}
