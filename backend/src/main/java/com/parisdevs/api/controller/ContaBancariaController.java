package com.parisdevs.api.controller;

import com.parisdevs.api.dto.ContaBancariaRequestDto;
import com.parisdevs.api.dto.ContaBancariaResponseDto;
import com.parisdevs.api.entity.ContaBancaria;
import com.parisdevs.api.mapper.ContaBancariaMapper;
import com.parisdevs.api.service.ContaBancariaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Conta Bancaria")
@RestController
@RequestMapping("/contasBancarias")
@CrossOrigin(origins = "http://localhost:5174")
public class ContaBancariaController {

    private final ContaBancariaService contaBancariaService;

    public ContaBancariaController(ContaBancariaService contaBancariaService) {
        this.contaBancariaService = contaBancariaService;
    }

    @GetMapping
    public ResponseEntity<List<ContaBancariaResponseDto>> listar(){

        List<ContaBancaria> contas = contaBancariaService.listarContas();
        return ResponseEntity.status(200).body(ContaBancariaMapper.toResponseDto(contas));
    }

    @GetMapping("/{idFilial}")
    public ResponseEntity<List<ContaBancariaResponseDto>> listarPorFilial(@PathVariable Integer idFilial){

        List<ContaBancaria> contas = contaBancariaService.listarContasPorFilial(idFilial);

        return ResponseEntity.status(200).body(ContaBancariaMapper.toResponseDto(contas));
    }

    @PostMapping
    public ResponseEntity<ContaBancariaResponseDto> cadastrar(@Valid @RequestBody ContaBancariaRequestDto contaBancariaRequestDto){

        ContaBancariaResponseDto resposta = contaBancariaService.cadastrar(contaBancariaRequestDto);

        return ResponseEntity.status(201).body(resposta);
    }

    @PutMapping ("/{idContaBancaria}")
    public ResponseEntity<ContaBancariaResponseDto> atualizar(@PathVariable Long idContaBancaria, @Valid @RequestBody ContaBancariaRequestDto contaBancariaRequestDto){

        ContaBancariaResponseDto resposta = contaBancariaService.atualizar(idContaBancaria, contaBancariaRequestDto);

        return ResponseEntity.status(200).body(resposta);
    }

    @DeleteMapping("/{idContaBancaria}")
    public ResponseEntity<Void> deletar(@PathVariable Long idContaBancaria){

        contaBancariaService.deletar(idContaBancaria);
        return ResponseEntity.status(204).build();
    }
}
