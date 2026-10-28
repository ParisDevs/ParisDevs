

package com.parisdevs.api.dto;

import java.math.BigDecimal;

public record DashboardKpiDto(
        BigDecimal saldoConsolidado,
        BigDecimal entradas,
        BigDecimal saidas,
        BigDecimal resultado
) {
}

