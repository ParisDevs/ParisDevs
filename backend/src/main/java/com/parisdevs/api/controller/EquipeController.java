package com.parisdevs.api.controller;

import com.parisdevs.api.dto.ConversaResumoDto;
import com.parisdevs.api.dto.DiretaRequestDto;
import com.parisdevs.api.dto.EventoPessoalDto;
import com.parisdevs.api.dto.EventoPessoalRequestDto;
import com.parisdevs.api.dto.GrupoRequestDto;
import com.parisdevs.api.dto.ItemChecklistDto;
import com.parisdevs.api.dto.ItemChecklistPatchDto;
import com.parisdevs.api.dto.MembroRequestDto;
import com.parisdevs.api.dto.MensagemResponseDto;
import com.parisdevs.api.dto.NaoLidasDto;
import com.parisdevs.api.dto.TextoRequestDto;
import com.parisdevs.api.service.EquipeService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/equipe")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class EquipeController {

    private final EquipeService equipe;

    public EquipeController(EquipeService equipe) {
        this.equipe = equipe;
    }

    @GetMapping("/conversas")
    public List<ConversaResumoDto> conversas() {
        return equipe.listarConversas();
    }

    @GetMapping("/nao-lidas")
    public NaoLidasDto naoLidas() {
        return equipe.naoLidas();
    }

    @PostMapping("/conversas/diretas")
    public ConversaResumoDto direta(@RequestBody DiretaRequestDto dto) {
        return equipe.abrirDireta(dto == null ? null : dto.usuarioId());
    }

    @PostMapping("/conversas/grupos")
    @ResponseStatus(HttpStatus.CREATED)
    public ConversaResumoDto grupo(@RequestBody GrupoRequestDto dto) {
        return equipe.criarGrupo(dto == null ? null : dto.titulo(), dto == null ? null : dto.usuarioIds());
    }

    @PostMapping("/conversas/{id}/membros")
    public ConversaResumoDto adicionarMembro(@PathVariable Long id, @RequestBody MembroRequestDto dto) {
        return equipe.adicionarMembro(id, dto == null ? null : dto.usuarioId());
    }

    @DeleteMapping("/conversas/{id}/membros/{usuarioId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerMembro(@PathVariable Long id, @PathVariable Integer usuarioId) {
        equipe.removerMembro(id, usuarioId);
    }

    @GetMapping("/conversas/{id}/mensagens")
    public List<MensagemResponseDto> mensagens(@PathVariable Long id) {
        return equipe.listarMensagens(id);
    }

    @PostMapping("/conversas/{id}/mensagens")
    @ResponseStatus(HttpStatus.CREATED)
    public MensagemResponseDto enviar(@PathVariable Long id, @RequestBody TextoRequestDto dto) {
        return equipe.enviar(id, dto == null ? null : dto.texto());
    }

    @PatchMapping("/conversas/{id}/mensagens/{mensagemId}")
    public MensagemResponseDto editar(@PathVariable Long id, @PathVariable Long mensagemId, @RequestBody TextoRequestDto dto) {
        return equipe.editarMensagem(id, mensagemId, dto == null ? null : dto.texto());
    }

    @DeleteMapping("/conversas/{id}/mensagens/{mensagemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void apagarMensagem(@PathVariable Long id, @PathVariable Long mensagemId) {
        equipe.removerMensagem(id, mensagemId);
    }

    @PostMapping("/conversas/{id}/leitura")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leitura(@PathVariable Long id) {
        equipe.marcarLeitura(id);
    }

    @GetMapping("/eventos")
    public List<EventoPessoalDto> eventos(@RequestParam(required = false) Integer ano, @RequestParam(required = false) Integer mes) {
        return equipe.listarEventos(ano, mes);
    }

    @PostMapping("/eventos")
    @ResponseStatus(HttpStatus.CREATED)
    public EventoPessoalDto criarEvento(@RequestBody EventoPessoalRequestDto dto) {
        return equipe.criarEvento(dto);
    }

    @PatchMapping("/eventos/{id}")
    public EventoPessoalDto atualizarEvento(@PathVariable Long id, @RequestBody EventoPessoalRequestDto dto) {
        return equipe.atualizarEvento(id, dto);
    }

    @DeleteMapping("/eventos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerEvento(@PathVariable Long id) {
        equipe.removerEvento(id);
    }

    @GetMapping("/checklist")
    public List<ItemChecklistDto> checklist() {
        return equipe.listarChecklist();
    }

    @PostMapping("/checklist")
    @ResponseStatus(HttpStatus.CREATED)
    public ItemChecklistDto criarItem(@RequestBody TextoRequestDto dto) {
        return equipe.criarItem(dto == null ? null : dto.texto());
    }

    @PatchMapping("/checklist/{id}")
    public ItemChecklistDto atualizarItem(@PathVariable Long id, @RequestBody ItemChecklistPatchDto dto) {
        return equipe.atualizarItem(id, dto);
    }

    @DeleteMapping("/checklist/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerItem(@PathVariable Long id) {
        equipe.removerItem(id);
    }
}
