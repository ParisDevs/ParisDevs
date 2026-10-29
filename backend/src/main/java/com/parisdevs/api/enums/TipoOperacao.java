package com.parisdevs.api.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Tipo da operação de caixa")
public enum TipoOperacao {

    RECEBIMENTO,
    PAGAMENTO
}
