package com.parisdevs.api.mapper;

import com.parisdevs.api.dto.UsuarioRequestDto;
import com.parisdevs.api.dto.UsuarioResponseDto;
import com.parisdevs.api.entity.Usuario;

import java.util.ArrayList;
import java.util.List;

public class UsuarioMapper {

    public static Usuario toEntity(UsuarioRequestDto usuarioRequestDto) {
        Usuario usuario = new Usuario();

        usuario.setNome(usuarioRequestDto.getNome());
        usuario.setCargo(usuarioRequestDto.getCargo());
        usuario.setEmail(usuarioRequestDto.getEmail());
        usuario.setSenha(usuarioRequestDto.getSenha());

        return usuario;
    }

    public static UsuarioResponseDto toResponseDto(Usuario usuario) {
        if (usuario == null) {
            return null;
        }

        UsuarioResponseDto usuarioResponseDto = new UsuarioResponseDto();
        usuarioResponseDto.setId(usuario.getId());
        usuarioResponseDto.setNome(usuario.getNome());
        usuarioResponseDto.setCargo(usuario.getCargo());
        usuarioResponseDto.setEmail(usuario.getEmail());

        return usuarioResponseDto;
    }

    public static List<UsuarioResponseDto> toResponseDto(List<Usuario> usuarios) {
        List<UsuarioResponseDto> usuarioResponseDtos = new ArrayList<>();

        for (Usuario usuario : usuarios) {
            UsuarioResponseDto usuarioResponseDto =toResponseDto(usuario);
            usuarioResponseDtos.add(usuarioResponseDto);
        }
        return usuarioResponseDtos;
    }
}
