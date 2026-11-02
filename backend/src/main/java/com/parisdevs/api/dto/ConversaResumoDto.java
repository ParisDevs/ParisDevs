package com.parisdevs.api.dto;

import java.time.LocalDateTime;

public record ConversaResumoDto(
        Long id,
        String tipo,
        String tituloExibicao,
        String ultimaMensagem,
        LocalDateTime ultimaEm,
        int naoLidas,
        int membros,
        String foto,
        String cargo,
        String filial,
        boolean podeEscrever
) {
}
