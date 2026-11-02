package com.parisdevs.api.dto;

import java.time.LocalDate;

public record EventoPessoalRequestDto(
        String titulo,
        LocalDate data,
        String horaInicio,
        String notas,
        Boolean feito
) {
}
