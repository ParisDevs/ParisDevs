package com.parisdevs.api.controller;

import com.parisdevs.api.dto.OperacaoRequestDto;
import com.parisdevs.api.dto.OperacaoResponseDto;
import com.parisdevs.api.entity.Operacao;
import com.parisdevs.api.mapper.OperacaoMapper;
import com.parisdevs.api.service.OperacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Operações")
@RestController
@RequestMapping("/operacoes")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class OperacaoController {

    private final OperacaoService operacaoService;

    public OperacaoController(OperacaoService operacaoService) {
        this.operacaoService = operacaoService;
    }

    @Operation(summary = "Listar operações")
    @GetMapping
    public ResponseEntity<List<OperacaoResponseDto>> listar() {

        List<Operacao> operacoes = operacaoService.listarOperacoes();
        return ResponseEntity.status(200).body(OperacaoMapper.toResponseDto(operacoes));
    }

    @Operation(summary = "Buscar operação por id")
    @GetMapping("/{id}")
    public ResponseEntity<OperacaoResponseDto> buscarPorId(
            @Parameter(description = "Identificador da operação", example = "1") @PathVariable Long id) {
        Operacao operacao = operacaoService.buscarPorId(id);
        return ResponseEntity.status(200).body(OperacaoMapper.toResponseDto(operacao));
    }

    @Operation(summary = "Cadastrar operação")
    @PostMapping
    public ResponseEntity<OperacaoResponseDto> cadastrar(@Valid @RequestBody OperacaoRequestDto operacaoRequestDto) {
        Operacao operacaoSalva = operacaoService.cadastrar(operacaoRequestDto);
        return ResponseEntity.status(201).body(OperacaoMapper.toResponseDto(operacaoSalva));
    }

    @Operation(summary = "Atualizar operação")
    @PutMapping("/{id}")
    public ResponseEntity<OperacaoResponseDto> atualizar(
            @Parameter(description = "Identificador da operação", example = "1") @PathVariable Long id,
            @Valid @RequestBody OperacaoRequestDto operacaoRequestDto) {
        Operacao operacaoAtualizada = operacaoService.atualizar(id, operacaoRequestDto);
        return ResponseEntity.status(200).body(OperacaoMapper.toResponseDto(operacaoAtualizada));
    }

    @Operation(summary = "Excluir operação")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @Parameter(description = "Identificador da operação", example = "1") @PathVariable Long id) {
        operacaoService.deletarOperacao(id);
        return ResponseEntity.status(204).build();
    }
}
