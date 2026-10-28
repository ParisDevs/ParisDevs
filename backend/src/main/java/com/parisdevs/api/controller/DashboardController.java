
package com.parisdevs.api.controller;

import com.parisdevs.api.dto.DashboardKpiDto;
import com.parisdevs.api.service.DashboardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "http://localhost:5174")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/kpis")
    public ResponseEntity<DashboardKpiDto> buscarKpis(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim,

            @RequestParam(required = false)
            Integer idFilial) {

        return ResponseEntity.ok(
                dashboardService.buscarKpis(inicio, fim, idFilial)
        );
    }
}

