package com.parisdevs.api.service;

import com.parisdevs.api.domain.DreRegras;
import com.parisdevs.api.dto.DreGerarRequestDto;
import com.parisdevs.api.dto.DreHistoricoItemDto;
import com.parisdevs.api.dto.DreLinhaDto;
import com.parisdevs.api.dto.DreRelatorioDto;
import com.parisdevs.api.entity.DreDiario;
import com.parisdevs.api.entity.Filial;
import com.parisdevs.api.entity.Operacao;
import com.parisdevs.api.enums.TipoOperacao;
import com.parisdevs.api.exception.DataInvalidaException;
import com.parisdevs.api.exception.FilialNaoEncontradaException;
import com.parisdevs.api.mapper.DreMapper;
import com.parisdevs.api.repository.DreDiarioRepository;
import com.parisdevs.api.repository.FilialRepository;
import com.parisdevs.api.repository.OperacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DreService {

    public static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");

    private final DreDiarioRepository dreDiarioRepository;
    private final FilialRepository filialRepository;
    private final OperacaoRepository operacaoRepository;

    public DreService(
            DreDiarioRepository dreDiarioRepository,
            FilialRepository filialRepository,
            OperacaoRepository operacaoRepository) {
        this.dreDiarioRepository = dreDiarioRepository;
        this.filialRepository = filialRepository;
        this.operacaoRepository = operacaoRepository;
    }

    public LocalDate dataPadrao() {
        return LocalDate.now(ZONE).minusDays(1);
    }

    public DreRelatorioDto consultar(LocalDate data, Integer idFilial) {
        LocalDate dataRef = data == null ? dataPadrao() : data;
        validarData(dataRef);
        List<DreDiario> snapshots = snapshots(dataRef, idFilial);
        if (!snapshots.isEmpty()) {
            return montar(dataRef, "SNAPSHOT", snapshots.stream().map(DreMapper::toLinha).toList());
        }
        return montar(dataRef, "AO_VIVO", calcularLinhas(dataRef, idFilial));
    }

    public List<DreHistoricoItemDto> historico(Integer idFilial) {
        List<DreDiario> rows = idFilial == null
                ? dreDiarioRepository.findAllByOrderByDataReferenciaDesc()
                : dreDiarioRepository.findByFilial_IdFilialOrderByDataReferenciaDesc(idFilial);
        Map<LocalDate, List<DreDiario>> porData = new LinkedHashMap<>();
        for (DreDiario row : rows) {
            porData.computeIfAbsent(row.getDataReferencia(), key -> new ArrayList<>()).add(row);
        }
        List<DreHistoricoItemDto> itens = new ArrayList<>();
        for (Map.Entry<LocalDate, List<DreDiario>> entry : porData.entrySet()) {
            List<DreLinhaDto> linhas = entry.getValue().stream().map(DreMapper::toLinha).toList();
            DreLinhaDto total = DreMapper.totalOf(linhas);
            DreHistoricoItemDto item = new DreHistoricoItemDto();
            item.setDataReferencia(entry.getKey());
            item.setGeradoEm(entry.getValue().stream()
                    .map(DreDiario::getGeradoEm)
                    .filter(valor -> valor != null)
                    .max(Comparator.naturalOrder())
                    .orElse(null));
            item.setReceitaTotal(total.getReceitaTotal());
            item.setReceitaLiquida(total.getReceitaLiquida());
            item.setMercadorias(total.getMercadorias());
            item.setPercMercadorias(total.getPercMercadorias());
            item.setResultado(total.getResultado());
            itens.add(item);
        }
        return itens;
    }

    @Transactional
    public DreRelatorioDto gerar(DreGerarRequestDto request) {
        LocalDate dataRef = request == null || request.getData() == null ? dataPadrao() : request.getData();
        Integer idFilial = request == null ? null : request.getIdFilial();
        validarData(dataRef);
        List<DreLinhaDto> linhas = calcularLinhas(dataRef, idFilial);
        LocalDateTime agora = LocalDateTime.now(ZONE);
        for (DreLinhaDto linha : linhas) {
            Filial filial = filialRepository.findById(linha.getIdFilial())
                    .orElseThrow(FilialNaoEncontradaException::new);
            DreDiario row = dreDiarioRepository
                    .findByDataReferenciaAndFilial_IdFilial(dataRef, filial.getIdFilial())
                    .orElseGet(DreDiario::new);
            row.setDataReferencia(dataRef);
            row.setFilial(filial);
            row.setReceitaTotal(DreMapper.money(n(linha.getReceitaTotal())));
            row.setReceitaLiquida(DreMapper.money(n(linha.getReceitaLiquida())));
            row.setMercadorias(DreMapper.money(n(linha.getMercadorias())));
            row.setPercMercadorias(DreMapper.ratio(linha.getPercMercadorias()));
            row.setResultado(DreMapper.money(n(linha.getResultado())));
            row.setGeradoEm(agora);
            dreDiarioRepository.save(row);
        }
        return montar(dataRef, "SNAPSHOT", linhas);
    }

    private List<DreDiario> snapshots(LocalDate dataRef, Integer idFilial) {
        if (idFilial == null) {
            return dreDiarioRepository.findByDataReferenciaOrderByFilial_IdFilialAsc(dataRef);
        }
        return dreDiarioRepository.findByDataReferenciaAndFilial_IdFilialOrderByFilial_IdFilialAsc(dataRef, idFilial);
    }

    private List<DreLinhaDto> calcularLinhas(LocalDate dataRef, Integer idFilial) {
        List<Filial> filiais = filiaisDoRecorte(idFilial);
        LocalDateTime inicio = dataRef.withDayOfMonth(1).atStartOfDay();
        LocalDateTime fim = dataRef.plusDays(1).atStartOfDay();
        List<Operacao> operacoes = operacaoRepository.findAllWithContaAndFilial();
        List<DreLinhaDto> linhas = new ArrayList<>();
        for (Filial filial : filiais) {
            double receita = 0;
            double pagamentos = 0;
            double mercadorias = 0;
            for (Operacao operacao : operacoes) {
                if (operacao.getDtHora() == null || operacao.getContaBancaria() == null
                        || operacao.getContaBancaria().getFilial() == null) {
                    continue;
                }
                if (!filial.getIdFilial().equals(operacao.getContaBancaria().getFilial().getIdFilial())) {
                    continue;
                }
                if (operacao.getDtHora().isBefore(inicio) || !operacao.getDtHora().isBefore(fim)) {
                    continue;
                }
                double valor = operacao.getValorOperacao() == null ? 0 : operacao.getValorOperacao();
                if (operacao.getTipoOperacao() == TipoOperacao.RECEBIMENTO) {
                    receita += valor;
                } else if (operacao.getTipoOperacao() == TipoOperacao.PAGAMENTO) {
                    pagamentos += valor;
                    if (DreRegras.isMercadoria(operacao.getCategoria())
                            || DreRegras.isMercadoria(operacao.getRazaoSocial())) {
                        mercadorias += valor;
                    }
                }
            }
            DreLinhaDto linha = new DreLinhaDto();
            linha.setIdFilial(filial.getIdFilial());
            linha.setEmpresaRelatorio(DreRegras.empresaRelatorio(filial.getRazaoSocial()));
            double liquida = receita * DreRegras.FATOR_LIQUIDO;
            linha.setReceitaTotal(DreMapper.money(receita).doubleValue());
            linha.setReceitaLiquida(DreMapper.money(liquida).doubleValue());
            linha.setMercadorias(DreMapper.money(mercadorias).doubleValue());
            linha.setPercMercadorias(liquida == 0 ? null : DreMapper.ratio(mercadorias / liquida).doubleValue());
            linha.setResultado(DreMapper.money(liquida - pagamentos).doubleValue());
            linhas.add(linha);
        }
        linhas.sort(Comparator.comparing(DreLinhaDto::getEmpresaRelatorio, String.CASE_INSENSITIVE_ORDER));
        return linhas;
    }

    private List<Filial> filiaisDoRecorte(Integer idFilial) {
        if (idFilial == null) {
            return filialRepository.findAll();
        }
        Filial filial = filialRepository.findById(idFilial).orElseThrow(FilialNaoEncontradaException::new);
        return List.of(filial);
    }

    private DreRelatorioDto montar(LocalDate dataRef, String origem, List<DreLinhaDto> linhas) {
        DreRelatorioDto dto = new DreRelatorioDto();
        dto.setDataReferencia(dataRef);
        dto.setOrigem(origem);
        dto.setLinhas(linhas);
        dto.setTotal(DreMapper.totalOf(linhas));
        return dto;
    }

    private void validarData(LocalDate data) {
        if (data == null) {
            throw new DataInvalidaException();
        }
    }

    private static double n(Double value) {
        return value == null ? 0 : value;
    }
}
