
package com.parisdevs.api.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ImportacaoExtratoResponse(
        ContaOfxDTO conta,
        LocalDateTime periodoInicio,
        LocalDateTime periodoFim,
        List<TransacaoOfxDTO> transacoes
) {
    public ImportacaoExtratoResponse {
        transacoes = List.copyOf(transacoes);
    }
}
