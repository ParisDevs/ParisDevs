package com.parisdevs.api.controller;

import com.parisdevs.api.dto.UsuarioRequestDto;
import com.parisdevs.api.dto.UsuarioResponseDto;
import com.parisdevs.api.entity.Usuario;
import com.parisdevs.api.mapper.UsuarioMapper;
import com.parisdevs.api.service.UsuarioService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Usuarios")
@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDto>> listar() {
        List<Usuario> usuarios = usuarioService.listarUsuarios();

        return ResponseEntity.status(200).body(UsuarioMapper.toResponseDto(usuarios));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDto> buscarPorId(@PathVariable Integer id) {
        Usuario usuario = usuarioService.buscarPorId(id);
        return ResponseEntity.status(200).body(UsuarioMapper.toResponseDto(usuario));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDto> cadastrar(@Valid @RequestBody UsuarioRequestDto usuarioRequestDto) {
        Usuario usuario = UsuarioMapper.toEntity(usuarioRequestDto);
        Usuario usuarioSalvo = usuarioService.cadastrar(usuario);
        return ResponseEntity.status(201).body(UsuarioMapper.toResponseDto(usuarioSalvo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDto> atualizar(@PathVariable Integer id, @Valid @RequestBody UsuarioRequestDto usuarioRequestDto) {
        Usuario usuario = UsuarioMapper.toEntity(usuarioRequestDto);
        Usuario usuarioAtualizado = usuarioService.atualizar(id, usuario);
        return ResponseEntity.status(200).body(UsuarioMapper.toResponseDto(usuarioAtualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        usuarioService.deletarPorid(id);
        return ResponseEntity.status(204).build();
    }


}
