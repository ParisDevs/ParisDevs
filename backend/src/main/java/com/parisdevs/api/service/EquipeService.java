package com.parisdevs.api.service;

import com.parisdevs.api.dto.ConversaResumoDto;
import com.parisdevs.api.dto.EventoPessoalDto;
import com.parisdevs.api.dto.EventoPessoalRequestDto;
import com.parisdevs.api.dto.ItemChecklistDto;
import com.parisdevs.api.dto.ItemChecklistPatchDto;
import com.parisdevs.api.dto.MensagemResponseDto;
import com.parisdevs.api.dto.NaoLidasDto;
import com.parisdevs.api.entity.Conversa;
import com.parisdevs.api.entity.EventoPessoal;
import com.parisdevs.api.entity.ItemChecklist;
import com.parisdevs.api.entity.MembroConversa;
import com.parisdevs.api.entity.Mensagem;
import com.parisdevs.api.entity.Usuario;
import com.parisdevs.api.enums.Cargo;
import com.parisdevs.api.enums.TipoConversa;
import com.parisdevs.api.exception.AcessoNegadoException;
import com.parisdevs.api.exception.EquipeDadosInvalidosException;
import com.parisdevs.api.exception.EquipeNaoEncontradoException;
import com.parisdevs.api.exception.UsuarioNaoEncontradoException;
import com.parisdevs.api.repository.ConversaRepository;
import com.parisdevs.api.repository.EventoPessoalRepository;
import com.parisdevs.api.repository.ItemChecklistRepository;
import com.parisdevs.api.repository.MembroConversaRepository;
import com.parisdevs.api.repository.MensagemRepository;
import com.parisdevs.api.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class EquipeService {

    private final AuthUsuario auth;
    private final ConversaRepository conversas;
    private final MembroConversaRepository membros;
    private final MensagemRepository mensagens;
    private final EventoPessoalRepository eventos;
    private final ItemChecklistRepository checklist;
    private final UsuarioRepository usuarios;

    public EquipeService(
            AuthUsuario auth,
            ConversaRepository conversas,
            MembroConversaRepository membros,
            MensagemRepository mensagens,
            EventoPessoalRepository eventos,
            ItemChecklistRepository checklist,
            UsuarioRepository usuarios
    ) {
        this.auth = auth;
        this.conversas = conversas;
        this.membros = membros;
        this.mensagens = mensagens;
        this.eventos = eventos;
        this.checklist = checklist;
        this.usuarios = usuarios;
    }

    @Transactional
    public List<ConversaResumoDto> listarConversas() {
        Usuario eu = auth.obrigatorio();
        garantirRecados(eu);
        List<MembroConversa> lista = membros.findByUsuarioWithConversa(eu);
        List<ConversaResumoDto> dtos = new ArrayList<>();
        for (MembroConversa membro : lista) {
            dtos.add(resumo(membro.getConversa(), eu, membro));
        }
        dtos.sort(Comparator
                .comparing((ConversaResumoDto d) -> "RECADO".equals(d.tipo()) ? 0 : 1)
                .thenComparing(ConversaResumoDto::ultimaEm, Comparator.nullsLast(Comparator.reverseOrder())));
        return dtos;
    }

    @Transactional
    public NaoLidasDto naoLidas() {
        Usuario eu = auth.obrigatorio();
        garantirRecados(eu);
        int total = 0;
        for (MembroConversa membro : membros.findByUsuarioWithConversa(eu)) {
            total += contarNaoLidas(membro.getConversa(), eu, membro);
        }
        return new NaoLidasDto(total);
    }

    @Transactional
    public ConversaResumoDto abrirDireta(Integer usuarioId) {
        Usuario eu = auth.obrigatorio();
        if (usuarioId == null || usuarioId.equals(eu.getId())) {
            throw new EquipeDadosInvalidosException("Escolha um colega para conversar.");
        }
        Usuario outro = usuarios.findById(usuarioId).orElseThrow(UsuarioNaoEncontradoException::new);
        String chave = chaveDireta(eu.getId(), outro.getId());
        Conversa conversa = conversas.findByChaveDireta(chave).orElseGet(() -> {
            Conversa nova = novaConversa(TipoConversa.DIRETA, null, eu);
            nova.setChaveDireta(chave);
            conversas.save(nova);
            incluirMembro(nova, eu);
            incluirMembro(nova, outro);
            return nova;
        });
        MembroConversa membro = exigirMembro(conversa, eu);
        return resumo(conversa, eu, membro);
    }

    @Transactional
    public ConversaResumoDto criarGrupo(String titulo, List<Integer> usuarioIds) {
        Usuario eu = auth.obrigatorio();
        String nome = texto(titulo, 1, 80, "Informe o nome do grupo.");
        if (usuarioIds == null || usuarioIds.isEmpty()) {
            throw new EquipeDadosInvalidosException("Inclua pelo menos um colega no grupo.");
        }
        Conversa conversa = novaConversa(TipoConversa.GRUPO, nome, eu);
        conversas.save(conversa);
        incluirMembro(conversa, eu);
        Set<Integer> vistos = new HashSet<>();
        vistos.add(eu.getId());
        for (Integer id : usuarioIds) {
            if (id == null || !vistos.add(id)) {
                continue;
            }
            Usuario colega = usuarios.findById(id).orElseThrow(UsuarioNaoEncontradoException::new);
            incluirMembro(conversa, colega);
        }
        if (membros.countByConversa(conversa) < 2) {
            throw new EquipeDadosInvalidosException("Inclua pelo menos um colega no grupo.");
        }
        return resumo(conversa, eu, exigirMembro(conversa, eu));
    }

    @Transactional
    public ConversaResumoDto adicionarMembro(Long conversaId, Integer usuarioId) {
        Usuario eu = auth.obrigatorio();
        Conversa conversa = conversa(conversaId);
        if (conversa.getTipo() != TipoConversa.GRUPO) {
            throw new EquipeDadosInvalidosException("Só é possível incluir membros em um grupo.");
        }
        if (!Objects.equals(conversa.getCriadoPor().getId(), eu.getId())) {
            throw new AcessoNegadoException("Só quem criou o grupo inclui membros.");
        }
        if (usuarioId == null) {
            throw new EquipeDadosInvalidosException("Informe o colega.");
        }
        Usuario colega = usuarios.findById(usuarioId).orElseThrow(UsuarioNaoEncontradoException::new);
        if (!membros.existsByConversaAndUsuario(conversa, colega)) {
            incluirMembro(conversa, colega);
        }
        return resumo(conversa, eu, exigirMembro(conversa, eu));
    }

    @Transactional
    public void removerMembro(Long conversaId, Integer usuarioId) {
        Usuario eu = auth.obrigatorio();
        Conversa conversa = conversa(conversaId);
        if (conversa.getTipo() != TipoConversa.GRUPO) {
            throw new EquipeDadosInvalidosException("Só é possível remover membros de um grupo.");
        }
        if (!Objects.equals(conversa.getCriadoPor().getId(), eu.getId())) {
            throw new AcessoNegadoException("Só quem criou o grupo remove membros.");
        }
        Usuario alvo = usuarios.findById(usuarioId).orElseThrow(UsuarioNaoEncontradoException::new);
        if (Objects.equals(alvo.getId(), eu.getId())) {
            throw new EquipeDadosInvalidosException("Quem criou o grupo permanece nele.");
        }
        MembroConversa membro = membros.findByConversaAndUsuario(conversa, alvo)
                .orElseThrow(() -> new EquipeNaoEncontradoException("Membro não encontrado."));
        membros.delete(membro);
    }

    @Transactional(readOnly = true)
    public List<MensagemResponseDto> listarMensagens(Long conversaId) {
        Usuario eu = auth.obrigatorio();
        Conversa conversa = conversa(conversaId);
        exigirLeitura(conversa, eu);
        List<Mensagem> recentes = mensagens.findTop100ByConversaOrderByCriadoEmDesc(conversa);
        List<MensagemResponseDto> dtos = new ArrayList<>();
        for (int i = recentes.size() - 1; i >= 0; i--) {
            Mensagem mensagem = recentes.get(i);
            dtos.add(toMensagem(mensagem, eu));
        }
        return dtos;
    }

    @Transactional
    public MensagemResponseDto enviar(Long conversaId, String bruto) {
        Usuario eu = auth.obrigatorio();
        Conversa conversa = conversa(conversaId);
        exigirEscrita(conversa, eu);
        String texto = texto(bruto, 1, 2000, "Escreva uma mensagem.");
        Mensagem mensagem = new Mensagem();
        mensagem.setConversa(conversa);
        mensagem.setAutor(eu);
        mensagem.setTexto(texto);
        mensagem.setCriadoEm(LocalDateTime.now());
        mensagens.save(mensagem);
        membros.findByConversaAndUsuario(conversa, eu).ifPresent((membro) -> {
            membro.setLastReadEm(mensagem.getCriadoEm());
            membros.save(membro);
        });
        return toMensagem(mensagem, eu);
    }

    @Transactional
    public MensagemResponseDto editarMensagem(Long conversaId, Long mensagemId, String bruto) {
        Usuario eu = auth.obrigatorio();
        Conversa conversa = conversa(conversaId);
        exigirLeitura(conversa, eu);
        Mensagem mensagem = mensagens.findByIdAndConversa(mensagemId, conversa)
                .orElseThrow(() -> new EquipeNaoEncontradoException("Mensagem não encontrada."));
        if (!podeAlterarMensagem(mensagem, conversa, eu)) {
            throw new AcessoNegadoException("Só quem escreveu pode editar.");
        }
        mensagem.setTexto(texto(bruto, 1, 2000, "Escreva uma mensagem."));
        mensagem.setEditadoEm(LocalDateTime.now());
        return toMensagem(mensagem, eu);
    }

    @Transactional
    public void removerMensagem(Long conversaId, Long mensagemId) {
        Usuario eu = auth.obrigatorio();
        Conversa conversa = conversa(conversaId);
        exigirLeitura(conversa, eu);
        Mensagem mensagem = mensagens.findByIdAndConversa(mensagemId, conversa)
                .orElseThrow(() -> new EquipeNaoEncontradoException("Mensagem não encontrada."));
        if (!podeAlterarMensagem(mensagem, conversa, eu)) {
            throw new AcessoNegadoException("Só quem escreveu pode apagar.");
        }
        mensagens.delete(mensagem);
    }

    @Transactional
    public void marcarLeitura(Long conversaId) {
        Usuario eu = auth.obrigatorio();
        Conversa conversa = conversa(conversaId);
        MembroConversa membro = exigirMembro(conversa, eu);
        membro.setLastReadEm(LocalDateTime.now());
        membros.save(membro);
    }

    @Transactional(readOnly = true)
    public List<EventoPessoalDto> listarEventos(Integer ano, Integer mes) {
        Usuario eu = auth.obrigatorio();
        YearMonth periodo = ano != null && mes != null ? YearMonth.of(ano, mes) : YearMonth.now();
        LocalDate inicio = periodo.atDay(1);
        LocalDate fim = periodo.atEndOfMonth();
        return eventos.findByUsuarioAndDataBetweenOrderByDataAscHoraInicioAsc(eu, inicio, fim).stream()
                .map(this::toEvento)
                .toList();
    }

    @Transactional
    public EventoPessoalDto criarEvento(EventoPessoalRequestDto dto) {
        Usuario eu = auth.obrigatorio();
        if (dto == null || dto.data() == null) {
            throw new EquipeDadosInvalidosException("Informe a data do lembrete.");
        }
        EventoPessoal evento = new EventoPessoal();
        evento.setUsuario(eu);
        evento.setTitulo(texto(dto.titulo(), 1, 120, "Informe o título do lembrete."));
        evento.setData(dto.data());
        evento.setHoraInicio(parseHora(dto.horaInicio()));
        evento.setNotas(opcional(dto.notas(), 400));
        evento.setFeito(false);
        evento.setCriadoEm(LocalDateTime.now());
        eventos.save(evento);
        return toEvento(evento);
    }

    @Transactional
    public EventoPessoalDto atualizarEvento(Long id, EventoPessoalRequestDto dto) {
        Usuario eu = auth.obrigatorio();
        EventoPessoal evento = eventoDoDono(id, eu);
        if (dto == null) {
            return toEvento(evento);
        }
        if (dto.titulo() != null) {
            evento.setTitulo(texto(dto.titulo(), 1, 120, "Informe o título do lembrete."));
        }
        if (dto.data() != null) {
            evento.setData(dto.data());
        }
        if (dto.horaInicio() != null) {
            evento.setHoraInicio(dto.horaInicio().isBlank() ? null : parseHora(dto.horaInicio()));
        }
        if (dto.notas() != null) {
            evento.setNotas(opcional(dto.notas(), 400));
        }
        if (dto.feito() != null) {
            evento.setFeito(dto.feito());
        }
        return toEvento(evento);
    }

    @Transactional
    public void removerEvento(Long id) {
        Usuario eu = auth.obrigatorio();
        eventos.delete(eventoDoDono(id, eu));
    }

    private EventoPessoal eventoDoDono(Long id, Usuario eu) {
        EventoPessoal evento = eventos.findById(id)
                .orElseThrow(() -> new EquipeNaoEncontradoException("Lembrete não encontrado."));
        if (!Objects.equals(evento.getUsuario().getId(), eu.getId())) {
            throw new AcessoNegadoException();
        }
        return evento;
    }

    @Transactional(readOnly = true)
    public List<ItemChecklistDto> listarChecklist() {
        Usuario eu = auth.obrigatorio();
        return checklist.findByUsuarioOrderByOrdemAscIdAsc(eu).stream().map(this::toItem).toList();
    }

    @Transactional
    public ItemChecklistDto criarItem(String bruto) {
        Usuario eu = auth.obrigatorio();
        List<ItemChecklist> atuais = checklist.findByUsuarioOrderByOrdemAscIdAsc(eu);
        int ordem = atuais.isEmpty() ? 1 : atuais.get(atuais.size() - 1).getOrdem() + 1;
        ItemChecklist item = new ItemChecklist();
        item.setUsuario(eu);
        item.setTexto(texto(bruto, 1, 200, "Informe o item."));
        item.setFeito(false);
        item.setOrdem(ordem);
        item.setCriadoEm(LocalDateTime.now());
        checklist.save(item);
        return toItem(item);
    }

    @Transactional
    public ItemChecklistDto atualizarItem(Long id, ItemChecklistPatchDto dto) {
        Usuario eu = auth.obrigatorio();
        ItemChecklist item = itemDoDono(id, eu);
        if (dto == null) {
            return toItem(item);
        }
        if (dto.texto() != null) {
            item.setTexto(texto(dto.texto(), 1, 200, "Informe o item."));
        }
        if (dto.feito() != null) {
            item.setFeito(dto.feito());
        }
        if (dto.ordem() != null) {
            item.setOrdem(dto.ordem());
        }
        return toItem(item);
    }

    @Transactional
    public void removerItem(Long id) {
        Usuario eu = auth.obrigatorio();
        checklist.delete(itemDoDono(id, eu));
    }

    private ItemChecklist itemDoDono(Long id, Usuario eu) {
        ItemChecklist item = checklist.findById(id)
                .orElseThrow(() -> new EquipeNaoEncontradoException("Item não encontrado."));
        if (!Objects.equals(item.getUsuario().getId(), eu.getId())) {
            throw new AcessoNegadoException();
        }
        return item;
    }

    private Conversa garantirRecados(Usuario eu) {
        Conversa recados = conversas.findFirstByTipo(TipoConversa.RECADO).orElseGet(() -> {
            Conversa nova = novaConversa(TipoConversa.RECADO, "Recados", eu);
            conversas.save(nova);
            return nova;
        });
        if (!membros.existsByConversaAndUsuario(recados, eu)) {
            incluirMembro(recados, eu);
        }
        return recados;
    }

    private Conversa novaConversa(TipoConversa tipo, String titulo, Usuario criador) {
        Conversa conversa = new Conversa();
        conversa.setTipo(tipo);
        conversa.setTitulo(titulo);
        conversa.setCriadoPor(criador);
        conversa.setCriadoEm(LocalDateTime.now());
        return conversa;
    }

    private void incluirMembro(Conversa conversa, Usuario usuario) {
        MembroConversa membro = new MembroConversa();
        membro.setConversa(conversa);
        membro.setUsuario(usuario);
        membros.save(membro);
    }

    private Conversa conversa(Long id) {
        return conversas.findById(id).orElseThrow(() -> new EquipeNaoEncontradoException("Conversa não encontrada."));
    }

    private MembroConversa exigirMembro(Conversa conversa, Usuario eu) {
        return membros.findByConversaAndUsuario(conversa, eu)
                .orElseThrow(() -> new EquipeNaoEncontradoException("Conversa não encontrada."));
    }

    private void exigirLeitura(Conversa conversa, Usuario eu) {
        if (conversa.getTipo() == TipoConversa.RECADO) {
            garantirRecados(eu);
            return;
        }
        exigirMembro(conversa, eu);
    }

    private void exigirEscrita(Conversa conversa, Usuario eu) {
        if (conversa.getTipo() == TipoConversa.RECADO) {
            if (!podePublicarRecado(eu)) {
                throw new AcessoNegadoException("Só administrador ou gerente publica recado.");
            }
            garantirRecados(eu);
            return;
        }
        exigirMembro(conversa, eu);
    }

    private boolean podePublicarRecado(Usuario eu) {
        Cargo cargo = eu.getCargo();
        return cargo == Cargo.ADMINISTRADOR || cargo == Cargo.GERENTE;
    }

    private boolean podeAlterarMensagem(Mensagem mensagem, Conversa conversa, Usuario eu) {
        if (Objects.equals(mensagem.getAutor().getId(), eu.getId())) {
            return true;
        }
        return conversa.getTipo() == TipoConversa.RECADO && podePublicarRecado(eu);
    }

    private ConversaResumoDto resumo(Conversa conversa, Usuario eu, MembroConversa membro) {
        List<MembroConversa> lista = membros.findByConversaWithUsuario(conversa);
        Usuario outro = lista.stream()
                .map(MembroConversa::getUsuario)
                .filter((u) -> !Objects.equals(u.getId(), eu.getId()))
                .findFirst()
                .orElse(null);
        Mensagem ultima = mensagens.findTopByConversaOrderByCriadoEmDesc(conversa).orElse(null);
        String titulo = switch (conversa.getTipo()) {
            case RECADO -> "Recados";
            case GRUPO -> conversa.getTitulo();
            case DIRETA -> outro == null ? "Conversa" : outro.getNome();
        };
        String foto = conversa.getTipo() == TipoConversa.DIRETA && outro != null ? outro.getFoto() : null;
        String cargo = conversa.getTipo() == TipoConversa.DIRETA && outro != null && outro.getCargo() != null
                ? outro.getCargo().name()
                : null;
        String filial = conversa.getTipo() == TipoConversa.DIRETA && outro != null && outro.getFilial() != null
                ? outro.getFilial().getRazaoSocial()
                : null;
        boolean podeEscrever = conversa.getTipo() != TipoConversa.RECADO || podePublicarRecado(eu);
        return new ConversaResumoDto(
                conversa.getId(),
                conversa.getTipo().name(),
                titulo,
                ultima == null ? null : ultima.getTexto(),
                ultima == null ? conversa.getCriadoEm() : ultima.getCriadoEm(),
                contarNaoLidas(conversa, eu, membro),
                (int) lista.size(),
                foto,
                cargo,
                filial,
                podeEscrever
        );
    }

    private int contarNaoLidas(Conversa conversa, Usuario eu, MembroConversa membro) {
        if (membro.getLastReadEm() == null) {
            return (int) mensagens.countByConversaAndAutorNot(conversa, eu);
        }
        return (int) mensagens.countByConversaAndCriadoEmAfterAndAutorNot(conversa, membro.getLastReadEm(), eu);
    }

    private MensagemResponseDto toMensagem(Mensagem mensagem, Usuario eu) {
        Usuario autor = mensagem.getAutor();
        return new MensagemResponseDto(
                mensagem.getId(),
                autor.getId(),
                autor.getNome(),
                autor.getFoto(),
                mensagem.getTexto(),
                mensagem.getCriadoEm(),
                Objects.equals(autor.getId(), eu.getId()),
                mensagem.getEditadoEm() != null,
                podeAlterarMensagem(mensagem, mensagem.getConversa(), eu)
        );
    }

    private EventoPessoalDto toEvento(EventoPessoal evento) {
        return new EventoPessoalDto(
                evento.getId(),
                evento.getTitulo(),
                evento.getData(),
                evento.getHoraInicio(),
                evento.getNotas(),
                evento.isFeito(),
                evento.getCriadoEm()
        );
    }

    private ItemChecklistDto toItem(ItemChecklist item) {
        return new ItemChecklistDto(item.getId(), item.getTexto(), item.isFeito(), item.getOrdem());
    }

    private static String chaveDireta(Integer a, Integer b) {
        return a < b ? a + ":" + b : b + ":" + a;
    }

    private static String texto(String valor, int min, int max, String erro) {
        String limpo = valor == null ? "" : valor.trim();
        if (limpo.length() < min || limpo.length() > max) {
            throw new EquipeDadosInvalidosException(erro);
        }
        return limpo;
    }

    private static String opcional(String valor, int max) {
        if (valor == null) {
            return null;
        }
        String limpo = valor.trim();
        if (limpo.isEmpty()) {
            return null;
        }
        if (limpo.length() > max) {
            throw new EquipeDadosInvalidosException("O texto é longo demais.");
        }
        return limpo;
    }

    private static LocalTime parseHora(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        String bruto = valor.trim();
        try {
            if (bruto.length() == 5) {
                return LocalTime.parse(bruto + ":00");
            }
            return LocalTime.parse(bruto);
        } catch (Exception ex) {
            throw new EquipeDadosInvalidosException("Informe a hora no formato HH:mm.");
        }
    }
}
