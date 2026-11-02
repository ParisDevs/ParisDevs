package com.parisdevs.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "AssistenteCredencialRequest", description = "Chave enviada uma vez. Não é devolvida.")
public record AssistenteCredencialRequestDto(
        @Schema(description = "openai, claude ou gemini", example = "claude") String provedor,
        @Schema(description = "Chave do provedor. Vazio revoga a chave salva nesta execução.") String chave
) {
}
