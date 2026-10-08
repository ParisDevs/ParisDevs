package com.parisdevs.api.service;

import com.parisdevs.api.entity.Usuario;
import com.parisdevs.api.exception.EmailJaCadastradoException;
import com.parisdevs.api.exception.UsuarioNaoEncontradoException;
import com.parisdevs.api.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
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
        Boolean existeMesmoEmail =usuarioRepository.existsByEmail(usuario.getEmail());

        if (existeMesmoEmail) {
            throw new EmailJaCadastradoException();
        }

        return usuarioRepository.save(usuario);
    }

    public Usuario atualizar(Integer id, Usuario usuario) {
        usuarioExiste(id);

        Boolean existeUsuarioMesmoEmail =usuarioRepository.existsByEmailAndIdNot(usuario.getEmail(), id);

        if (existeUsuarioMesmoEmail) {
            throw new EmailJaCadastradoException();
        }

        usuario.setId(id);
        return usuarioRepository.save(usuario);

    }
    public void usuarioExiste(Integer id) {
        if (!usuarioRepository.existsById(id)) {
            throw new UsuarioNaoEncontradoException();
        }
    }

    public void deletarPorid(Integer id) {
        usuarioExiste(id);
        usuarioRepository.deleteById(id);
    }
}
