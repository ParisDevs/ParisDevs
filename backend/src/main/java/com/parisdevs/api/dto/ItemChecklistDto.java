package com.parisdevs.api.dto;

public record ItemChecklistDto(
        Long id,
        String texto,
        boolean feito,
        int ordem
) {
}
