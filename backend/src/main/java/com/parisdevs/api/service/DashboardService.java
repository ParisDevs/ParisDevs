package com.parisdevs.api.service;

import com.parisdevs.api.dto.DashboardKpiDto;
import com.parisdevs.api.enums.TipoOperacao;
import com.parisdevs.api.repository.DashboardRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    public DashboardService(DashboardRepository dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }

    public DashboardKpiDto buscarKpis(
            LocalDate inicio,
            LocalDate fim,
            Integer idFilial) {

        if (inicio == null || fim == null || !inicio.isBefore(fim)) {
            throw new IllegalArgumentException(
                    "O período informado é inválido."
            );
        }

        LocalDateTime inicioDt = inicio.atStartOfDay();
        LocalDateTime fimDt = fim.atStartOfDay();

        BigDecimal saldo = money(dashboardRepository.saldoConsolidado(idFilial));
        BigDecimal entradas = money(dashboardRepository.somaOperacoes(
                inicioDt, fimDt, TipoOperacao.RECEBIMENTO, idFilial));
        BigDecimal saidas = money(dashboardRepository.somaOperacoes(
                inicioDt, fimDt, TipoOperacao.PAGAMENTO, idFilial));

        return new DashboardKpiDto(saldo, entradas, saidas, entradas.subtract(saidas));
    }

    private static BigDecimal money(Number value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal decimal) {
            return decimal;
        }
        return BigDecimal.valueOf(value.doubleValue());
    }
}
