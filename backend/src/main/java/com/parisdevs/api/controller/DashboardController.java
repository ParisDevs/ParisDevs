
package com.parisdevs.api.controller;

import com.parisdevs.api.dto.DashboardKpiDto;
import com.parisdevs.api.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Tag(name = "Dashboard")
@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Operation(summary = "Consultar KPIs do dashboard")
    @GetMapping("/kpis")
    public ResponseEntity<DashboardKpiDto> buscarKpis(
            @Parameter(description = "Início do recorte (inclusive)", example = "2026-10-01")
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @Parameter(description = "Fim do recorte (exclusive)", example = "2026-11-01")
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim,

            @Parameter(description = "Filial. Omitir para o grupo inteiro.", example = "1")
            @RequestParam(required = false)
            Integer idFilial) {

        return ResponseEntity.ok(
                dashboardService.buscarKpis(inicio, fim, idFilial)
        );
    }
}

