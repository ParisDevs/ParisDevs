package com.parisdevs.api.controller;

import com.parisdevs.api.dto.LoginResponseDto;
import com.parisdevs.api.dto.UsuarioLoginDto;
import com.parisdevs.api.dto.UsuarioOnCreate;
import com.parisdevs.api.dto.UsuarioRequestDto;
import com.parisdevs.api.dto.UsuarioResponseDto;
import com.parisdevs.api.entity.Usuario;
import com.parisdevs.api.mapper.UsuarioMapper;
import com.parisdevs.api.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.groups.Default;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Usuarios")
@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Operation(summary = "Listar usuários")
    @GetMapping
    public ResponseEntity<List<UsuarioResponseDto>> listar() {
        List<Usuario> usuarios = usuarioService.listarUsuarios();
        return ResponseEntity.status(200).body(UsuarioMapper.toResponseDto(usuarios));
    }

    @Operation(summary = "Buscar usuário por id")
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDto> buscarPorId(
            @Parameter(description = "Identificador do usuário", example = "1") @PathVariable Integer id) {
        Usuario usuario = usuarioService.buscarPorId(id);
        return ResponseEntity.status(200).body(UsuarioMapper.toResponseDto(usuario));
    }


    @Operation(summary = "Cadastrar usuário")
    @PostMapping
    public ResponseEntity<UsuarioResponseDto> cadastrar(
            @Validated({Default.class, UsuarioOnCreate.class}) @RequestBody UsuarioRequestDto usuarioRequestDto) {
        Usuario usuarioSalvo = usuarioService.cadastrar(usuarioRequestDto);
        return ResponseEntity.status(201).body(UsuarioMapper.toResponseDto(usuarioSalvo));
    }

    @Operation(summary = "Autenticar usuário")
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody UsuarioLoginDto request) {
        return ResponseEntity.status(200).body(usuarioService.login(request));
    }

    @Operation(summary = "Atualizar usuário")
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDto> atualizar(
            @Parameter(description = "Identificador do usuário", example = "1") @PathVariable Integer id,
            @Valid @RequestBody UsuarioRequestDto usuarioRequestDto) {
        Usuario usuarioAtualizado = usuarioService.atualizar(id, usuarioRequestDto);
        return ResponseEntity.status(200).body(UsuarioMapper.toResponseDto(usuarioAtualizado));
    }

    @Operation(summary = "Excluir usuário")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @Parameter(description = "Identificador do usuário", example = "1") @PathVariable Integer id) {
        usuarioService.deletarPorid(id);
        return ResponseEntity.status(204).build();
    }
}
