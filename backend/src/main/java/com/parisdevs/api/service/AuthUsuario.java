package com.parisdevs.api.service;

import com.parisdevs.api.entity.Usuario;
import com.parisdevs.api.exception.TokenAusenteException;
import com.parisdevs.api.exception.TokenInvalidoException;
import com.parisdevs.api.exception.UsuarioNaoEncontradoException;
import com.parisdevs.api.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class AuthUsuario {

    private static final String BEARER = "Bearer ";

    private final JwtService jwtService;
    private final UsuarioRepository usuarios;

    public AuthUsuario(JwtService jwtService, UsuarioRepository usuarios) {
        this.jwtService = jwtService;
        this.usuarios = usuarios;
    }

    public Usuario obrigatorio() {
        String header = authorization();
        if (header == null || header.isBlank()) {
            throw new TokenAusenteException();
        }
        if (!header.regionMatches(true, 0, BEARER, 0, BEARER.length())) {
            throw new TokenInvalidoException();
        }
        String token = header.substring(BEARER.length()).trim();
        if (token.isEmpty()) {
            throw new TokenAusenteException();
        }
        String subject = jwtService.validar(token).getSubject();
        Integer id;
        try {
            id = Integer.valueOf(subject);
        } catch (NumberFormatException ex) {
            throw new TokenInvalidoException();
        }
        return usuarios.findById(id).orElseThrow(UsuarioNaoEncontradoException::new);
    }

    private String authorization() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            throw new TokenAusenteException();
        }
        HttpServletRequest request = attrs.getRequest();
        return request.getHeader("Authorization");
    }
}
