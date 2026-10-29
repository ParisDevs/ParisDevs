

package com.parisdevs.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(name = "DashboardKpi", description = "Indicadores do recorte de período")
public record DashboardKpiDto(
        @Schema(description = "Saldo consolidado das contas", example = "25000.00") BigDecimal saldoConsolidado,
        @Schema(description = "Soma dos recebimentos", example = "18000.00") BigDecimal entradas,
        @Schema(description = "Soma dos pagamentos", example = "9200.00") BigDecimal saidas,
        @Schema(description = "Entradas menos saídas", example = "8800.00") BigDecimal resultado
) {
}

