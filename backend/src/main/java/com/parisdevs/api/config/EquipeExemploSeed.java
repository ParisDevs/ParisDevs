package com.parisdevs.api.config;

import com.parisdevs.api.entity.Conversa;
import com.parisdevs.api.entity.MembroConversa;
import com.parisdevs.api.entity.Mensagem;
import com.parisdevs.api.entity.Usuario;
import com.parisdevs.api.enums.Cargo;
import com.parisdevs.api.enums.TipoConversa;
import com.parisdevs.api.repository.ConversaRepository;
import com.parisdevs.api.repository.MembroConversaRepository;
import com.parisdevs.api.repository.MensagemRepository;
import com.parisdevs.api.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class EquipeExemploSeed implements ApplicationRunner {

    private static final Logger LOG = LoggerFactory.getLogger(EquipeExemploSeed.class);

    private final UsuarioRepository usuarios;
    private final ConversaRepository conversas;
    private final MembroConversaRepository membros;
    private final MensagemRepository mensagens;

    public EquipeExemploSeed(
            UsuarioRepository usuarios,
            ConversaRepository conversas,
            MembroConversaRepository membros,
            MensagemRepository mensagens
    ) {
        this.usuarios = usuarios;
        this.conversas = conversas;
        this.membros = membros;
        this.mensagens = mensagens;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (mensagens.count() > 0) {
            return;
        }
        List<Usuario> lista = usuarios.findAllWithFilial();
        if (lista.isEmpty()) {
            return;
        }
        Usuario gestao = lista.stream()
                .filter((u) -> u.getCargo() == Cargo.ADMINISTRADOR || u.getCargo() == Cargo.GERENTE)
                .findFirst()
                .orElse(lista.get(0));
        LocalDateTime agora = LocalDateTime.now();

        Conversa recados = conversas.findFirstByTipo(TipoConversa.RECADO).orElseGet(() ->
                salvarConversa(TipoConversa.RECADO, "Recados", null, gestao, agora.minusDays(2)));
        for (Usuario usuario : lista) {
            garantirMembro(recados, usuario);
        }
        publicar(recados, gestao, "Bom dia. O fechamento deste mês fecha sexta, 18h. Conciliação e DRE precisam estar classificados até lá.", agora.minusHours(28));
        publicar(recados, gestao, "A chave do assistente fica em Configurações → API de IA. Não cole credencial no chat.", agora.minusHours(5));
        publicar(recados, gestao, "Quem ligar banco novo usa a tela Conexões. Sandbox primeiro; produção só com a flag explícita.", agora.minusHours(1));

        if (lista.size() >= 2) {
            Usuario a = lista.get(0);
            Usuario b = lista.get(1);
            String chave = a.getId() < b.getId() ? a.getId() + ":" + b.getId() : b.getId() + ":" + a.getId();
            Conversa direta = conversas.findByChaveDireta(chave).orElseGet(() ->
                    salvarConversa(TipoConversa.DIRETA, null, chave, a, agora.minusHours(8)));
            garantirMembro(direta, a);
            garantirMembro(direta, b);
            publicar(direta, a, "Consegue olhar o Itaú da filial? A sincronização de ontem não entrou no extrato.", agora.minusHours(7));
            publicar(direta, b, "Vou sincronizar de novo e te aviso.", agora.minusHours(6).minusMinutes(40));
            publicar(direta, b, "Entrou. Faltam 3 saídas sem categoria na conciliação.", agora.minusHours(2));
            publicar(direta, a, "Beleza. Eu classico as tarifas e te devolvo o restante.", agora.minusMinutes(35));
        }

        if (lista.size() >= 2) {
            Conversa grupo = salvarConversa(TipoConversa.GRUPO, "Fechamento", null, gestao, agora.minusDays(1));
            for (Usuario usuario : lista) {
                garantirMembro(grupo, usuario);
            }
            Usuario outro = lista.stream().filter((u) -> !u.getId().equals(gestao.getId())).findFirst().orElse(gestao);
            publicar(grupo, gestao, "Lista do que falta no fechamento: tarifas Itaú, aluguel e a folha complementar.", agora.minusHours(10));
            publicar(grupo, outro, "Tarifas eu classifico agora. Aluguel já está em ocupação.", agora.minusHours(9));
            publicar(grupo, gestao, "Quando terminar, gerem o DRE do período e conferem o resultado no dashboard.", agora.minusMinutes(50));
        }

        LOG.info("Mensagens de exemplo da Equipe foram gravadas.");
    }

    private Conversa salvarConversa(TipoConversa tipo, String titulo, String chave, Usuario criador, LocalDateTime quando) {
        Conversa conversa = new Conversa();
        conversa.setTipo(tipo);
        conversa.setTitulo(titulo);
        conversa.setChaveDireta(chave);
        conversa.setCriadoPor(criador);
        conversa.setCriadoEm(quando);
        return conversas.save(conversa);
    }

    private void garantirMembro(Conversa conversa, Usuario usuario) {
        if (membros.existsByConversaAndUsuario(conversa, usuario)) {
            return;
        }
        MembroConversa membro = new MembroConversa();
        membro.setConversa(conversa);
        membro.setUsuario(usuario);
        membros.save(membro);
    }

    private void publicar(Conversa conversa, Usuario autor, String texto, LocalDateTime quando) {
        Mensagem mensagem = new Mensagem();
        mensagem.setConversa(conversa);
        mensagem.setAutor(autor);
        mensagem.setTexto(texto);
        mensagem.setCriadoEm(quando);
        mensagens.save(mensagem);
    }
}
