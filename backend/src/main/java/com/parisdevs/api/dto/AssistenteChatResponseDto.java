package com.parisdevs.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "AssistenteChatResponse")
public record AssistenteChatResponseDto(
        @Schema(description = "Resposta do modelo") String texto
) {
}
