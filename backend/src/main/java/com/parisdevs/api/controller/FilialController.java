package com.parisdevs.api.controller;

import com.parisdevs.api.dto.FilialRequestDto;
import com.parisdevs.api.dto.FilialResponseDto;
import com.parisdevs.api.entity.Filial;
import com.parisdevs.api.entity.Usuario;
import com.parisdevs.api.mapper.FilialMapper;
import com.parisdevs.api.service.FilialService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Filiais")
@RestController
@RequestMapping("/filiais")
public class FilialController {

    private final FilialService filialService;

    public FilialController(FilialService filialService) {
        this.filialService = filialService;
    }

    @GetMapping
    public ResponseEntity<List<FilialResponseDto>> listar() {
        List<Filial> filiais = filialService.listarFiliais();
        return ResponseEntity.status(200).body(FilialMapper.toResponseDto(filiais));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FilialResponseDto> buscarPorId(@PathVariable Integer id) {
        Filial filial = filialService.buscarPorId(id);
        return ResponseEntity.status(200).body(FilialMapper.toResponseDto(filial));
    }

    @PostMapping
    public ResponseEntity<FilialResponseDto> cadastrar(@Valid @RequestBody FilialRequestDto filialRequestDto) {
        Filial filial = FilialMapper.toEntity(filialRequestDto);
        Filial filialSalvo = filialService.cadastrar(filial);
        return ResponseEntity.status(201).body(FilialMapper.toResponseDto(filialSalvo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FilialResponseDto> atualizar(@PathVariable Integer id, @Valid @RequestBody FilialRequestDto filialRequestDto) {
        Filial filial = FilialMapper.toEntity(filialRequestDto);
        Filial filialAtualizado = filialService.atualizar(id, filial);
        return ResponseEntity.status(200).body(FilialMapper.toResponseDto(filialAtualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        filialService.deletarPorId(id);
        return ResponseEntity.status(204).build();
    }
}
