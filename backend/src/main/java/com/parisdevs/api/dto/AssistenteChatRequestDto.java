package com.parisdevs.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(name = "AssistenteChatRequest", description = "Pergunta do assistente com o prompt do agente")
public record AssistenteChatRequestDto(
        @Schema(description = "openai, claude ou gemini", example = "gemini") String provedor,
        @Schema(description = "Instruções do agente definidas em Configurações") String instrucoes,
        @Schema(description = "Números do recorte atual, sem dados de credencial") String contexto,
        List<AssistenteMensagemDto> mensagens
) {
}
