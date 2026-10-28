package com.parisdevs.api.controller;

import com.parisdevs.api.dto.OperacaoRequestDto;
import com.parisdevs.api.dto.OperacaoResponseDto;
import com.parisdevs.api.entity.Operacao;
import com.parisdevs.api.mapper.OperacaoMapper;
import com.parisdevs.api.service.OperacaoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Operações")
@RestController
@RequestMapping("/operacoes")
@CrossOrigin(origins = "http://localhost:5174")
public class OperacaoController {

    private final OperacaoService operacaoService;

    public OperacaoController(OperacaoService operacaoService) {
        this.operacaoService = operacaoService;
    }

    @GetMapping
    public ResponseEntity<List<OperacaoResponseDto>> listar() {

        List<Operacao> operacoes = operacaoService.listarOperacoes();
        return ResponseEntity.status(200).body(OperacaoMapper.toResponseDto(operacoes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OperacaoResponseDto> buscarPorId(@PathVariable Long id) {
        Operacao operacao = operacaoService.buscarPorId(id);
        return ResponseEntity.status(200).body(OperacaoMapper.toResponseDto(operacao));
    }

    @PostMapping
    public ResponseEntity<OperacaoResponseDto> cadastrar(@Valid @RequestBody OperacaoRequestDto operacaoRequestDto) {
        Operacao operacao = OperacaoMapper.toEntity(operacaoRequestDto);
        Operacao operacaoSalva = operacaoService.cadastrar(operacao);
        return ResponseEntity.status(201).body(OperacaoMapper.toResponseDto(operacaoSalva));

    }

    @PutMapping("/{id}")
    public ResponseEntity<OperacaoResponseDto> atualizar(@PathVariable Long id, @Valid @RequestBody OperacaoRequestDto operacaoRequestDto) {
        Operacao operacao = OperacaoMapper.toEntity(operacaoRequestDto);
        Operacao operacaoAtualizada = operacaoService.atualizar(id, operacao);
        return ResponseEntity.status(200).body(OperacaoMapper.toResponseDto(operacaoAtualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        operacaoService.deletarOperacao(id);
        return ResponseEntity.status(204).build();
    }
}
