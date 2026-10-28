
package com.parisdevs.api.service;

import com.parisdevs.api.dto.DashboardKpiDto;
import com.parisdevs.api.repository.DashboardRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

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

        DashboardRepository.DashboardKpiProjection resultado =
                dashboardRepository.buscarKpis(inicio, fim, idFilial);

        return new DashboardKpiDto(
                resultado.getSaldoConsolidado(),
                resultado.getEntradas(),
                resultado.getSaidas(),
                resultado.getResultado()
        );
    }
}

