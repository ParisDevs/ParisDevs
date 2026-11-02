package com.parisdevs.api.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record EventoPessoalDto(
        Long id,
        String titulo,
        LocalDate data,
        LocalTime horaInicio,
        String notas,
        boolean feito,
        LocalDateTime criadoEm
) {
}
