package com.parisdevs.api.controller;

import com.parisdevs.api.dto.AssistenteChatRequestDto;
import com.parisdevs.api.dto.AssistenteChatResponseDto;
import com.parisdevs.api.dto.AssistenteCredencialRequestDto;
import com.parisdevs.api.dto.AssistenteStatusDto;
import com.parisdevs.api.service.AssistenteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Assistente")
@RestController
@RequestMapping("/assistente")
public class AssistenteController {

    private final AssistenteService assistenteService;

    public AssistenteController(AssistenteService assistenteService) {
        this.assistenteService = assistenteService;
    }

    @Operation(summary = "Saber se há chave utilizável, sem revelá-la")
    @GetMapping("/status")
    public ResponseEntity<AssistenteStatusDto> status(@RequestParam(required = false) String provedor) {
        return ResponseEntity.ok(assistenteService.status(provedor));
    }

    @Operation(summary = "Guardar a chave só na memória deste processo")
    @PutMapping("/credencial")
    public ResponseEntity<AssistenteStatusDto> credencial(@RequestBody AssistenteCredencialRequestDto pedido) {
        String chave = pedido == null ? "" : pedido.chave();
        String provedor = pedido == null ? null : pedido.provedor();
        return ResponseEntity.ok(assistenteService.definirChave(provedor, chave));
    }

    @Operation(summary = "Perguntar ao modelo com o prompt do agente")
    @PostMapping("/chat")
    public ResponseEntity<AssistenteChatResponseDto> chat(@RequestBody AssistenteChatRequestDto pedido) {
        return ResponseEntity.ok(assistenteService.conversar(pedido));
    }
}
