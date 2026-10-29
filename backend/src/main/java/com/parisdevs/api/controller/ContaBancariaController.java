package com.parisdevs.api.controller;

import com.parisdevs.api.dto.ContaBancariaRequestDto;
import com.parisdevs.api.dto.ContaBancariaResponseDto;
import com.parisdevs.api.entity.ContaBancaria;
import com.parisdevs.api.mapper.ContaBancariaMapper;
import com.parisdevs.api.service.ContaBancariaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Conta Bancaria")
@RestController
@RequestMapping("/contasBancarias")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ContaBancariaController {

    private final ContaBancariaService contaBancariaService;

    public ContaBancariaController(ContaBancariaService contaBancariaService) {
        this.contaBancariaService = contaBancariaService;
    }

    @Operation(summary = "Listar contas bancárias")
    @GetMapping
    public ResponseEntity<List<ContaBancariaResponseDto>> listar(){

        List<ContaBancaria> contas = contaBancariaService.listarContas();
        return ResponseEntity.status(200).body(ContaBancariaMapper.toResponseDto(contas));
    }

    @Operation(summary = "Listar contas bancárias da filial")
    @GetMapping("/{idFilial}")
    public ResponseEntity<List<ContaBancariaResponseDto>> listarPorFilial(
            @Parameter(description = "Identificador da filial", example = "1") @PathVariable Integer idFilial){

        List<ContaBancaria> contas = contaBancariaService.listarContasPorFilial(idFilial);

        return ResponseEntity.status(200).body(ContaBancariaMapper.toResponseDto(contas));
    }

    @Operation(summary = "Cadastrar conta bancária")
    @PostMapping
    public ResponseEntity<ContaBancariaResponseDto> cadastrar(@Valid @RequestBody ContaBancariaRequestDto contaBancariaRequestDto){

        ContaBancariaResponseDto resposta = contaBancariaService.cadastrar(contaBancariaRequestDto);

        return ResponseEntity.status(201).body(resposta);
    }

    @Operation(summary = "Atualizar conta bancária")
    @PutMapping ("/{idContaBancaria}")
    public ResponseEntity<ContaBancariaResponseDto> atualizar(
            @Parameter(description = "Identificador da conta bancária", example = "1") @PathVariable Long idContaBancaria,
            @Valid @RequestBody ContaBancariaRequestDto contaBancariaRequestDto){

        ContaBancariaResponseDto resposta = contaBancariaService.atualizar(idContaBancaria, contaBancariaRequestDto);

        return ResponseEntity.status(200).body(resposta);
    }

    @Operation(summary = "Excluir conta bancária")
    @DeleteMapping("/{idContaBancaria}")
    public ResponseEntity<Void> deletar(
            @Parameter(description = "Identificador da conta bancária", example = "1") @PathVariable Long idContaBancaria){

        contaBancariaService.deletar(idContaBancaria);
        return ResponseEntity.status(204).build();
    }
}
