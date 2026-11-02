package com.parisdevs.api.dto;

public record ConexaoRequestDto(
        Long idContaBancaria,
        String provedor,
        String ambiente,
        String digitoVerificador,
        String tipoContaItau,
        String cname,
        String ips,
        Boolean avaliacaoSolicitada
) {
}
