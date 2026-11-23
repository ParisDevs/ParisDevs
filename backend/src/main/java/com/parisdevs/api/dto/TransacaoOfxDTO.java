
package com.parisdevs.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
//Movimentação bancária encontrada no arquivo
public record TransacaoOfxDTO(
        //código único da transação no OFX (FITID
        String identificador,

        //Crédito ou Débito
        String tipo,
        LocalDateTime data,
        BigDecimal valor,
        String descricao,
        String observacao
) {
}

