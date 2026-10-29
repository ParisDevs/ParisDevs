package com.parisdevs.api.controller;

import com.parisdevs.api.dto.DreGerarRequestDto;
import com.parisdevs.api.dto.DreHistoricoItemDto;
import com.parisdevs.api.dto.DreRelatorioDto;
import com.parisdevs.api.service.DreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "DRE")
@RestController
@RequestMapping("/dre")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class DreController {

    private final DreService dreService;

    public DreController(DreService dreService) {
        this.dreService = dreService;
    }

    @Operation(summary = "Consultar DRE do dia (D-1 por padrão)")
    @GetMapping
    public ResponseEntity<DreRelatorioDto> consultar(
            @Parameter(description = "Data de referência. Omitir para D-1.", example = "2026-10-28")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate data,
            @Parameter(description = "Filial. Omitir para o grupo.", example = "1")
            @RequestParam(required = false)
            Integer idFilial) {
        return ResponseEntity.ok(dreService.consultar(data, idFilial));
    }

    @Operation(summary = "Listar histórico de DRE gravada")
    @GetMapping("/historico")
    public ResponseEntity<List<DreHistoricoItemDto>> historico(
            @Parameter(description = "Filial. Omitir para o grupo.", example = "1")
            @RequestParam(required = false)
            Integer idFilial) {
        return ResponseEntity.ok(dreService.historico(idFilial));
    }

    @Operation(summary = "Consultar DRE de uma data do histórico")
    @GetMapping("/historico/{data}")
    public ResponseEntity<DreRelatorioDto> historicoDia(
            @Parameter(description = "Data de referência", example = "2026-10-28")
            @PathVariable
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate data,
            @Parameter(description = "Filial. Omitir para o grupo.", example = "1")
            @RequestParam(required = false)
            Integer idFilial) {
        return ResponseEntity.ok(dreService.consultar(data, idFilial));
    }

    @Operation(summary = "Gerar ou atualizar snapshot da DRE")
    @PostMapping("/gerar")
    public ResponseEntity<DreRelatorioDto> gerar(@RequestBody(required = false) DreGerarRequestDto request) {
        return ResponseEntity.ok(dreService.gerar(request));
    }
}
