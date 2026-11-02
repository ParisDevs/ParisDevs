package com.parisdevs.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "AssistenteMensagem", description = "Uma fala da conversa")
public record AssistenteMensagemDto(
        @Schema(description = "user ou assistant", example = "user") String papel,
        @Schema(description = "Texto da mensagem", example = "Qual o saldo de novembro?") String texto
) {
}
