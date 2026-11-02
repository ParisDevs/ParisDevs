package com.parisdevs.api.dto;

import java.time.LocalDateTime;

public record MensagemResponseDto(
        Long id,
        Integer autorId,
        String autorNome,
        String autorFoto,
        String texto,
        LocalDateTime criadoEm,
        boolean propria,
        boolean editada,
        boolean podeEditar
) {
}
