
package com.parisdevs.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
//Indentificação da conta bancária
public record ContaOfxDTO(
        String bancoId,
        String numeroConta,
        String tipoConta,
        String moeda,
        BigDecimal saldo,
        LocalDateTime dataSaldo
) {
}

