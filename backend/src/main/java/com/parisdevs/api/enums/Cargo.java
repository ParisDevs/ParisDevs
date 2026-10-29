package com.parisdevs.api.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Cargo do usuário")
public enum Cargo {
    ADMINISTRADOR,
    CONTADOR,
    FINANCEIRO,
    GERENTE
}
