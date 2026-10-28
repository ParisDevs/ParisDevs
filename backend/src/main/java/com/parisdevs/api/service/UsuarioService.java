package com.parisdevs.api.service;

import com.parisdevs.api.dto.UsuarioLoginDto;
import com.parisdevs.api.dto.UsuarioRequestDto;
import com.parisdevs.api.dto.UsuarioResponseDto;
import com.parisdevs.api.entity.Usuario;
import com.parisdevs.api.exception.EmailJaCadastradoException;
import com.parisdevs.api.exception.FilialNaoEncontradaException;
import com.parisdevs.api.exception.FilialObrigatoriaException;
import com.parisdevs.api.exception.UsuarioNaoEncontradoException;
import com.parisdevs.api.mapper.UsuarioMapper;
import com.parisdevs.api.repository.FilialRepository;
import com.parisdevs.api.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final FilialRepository filialRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, FilialRepository filialRepository) {
        this.usuarioRepository = usuarioRepository;
        this.filialRepository = filialRepository;
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario buscarPorId(Integer id) {
        Optional<Usuario> usuarioOptional = usuarioRepository.findById(id);

        if (usuarioOptional.isEmpty()) {
            throw new UsuarioNaoEncontradoException();
        }
        return usuarioOptional.get();
    }

    public Usuario cadastrar(Usuario usuario) {
        Boolean existeMesmoEmail = usuarioRepository.existsByEmail(usuario.getEmail());
        if (existeMesmoEmail) {
            throw new EmailJaCadastradoException();
        }

        if (usuario.getFilial() == null || usuario.getFilial().getIdFilial() == null) {
            throw new FilialObrigatoriaException();
        }

        boolean filialExiste = filialRepository.existsById(usuario.getFilial().getIdFilial());
        if (!filialExiste) {
            throw new FilialNaoEncontradaException();
        }

        return usuarioRepository.save(usuario);
    }

    public UsuarioResponseDto login(UsuarioLoginDto request){
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail());
        return UsuarioMapper.toResponseDto(usuario);
    }

    public Usuario atualizar(Integer id, Usuario usuario) {
        usuarioExiste(id);

        Boolean existeUsuarioMesmoEmail = usuarioRepository.existsByEmailAndIdNot(usuario.getEmail(), id);
        if (existeUsuarioMesmoEmail) {
            throw new EmailJaCadastradoException();
        }

        if (usuario.getFilial() == null || usuario.getFilial().getIdFilial() == null) {
            throw new FilialObrigatoriaException();
        }

        boolean filialExiste = filialRepository.existsById(usuario.getFilial().getIdFilial());
        if (!filialExiste) {
            throw new FilialNaoEncontradaException();
        }

        usuario.setId(id);
        return usuarioRepository.save(usuario);
    }


    public void deletarPorid(Integer id) {
        usuarioExiste(id);
        usuarioRepository.deleteById(id);
    }

    private void usuarioExiste(Integer id) {
        if (!usuarioRepository.existsById(id)) {
            throw new UsuarioNaoEncontradoException();
        }
    }
}
