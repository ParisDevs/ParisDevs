package com.parisdevs.api.dto;

import java.time.LocalDate;

public record SincronizarRequestDto(LocalDate inicio, LocalDate fim, Integer idFilial) {
}
