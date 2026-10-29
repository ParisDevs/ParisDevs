package com.parisdevs.api.domain;

import java.util.Locale;

public final class DreRegras {

    public static final double FATOR_LIQUIDO = 0.87;

    private DreRegras() {
    }

    public static boolean isMercadoria(String categoria) {
        String valor = categoria == null ? "" : categoria.toLowerCase(Locale.ROOT);
        if (valor.equals("alimentos")) {
            return true;
        }
        return valor.contains("mercador")
                || valor.contains("alimento")
                || valor.contains("ceagesp")
                || valor.contains("ambev")
                || valor.contains("vinho")
                || valor.contains("fornecedor");
    }

    public static String empresaRelatorio(String razaoSocial) {
        String nome = razaoSocial == null ? "" : razaoSocial;
        String lower = nome.toLowerCase(Locale.ROOT);
        if (lower.contains("vaudeville")) {
            return "A3 - VAUDEVILLE";
        }
        if (lower.contains("classique")) {
            return "B3 - CLASSIQUE";
        }
        if (lower.contains("cave")) {
            return "LA CAVE";
        }
        return nome.isBlank() ? "—" : nome;
    }
}
