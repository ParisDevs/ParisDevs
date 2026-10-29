package com.parisdevs.api.mapper;

import com.parisdevs.api.dto.FilialResponseSimplesDto;
import com.parisdevs.api.dto.UsuarioRequestDto;
import com.parisdevs.api.dto.UsuarioResponseDto;
import com.parisdevs.api.entity.Usuario;

import java.util.ArrayList;
import java.util.List;

public class UsuarioMapper {

    public static Usuario toEntity(UsuarioRequestDto usuarioRequestDto) {
        if (usuarioRequestDto == null) {
            return null;
        }

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

        if (usuario.getFilial() != null) {
            FilialResponseSimplesDto filialSimplesDto = new FilialResponseSimplesDto();
            filialSimplesDto.setIdFilial(usuario.getFilial().getIdFilial());
            filialSimplesDto.setRazaoSocial(usuario.getFilial().getRazaoSocial());
            usuarioResponseDto.setFilial(filialSimplesDto);
        }

        return usuarioResponseDto;
    }

    public static List<UsuarioResponseDto> toResponseDto(List<Usuario> usuarios) {
        if (usuarios == null) {
            return List.of();
        }
        List<UsuarioResponseDto> respostas = new ArrayList<>();
        for (Usuario usuario : usuarios) {
            respostas.add(toResponseDto(usuario));
        }
        return respostas;
    }
}
