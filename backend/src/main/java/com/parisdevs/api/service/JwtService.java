package com.parisdevs.api.service;

import com.parisdevs.api.entity.Usuario;
import com.parisdevs.api.exception.TokenExpiradoException;
import com.parisdevs.api.exception.TokenInvalidoException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String gerar(Usuario usuario) {
        Date agora = new Date();
        Date expira = new Date(agora.getTime() + expirationMs);
        String cargo = usuario.getCargo() == null ? null : usuario.getCargo().name();
        return Jwts.builder()
                .subject(String.valueOf(usuario.getId()))
                .claim("email", usuario.getEmail())
                .claim("cargo", cargo)
                .issuedAt(agora)
                .expiration(expira)
                .signWith(key)
                .compact();
    }

    public Claims validar(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException ex) {
            throw new TokenExpiradoException();
        } catch (JwtException | IllegalArgumentException ex) {
            throw new TokenInvalidoException();
        }
    }
}
