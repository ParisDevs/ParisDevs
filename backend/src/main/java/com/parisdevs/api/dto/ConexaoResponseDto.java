package com.parisdevs.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ConexaoResponseDto(
        Long idConexao,
        Long idContaBancaria,
        String nomeInstituicao,
        String agencia,
        String numeroConta,
        String filial,
        BigDecimal saldo,
        String provedor,
        String ambiente,
        String status,
        LocalDateTime ultimaSincronizacao,
        String ultimoErro,
        String aviso,
        String statementId,
        String pluggyExecutionStatus,
        boolean credencialConfigurada,
        List<String> faltas
) {
}
