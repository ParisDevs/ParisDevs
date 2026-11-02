package com.parisdevs.api.controller;

import com.parisdevs.api.dto.ConexaoRequestDto;
import com.parisdevs.api.dto.ConexaoResponseDto;
import com.parisdevs.api.dto.ConnectTokenResponseDto;
import com.parisdevs.api.dto.CredencialProvedorRequestDto;
import com.parisdevs.api.dto.PluggyItemRequestDto;
import com.parisdevs.api.dto.SincronizacaoResponseDto;
import com.parisdevs.api.dto.SincronizarRequestDto;
import com.parisdevs.api.enums.ProvedorBancario;
import com.parisdevs.api.service.ConexaoService;
import com.parisdevs.api.service.ProvedorCredencialService;
import com.parisdevs.api.service.SincronizacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/conexoes")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ConexaoController {

    private final ConexaoService conexaoService;
    private final SincronizacaoService sincronizacaoService;
    private final ProvedorCredencialService credenciais;

    public ConexaoController(
            ConexaoService conexaoService,
            SincronizacaoService sincronizacaoService,
            ProvedorCredencialService credenciais
    ) {
        this.conexaoService = conexaoService;
        this.sincronizacaoService = sincronizacaoService;
        this.credenciais = credenciais;
    }

    @GetMapping
    public List<ConexaoResponseDto> listar() {
        return conexaoService.listar();
    }

    @PostMapping
    public ConexaoResponseDto criar(@RequestBody ConexaoRequestDto dto) {
        return conexaoService.criar(dto);
    }

    @DeleteMapping("/{id}")
    public void remover(@PathVariable Long id) {
        conexaoService.remover(id);
    }

    @PutMapping("/credencial")
    public Map<String, Object> credencial(@RequestBody CredencialProvedorRequestDto dto) {
        ProvedorBancario provedor = provedor(dto == null ? null : dto.provedor());
        credenciais.definir(provedor, dto.clientId(), dto.clientSecret(), dto.extra());
        return Map.of("provedor", provedor.name(), "configurado", credenciais.configurado(provedor));
    }

    @PostMapping("/{id}/sincronizar")
    public SincronizacaoResponseDto sincronizar(@PathVariable Long id, @RequestBody(required = false) SincronizarRequestDto dto) {
        LocalDate inicio = dto == null ? null : dto.inicio();
        LocalDate fim = dto == null ? null : dto.fim();
        return sincronizacaoService.sincronizar(id, inicio, fim);
    }

    @PostMapping("/sincronizar")
    public List<SincronizacaoResponseDto> sincronizarAtivas(@RequestBody(required = false) SincronizarRequestDto dto) {
        return sincronizacaoService.sincronizarAtivas(
                dto == null ? null : dto.idFilial(),
                dto == null ? null : dto.inicio(),
                dto == null ? null : dto.fim()
        );
    }

    @PostMapping("/{id}/pluggy")
    public ConexaoResponseDto pluggy(@PathVariable Long id, @RequestBody PluggyItemRequestDto dto) {
        return conexaoService.resposta(sincronizacaoService.conectarPluggy(id, dto));
    }

    @PostMapping("/{id}/pluggy/token")
    public ConnectTokenResponseDto token(@PathVariable Long id) {
        return new ConnectTokenResponseDto(sincronizacaoService.connectToken(id));
    }

    private static ProvedorBancario provedor(String valor) {
        try {
            return ProvedorBancario.de(valor);
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provedor deve ser ITAU, XP ou PLUGGY.");
        }
    }
}
