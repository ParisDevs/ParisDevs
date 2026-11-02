package com.parisdevs.api.dto;

public record ItemChecklistPatchDto(
        String texto,
        Boolean feito,
        Integer ordem
) {
}
