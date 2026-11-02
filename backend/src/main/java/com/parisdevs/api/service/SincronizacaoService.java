package com.parisdevs.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.parisdevs.api.domain.ItauExtratoReader;
import com.parisdevs.api.domain.PluggyTransacaoReader;
import com.parisdevs.api.domain.SaldoProvedor;
import com.parisdevs.api.dto.PluggyItemRequestDto;
import com.parisdevs.api.dto.SincronizacaoResponseDto;
import com.parisdevs.api.entity.CapturaProvedor;
import com.parisdevs.api.entity.ConexaoBancaria;
import com.parisdevs.api.entity.ContaBancaria;
import com.parisdevs.api.entity.Operacao;
import com.parisdevs.api.enums.OrigemDados;
import com.parisdevs.api.enums.ProvedorBancario;
import com.parisdevs.api.enums.StatusConexao;
import com.parisdevs.api.enums.TipoCaptura;
import com.parisdevs.api.enums.TipoOperacao;
import com.parisdevs.api.exception.ProvedorIndisponivelException;
import com.parisdevs.api.integration.ItauAccountStatementClient;
import com.parisdevs.api.integration.PluggyClient;
import com.parisdevs.api.integration.XpDataAccessClient;
import com.parisdevs.api.repository.CapturaProvedorRepository;
import com.parisdevs.api.repository.ConexaoBancariaRepository;
import com.parisdevs.api.repository.OperacaoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class SincronizacaoService {

    private final ConexaoService conexaoService;
    private final ConexaoBancariaRepository conexaoRepository;
    private final OperacaoRepository operacaoRepository;
    private final CapturaProvedorRepository capturaRepository;
    private final ItauAccountStatementClient itau;
    private final PluggyClient pluggy;
    private final XpDataAccessClient xp;

    public SincronizacaoService(
            ConexaoService conexaoService,
            ConexaoBancariaRepository conexaoRepository,
            OperacaoRepository operacaoRepository,
            CapturaProvedorRepository capturaRepository,
            ItauAccountStatementClient itau,
            PluggyClient pluggy,
            XpDataAccessClient xp
    ) {
        this.conexaoService = conexaoService;
        this.conexaoRepository = conexaoRepository;
        this.operacaoRepository = operacaoRepository;
        this.capturaRepository = capturaRepository;
        this.itau = itau;
        this.pluggy = pluggy;
        this.xp = xp;
    }

    @Transactional
    public SincronizacaoResponseDto sincronizar(Long idConexao, LocalDate inicio, LocalDate fim) {
        ConexaoBancaria conexao = conexaoService.buscar(idConexao);
        LocalDate[] janela = janela(inicio, fim);
        return switch (conexao.getProvedor()) {
            case ITAU -> sincronizarItau(conexao, janela[0], janela[1]);
            case PLUGGY -> sincronizarPluggy(conexao, janela[0], janela[1]);
            case XP -> sincronizarXp(conexao);
        };
    }

    @Transactional
    public List<SincronizacaoResponseDto> sincronizarAtivas(Integer idFilial, LocalDate inicio, LocalDate fim) {
        List<SincronizacaoResponseDto> respostas = new ArrayList<>();
        for (ConexaoBancaria conexao : conexaoRepository.findAllWithConta()) {
            if (conexao.getStatus() == StatusConexao.DESCONECTADA && conexao.getProvedor() != ProvedorBancario.XP) {
                continue;
            }
            if (idFilial != null && (conexao.getContaBancaria().getFilial() == null
                    || !idFilial.equals(conexao.getContaBancaria().getFilial().getIdFilial()))) {
                continue;
            }
            respostas.add(sincronizar(conexao.getIdConexao(), inicio, fim));
        }
        return respostas;
    }

    @Transactional
    public ConexaoBancaria conectarPluggy(Long idConexao, PluggyItemRequestDto pedido) {
        ConexaoBancaria conexao = conexaoService.buscar(idConexao);
        if (conexao.getProvedor() != ProvedorBancario.PLUGGY) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Esta conexão não é Open Finance.");
        }
        String cpf = pedido == null ? "" : pedido.cpf();
        boolean openFinance = cpf != null && !cpf.isBlank();
        int conector = pluggy.conectorSandbox(openFinance);
        JsonNode item = pluggy.criarItem(
                conector,
                pedido == null ? "" : pedido.usuario(),
                pedido == null ? "" : pedido.senha(),
                pedido == null ? "" : pedido.mfa(),
                cpf
        );
        String itemId = item.path("id").asText("");
        if (itemId.isBlank()) {
            throw new ProvedorIndisponivelException("A Pluggy não devolveu o item da conexão.");
        }
        conexao.setPluggyItemId(itemId);
        conexao.setPluggyExecutionStatus(statusPluggy(item));
        conexao.setStatus(StatusConexao.SINCRONIZANDO);
        conexao.setUltimoErro("");
        return conexaoRepository.save(conexao);
    }

    public String connectToken(Long idConexao) {
        ConexaoBancaria conexao = conexaoService.buscar(idConexao);
        if (conexao.getProvedor() != ProvedorBancario.PLUGGY) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Connect token é da conexão Open Finance.");
        }
        return pluggy.connectToken(conexao.getPluggyItemId());
    }

    private SincronizacaoResponseDto sincronizarXp(ConexaoBancaria conexao) {
        List<String> faltas = xp.pendencias(conexao);
        conexao.setStatus(StatusConexao.AGUARDANDO_AUTORIZACAO);
        conexao.setUltimoErro(String.join(" ", faltas));
        conexao.setAviso("A XP ainda não autorizou o Data Access. Nenhum lançamento foi gerado.");
        conexaoRepository.save(conexao);
        return new SincronizacaoResponseDto(0, 0, conexao.getStatus().name(), conexao.getAviso(), faltas);
    }

    private SincronizacaoResponseDto sincronizarItau(ConexaoBancaria conexao, LocalDate inicio, LocalDate fim) {
        ContaBancaria conta = conexao.getContaBancaria();
        String statementId = conexaoService.statement(conta, conexao.getDigitoVerificador());
        conexao.setStatementId(statementId);
        String tipo = ConexaoService.tipoItau(conexao.getTipoContaItau(), conta);
        conexao.setTipoContaItau(tipo);
        String de = inicio.toString();
        String ate = fim.toString();
        List<Lancamento> lancamentos = new ArrayList<>();
        Set<String> vistos = new HashSet<>();
        boolean reconhecido = true;
        StringBuilder bruto = new StringBuilder();
        int pagina = 1;
        Integer total = null;
        while (pagina <= 30 && (total == null || pagina <= total)) {
            JsonNode corpo = itau.extrato(conexao.getAmbiente(), statementId, tipo, de, ate, pagina);
            guardarTrecho(bruto, corpo);
            ItauExtratoReader.Leitura leitura = ItauExtratoReader.ler(corpo);
            if (!leitura.esquemaReconhecido()) {
                reconhecido = false;
            }
            if (leitura.totalPaginas() != null) {
                total = leitura.totalPaginas();
            }
            int antes = vistos.size();
            for (ItauExtratoReader.Evento evento : leitura.eventos()) {
                if (vistos.add(evento.idExterno())) {
                    lancamentos.add(new Lancamento(evento.idExterno(), evento.tipo(), evento.valor(), evento.quando(), evento.descricao(), evento.categoria()));
                }
            }
            if (leitura.eventos().isEmpty() || vistos.size() == antes) {
                break;
            }
            pagina++;
        }
        gravarCaptura(conexao, TipoCaptura.EXTRATO, bruto.toString());
        if (!reconhecido) {
            conexao.setStatus(StatusConexao.ERRO);
            conexao.setAviso("O extrato foi guardado. O OpenAPI 3.0.0 do portal Itaú ainda não nomeia os campos deste payload, então nenhum lançamento novo entrou.");
            conexao.setUltimoErro(conexao.getAviso());
            conexaoRepository.save(conexao);
            return new SincronizacaoResponseDto(0, 0, conexao.getStatus().name(), conexao.getAviso(), List.of());
        }
        int[] contagem = gravar(conta, OrigemDados.ITAU, lancamentos);
        StringBuilder aviso = new StringBuilder();
        aplicarSaldoItau(conexao, statementId, aviso);
        capturarLado(conexao, TipoCaptura.APLICACAO_AUTOMATICA, aviso, () -> itau.aplicacaoAutomatica(conexao.getAmbiente(), statementId, de, ate));
        capturarLado(conexao, TipoCaptura.ORDEM_JUDICIAL, aviso, () -> itau.ordensJudiciais(conexao.getAmbiente(), statementId, de, ate, 1));
        capturarLado(conexao, TipoCaptura.SALDO_INVESTIMENTO, aviso, () -> itau.saldosInvestimento(conexao.getAmbiente(), statementId, ate));
        capturarLado(conexao, TipoCaptura.RECEBIVEL, aviso, () -> itau.recebiveis(conexao.getAmbiente(), statementId, de, ate));
        conexao.setStatus(StatusConexao.CONECTADA);
        conexao.setUltimaSincronizacao(LocalDateTime.now());
        conexao.setUltimoErro("");
        conexao.setAviso(aviso.toString());
        conexaoRepository.save(conexao);
        return new SincronizacaoResponseDto(contagem[0], contagem[1], conexao.getStatus().name(), conexao.getAviso(), List.of());
    }

    private void aplicarSaldoItau(ConexaoBancaria conexao, String statementId, StringBuilder aviso) {
        try {
            JsonNode saldos = itau.saldos(conexao.getAmbiente());
            gravarCaptura(conexao, TipoCaptura.SALDO, saldos.toString());
            BigDecimal saldo = SaldoProvedor.itau(saldos, statementId);
            if (saldo == null) {
                aviso.append("GET /balances não trouxe um amount.value ligado a esta conta. O saldo local foi mantido. ");
                return;
            }
            conexao.getContaBancaria().setSaldo(saldo);
        } catch (ProvedorIndisponivelException ex) {
            aviso.append(ex.getMessage()).append(' ');
        }
    }

    private void capturarLado(ConexaoBancaria conexao, TipoCaptura tipo, StringBuilder aviso, Lado lado) {
        try {
            JsonNode corpo = lado.buscar();
            gravarCaptura(conexao, tipo, corpo.toString());
        } catch (ProvedorIndisponivelException ex) {
            aviso.append(tipo.name()).append(": ").append(ex.getMessage()).append(' ');
        }
    }

    private SincronizacaoResponseDto sincronizarPluggy(ConexaoBancaria conexao, LocalDate inicio, LocalDate fim) {
        if (conexao.getPluggyItemId() == null || conexao.getPluggyItemId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Conecte o sandbox da Pluggy antes de sincronizar.");
        }
        pluggy.atualizarItem(conexao.getPluggyItemId());
        JsonNode item = esperarItem(conexao.getPluggyItemId());
        String execucao = statusPluggy(item);
        conexao.setPluggyExecutionStatus(execucao);
        if (!sucesso(execucao, item.path("status").asText(""))) {
            StatusConexao status = esperando(execucao) ? StatusConexao.SINCRONIZANDO : StatusConexao.ERRO;
            conexao.setStatus(status);
            conexao.setUltimoErro(execucao.isBlank() ? "A Pluggy ainda não concluiu a execução." : execucao);
            conexaoRepository.save(conexao);
            return new SincronizacaoResponseDto(0, 0, status.name(), conexao.getUltimoErro(), List.of());
        }
        JsonNode contas = pluggy.contas(conexao.getPluggyItemId());
        JsonNode contaPluggy = escolherConta(contas, conexao);
        if (contaPluggy == null) {
            conexao.setStatus(StatusConexao.ERRO);
            conexao.setUltimoErro("A Pluggy não devolveu conta para este item.");
            conexaoRepository.save(conexao);
            return new SincronizacaoResponseDto(0, 0, conexao.getStatus().name(), conexao.getUltimoErro(), List.of());
        }
        conexao.setPluggyAccountId(contaPluggy.path("id").asText());
        BigDecimal saldo = SaldoProvedor.pluggy(contaPluggy);
        if (saldo != null) {
            conexao.getContaBancaria().setSaldo(saldo);
        }
        List<Lancamento> lancamentos = new ArrayList<>();
        int pagina = 1;
        Integer total = null;
        while (pagina <= 20 && (total == null || pagina <= total)) {
            JsonNode corpo = pluggy.transacoes(conexao.getPluggyAccountId(), inicio.toString(), fim.toString(), pagina);
            if (PluggyTransacaoReader.totalPaginas(corpo) != null) {
                total = PluggyTransacaoReader.totalPaginas(corpo);
            }
            List<PluggyTransacaoReader.Evento> eventos = PluggyTransacaoReader.lerPagina(corpo);
            if (eventos.isEmpty()) {
                break;
            }
            for (PluggyTransacaoReader.Evento evento : eventos) {
                lancamentos.add(new Lancamento(evento.idExterno(), evento.tipo(), evento.valor(), evento.quando(), evento.descricao(), evento.categoria()));
            }
            pagina++;
        }
        int[] contagem = gravar(conexao.getContaBancaria(), OrigemDados.PLUGGY, lancamentos);
        capturarProduto(conexao, TipoCaptura.INVESTIMENTO, () -> pluggy.investimentos(conexao.getPluggyItemId()));
        capturarProduto(conexao, TipoCaptura.EMPRESTIMO, () -> pluggy.emprestimos(conexao.getPluggyItemId()));
        conexao.setStatus(StatusConexao.CONECTADA);
        conexao.setUltimaSincronizacao(LocalDateTime.now());
        conexao.setUltimoErro("");
        conexao.setAviso("Saldo lido de account.balance.");
        conexaoRepository.save(conexao);
        return new SincronizacaoResponseDto(contagem[0], contagem[1], conexao.getStatus().name(), conexao.getAviso(), List.of());
    }

    private void capturarProduto(ConexaoBancaria conexao, TipoCaptura tipo, Lado lado) {
        try {
            gravarCaptura(conexao, tipo, lado.buscar().toString());
        } catch (ProvedorIndisponivelException ex) {
            conexao.setAviso(tipo.name() + ": " + ex.getMessage());
        }
    }

    private JsonNode esperarItem(String itemId) {
        JsonNode item = pluggy.item(itemId);
        for (int tentativa = 0; tentativa < 5; tentativa++) {
            String execucao = statusPluggy(item);
            String status = item.path("status").asText("");
            if (sucesso(execucao, status) || (!esperando(execucao) && !esperando(status) && !execucao.isBlank())) {
                return item;
            }
            try {
                Thread.sleep(1000);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                return item;
            }
            item = pluggy.item(itemId);
        }
        return item;
    }

    private JsonNode escolherConta(JsonNode contas, ConexaoBancaria conexao) {
        List<JsonNode> lista = PluggyTransacaoReader.resultados(contas);
        if (conexao.getPluggyAccountId() != null) {
            for (JsonNode conta : lista) {
                if (conexao.getPluggyAccountId().equals(conta.path("id").asText())) {
                    return conta;
                }
            }
        }
        String numero = digitos(conexao.getContaBancaria().getNumeroConta());
        JsonNode banco = null;
        for (JsonNode conta : lista) {
            if (!"BANK".equalsIgnoreCase(conta.path("type").asText())) {
                continue;
            }
            String transferencia = conta.path("bankData").path("transferNumber").asText("");
            if (!numero.isBlank() && digitos(transferencia).contains(numero)) {
                return conta;
            }
            if (banco == null && "CHECKING_ACCOUNT".equalsIgnoreCase(conta.path("subtype").asText())) {
                banco = conta;
            }
        }
        return banco != null ? banco : (lista.isEmpty() ? null : lista.get(0));
    }

    private int[] gravar(ContaBancaria conta, OrigemDados origem, List<Lancamento> lancamentos) {
        int novas = 0;
        int atualizadas = 0;
        for (Lancamento lancamento : lancamentos) {
            Operacao existente = operacaoRepository.findByOrigemAndIdExterno(origem, lancamento.id()).orElse(null);
            Operacao operacao = existente == null ? new Operacao() : existente;
            operacao.setOrigem(origem);
            operacao.setIdExterno(cortar(lancamento.id(), 250));
            operacao.setTipoOperacao(lancamento.tipo());
            operacao.setValorOperacao(lancamento.valor().doubleValue());
            operacao.setDtHora(lancamento.quando());
            operacao.setRazaoSocial(cortar(lancamento.descricao(), 250));
            operacao.setCategoria(cortar(lancamento.categoria(), 250));
            operacao.setContaBancaria(conta);
            operacaoRepository.save(operacao);
            if (existente == null) {
                novas++;
            } else {
                atualizadas++;
            }
        }
        return new int[]{novas, atualizadas};
    }

    private void gravarCaptura(ConexaoBancaria conexao, TipoCaptura tipo, String payload) {
        capturaRepository.deleteByConexao_IdConexaoAndTipo(conexao.getIdConexao(), tipo);
        capturaRepository.flush();
        CapturaProvedor captura = new CapturaProvedor();
        captura.setConexao(conexao);
        captura.setTipo(tipo);
        captura.setPayload(cortar(payload, 400000));
        captura.setCapturadoEm(LocalDateTime.now());
        capturaRepository.save(captura);
    }

    private static void guardarTrecho(StringBuilder bruto, JsonNode corpo) {
        if (bruto.length() > 400000) {
            return;
        }
        bruto.append(corpo.toString());
    }

    private static boolean sucesso(String execucao, String status) {
        String texto = (execucao + " " + status).toUpperCase();
        return texto.contains("SUCCESS") || texto.contains("UPDATED") || texto.contains("PARTIAL_SUCCESS");
    }

    private static boolean esperando(String texto) {
        String valor = texto == null ? "" : texto.toUpperCase();
        return valor.contains("PENDING") || valor.contains("WAITING") || valor.contains("UPDATING") || valor.isBlank();
    }

    private static String statusPluggy(JsonNode item) {
        String execucao = item.path("executionStatus").asText("");
        return execucao.isBlank() ? item.path("status").asText("") : execucao;
    }

    private static LocalDate[] janela(LocalDate inicio, LocalDate fim) {
        if (inicio == null || fim == null) {
            YearMonth mes = YearMonth.now();
            return new LocalDate[]{mes.atDay(1), mes.atEndOfMonth()};
        }
        if (fim.isBefore(inicio)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A data final é anterior à inicial.");
        }
        return new LocalDate[]{inicio, fim};
    }

    private static String digitos(String valor) {
        if (valor == null) {
            return "";
        }
        return valor.replaceAll("\\D", "");
    }

    private static String cortar(String valor, int limite) {
        if (valor == null) {
            return "";
        }
        return valor.length() <= limite ? valor : valor.substring(0, limite);
    }

    private record Lancamento(
            String id,
            TipoOperacao tipo,
            BigDecimal valor,
            LocalDateTime quando,
            String descricao,
            String categoria
    ) {
    }

    @FunctionalInterface
    private interface Lado {
        JsonNode buscar();
    }
}
