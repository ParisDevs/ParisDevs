package com.parisdevs.api.service;

import com.parisdevs.api.dto.LoginResponseDto;
import com.parisdevs.api.dto.UsuarioLoginDto;
import com.parisdevs.api.dto.UsuarioRequestDto;
import com.parisdevs.api.entity.Filial;
import com.parisdevs.api.entity.Usuario;
import com.parisdevs.api.exception.CredenciaisInvalidasException;
import com.parisdevs.api.exception.EmailJaCadastradoException;
import com.parisdevs.api.exception.FilialNaoEncontradaException;
import com.parisdevs.api.exception.FilialObrigatoriaException;
import com.parisdevs.api.exception.UsuarioNaoEncontradoException;
import com.parisdevs.api.mapper.UsuarioMapper;
import com.parisdevs.api.repository.FilialRepository;
import com.parisdevs.api.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final FilialRepository filialRepository;
    private final JwtService jwtService;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            FilialRepository filialRepository,
            JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.filialRepository = filialRepository;
        this.jwtService = jwtService;
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAllWithFilial();
    }

    public Usuario buscarPorId(Integer id) {
        return usuarioRepository.findById(id).orElseThrow(UsuarioNaoEncontradoException::new);
    }

    public Usuario cadastrar(UsuarioRequestDto dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new EmailJaCadastradoException();
        }
        Usuario usuario = UsuarioMapper.toEntity(dto);
        usuario.setFilial(buscarFilial(dto.getIdFilial()));
        return usuarioRepository.save(usuario);
    }

    public LoginResponseDto login(UsuarioLoginDto request) {
        if (request == null
                || request.getEmail() == null
                || request.getEmail().isBlank()
                || request.getSenha() == null
                || request.getSenha().isEmpty()) {
            throw new CredenciaisInvalidasException();
        }

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail().trim());
        if (usuario == null
                || usuario.getSenha() == null
                || !usuario.getSenha().equals(request.getSenha())) {
            throw new CredenciaisInvalidasException();
        }

        return new LoginResponseDto(jwtService.gerar(usuario), UsuarioMapper.toResponseDto(usuario));
    }

    public Usuario atualizar(Integer id, UsuarioRequestDto dto) {
        Usuario persistido = buscarPorId(id);
        if (usuarioRepository.existsByEmailAndIdNot(dto.getEmail(), id)) {
            throw new EmailJaCadastradoException();
        }
        Usuario usuario = UsuarioMapper.toEntity(dto);
        usuario.setId(id);
        usuario.setFilial(buscarFilial(dto.getIdFilial()));
        if (dto.getSenha() == null || dto.getSenha().isBlank()) {
            usuario.setSenha(persistido.getSenha());
        }
        return usuarioRepository.save(usuario);
    }

    public void deletarPorid(Integer id) {
        if (!usuarioRepository.existsById(id)) {
            throw new UsuarioNaoEncontradoException();
        }
        usuarioRepository.deleteById(id);
    }

    private Filial buscarFilial(Integer idFilial) {
        if (idFilial == null) {
            throw new FilialObrigatoriaException();
        }
        return filialRepository.findById(idFilial).orElseThrow(FilialNaoEncontradaException::new);
    }
}
