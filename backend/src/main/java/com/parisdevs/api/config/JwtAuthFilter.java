package com.parisdevs.api.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parisdevs.api.exception.TokenAusenteException;
import com.parisdevs.api.exception.TokenExpiradoException;
import com.parisdevs.api.exception.TokenInvalidoException;
import com.parisdevs.api.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
@Order(1)
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String BEARER = "Bearer ";

    private final JwtService jwtService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        if (isPublico(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        if (header == null || header.isBlank()) {
            writeUnauthorized(request, response, new TokenAusenteException());
            return;
        }
        if (!header.regionMatches(true, 0, BEARER, 0, BEARER.length())) {
            writeUnauthorized(request, response, new TokenInvalidoException());
            return;
        }

        String token = header.substring(BEARER.length()).trim();
        if (token.isEmpty()) {
            writeUnauthorized(request, response, new TokenAusenteException());
            return;
        }

        try {
            jwtService.validar(token);
            filterChain.doFilter(request, response);
        } catch (TokenExpiradoException | TokenInvalidoException ex) {
            writeUnauthorized(request, response, ex);
        }
    }

    private boolean isPublico(HttpServletRequest request) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String path = request.getRequestURI();
        if (path == null) {
            return false;
        }
        if ("POST".equalsIgnoreCase(request.getMethod()) && path.equals("/usuarios/login")) {
            return true;
        }
        return path.equals("/swagger-ui.html")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs");
    }

    private void writeUnauthorized(
            HttpServletRequest request,
            HttpServletResponse response,
            RuntimeException ex) throws IOException {
        String origin = request.getHeader("Origin");
        if ("http://localhost:5173".equals(origin) || "http://localhost:5174".equals(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
            response.setHeader("Vary", "Origin");
        }
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), Map.of("message", ex.getMessage()));
    }
}
