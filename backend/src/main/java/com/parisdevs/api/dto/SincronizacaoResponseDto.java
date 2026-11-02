package com.parisdevs.api.dto;

import java.util.List;

public record SincronizacaoResponseDto(
        int novas,
        int atualizadas,
        String status,
        String aviso,
        List<String> faltas
) {
}
