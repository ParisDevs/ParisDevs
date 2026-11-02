package com.parisdevs.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "AssistenteStatus")
public record AssistenteStatusDto(
        @Schema(description = "Há chave utilizável para o provedor pedido") boolean configurado,
        @Schema(description = "ambiente, painel ou nenhuma", example = "painel") String origem,
        @Schema(description = "openai, claude ou gemini", example = "claude") String provedor
) {
}
