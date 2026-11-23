package com.parisdevs.api.controller;

import com.parisdevs.api.dto.ImportacaoExtratoResponse;
import com.parisdevs.api.service.ImportacaoExtratoService;
import com.webcohesion.ofx4j.io.OFXParseException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/extratos")
public class ImportacaoExtratoController {

    private final ImportacaoExtratoService importacaoExtratoService;

    public ImportacaoExtratoController(
            ImportacaoExtratoService importacaoExtratoService) {
        this.importacaoExtratoService = importacaoExtratoService;
    }

    @PostMapping("/importar")
    public ResponseEntity<?> importar(
            @RequestParam("arquivo") MultipartFile arquivo) {

        if (arquivo.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("O arquivo enviado está vazio.");
        }

        String nomeArquivo = arquivo.getOriginalFilename();

        if (nomeArquivo == null ||
                !nomeArquivo.toLowerCase().endsWith(".ofx")) {
            return ResponseEntity.badRequest()
                    .body("Envie um arquivo com extensão .ofx.");
        }

        if (arquivo.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body("O arquivo ultrapassa o limite de 5 MB.");
        }

        try {
            ImportacaoExtratoResponse resposta =
                    importacaoExtratoService.importar(arquivo);

            return ResponseEntity.ok(resposta);

        } catch (OFXParseException | IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("Não foi possível interpretar o arquivo OFX: "
                            + e.getMessage());

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao ler o arquivo enviado.");
        }
    }
}