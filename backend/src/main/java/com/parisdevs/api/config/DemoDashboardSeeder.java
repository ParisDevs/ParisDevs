package com.parisdevs.api.config;

import com.parisdevs.api.entity.ContaBancaria;
import com.parisdevs.api.entity.Filial;
import com.parisdevs.api.entity.Operacao;
import com.parisdevs.api.enums.TipoOperacao;
import com.parisdevs.api.repository.ContaBancariaRepository;
import com.parisdevs.api.repository.FilialRepository;
import com.parisdevs.api.repository.OperacaoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Component
public class DemoDashboardSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDashboardSeeder.class);

    private final FilialRepository filialRepository;
    private final ContaBancariaRepository contaBancariaRepository;
    private final OperacaoRepository operacaoRepository;

    public DemoDashboardSeeder(
            FilialRepository filialRepository,
            ContaBancariaRepository contaBancariaRepository,
            OperacaoRepository operacaoRepository) {
        this.filialRepository = filialRepository;
        this.contaBancariaRepository = contaBancariaRepository;
        this.operacaoRepository = operacaoRepository;
    }

    @Override
    public void run(String... args) {
        if (contaBancariaRepository.count() > 0) {
            return;
        }
        List<Filial> filiais = filialRepository.findAll();
        if (filiais.isEmpty()) {
            log.warn("Não há filiais para popular o dashboard de demonstração.");
            return;
        }
        Filial f1 = filiais.get(0);
        Filial f2 = filiais.size() > 1 ? filiais.get(1) : f1;

        ContaBancaria itau1 = conta(f1, "341", "Itaú", "0412", "0", "12345-6", "Conta corrente", bd("86420.55"), true);
        ContaBancaria xp = conta(f1, "102", "XP", "0001", "0", "889210-3", "Conta investimento", bd("154300.00"), true);
        ContaBancaria btg = conta(f1, "208", "BTG Pactual", "0001", "0", "77210-8", "Conta investimento", bd("98000.00"), true);
        ContaBancaria itau2 = conta(f2, "341", "Itaú", "0412", "0", "22841-0", "Conta corrente", bd("18400.00"), true);
        ContaBancaria bradesco = conta(f2, "237", "Bradesco", "1290", "7", "0045821-7", "Conta corrente", bd("6200.00"), true);
        conta(f2, "341", "Itaú", "0798", "4", "33012-4", "Conta corrente", bd("212870.30"), true);
        conta(f2, "033", "Santander", "3321", "9", "13002541-9", "Conta corrente", null, false);

        LocalDate hoje = LocalDate.now();
        YearMonth atual = YearMonth.from(hoje);
        for (int i = 11; i >= 0; i--) {
            YearMonth mes = atual.minusMonths(i);
            int fator = 12 - i;
            lancarMes(itau1, mes, 42000 + fator * 1800, 31000 + fator * 900);
            lancarMes(xp, mes, 18000 + fator * 700, 9000 + fator * 400);
            lancarMes(btg, mes, 12000 + fator * 500, 4000 + fator * 250);
            lancarMes(itau2, mes, 15000 + fator * 600, 11000 + fator * 350);
            lancarMes(bradesco, mes, 8000 + fator * 300, 7200 + fator * 200);
        }

        operacao(itau1, TipoOperacao.RECEBIMENTO, 8500, "Vendas no salão", f1.getRazaoSocial(), hoje.atTime(9, 20));
        operacao(itau1, TipoOperacao.PAGAMENTO, 1200, "Tarifas bancárias", "Itaú", hoje.atTime(11, 5));
        operacao(xp, TipoOperacao.RECEBIMENTO, 3200, "Aplicações financeiras", "XP Investimentos", hoje.atTime(14, 40));

        log.info("Dashboard de demonstração populado (contas e operações fictícias; sem Open Finance real).");
    }

    private void lancarMes(ContaBancaria conta, YearMonth mes, double entradas, double saidas) {
        Filial filial = conta.getFilial();
        String titular = filial != null ? filial.getRazaoSocial() : "Titular";
        operacao(conta, TipoOperacao.RECEBIMENTO, round(entradas * 0.55), "Vendas no salão", titular, mes.atDay(5).atTime(10, 15));
        operacao(conta, TipoOperacao.RECEBIMENTO, round(entradas * 0.30), "Vendas delivery", titular, mes.atDay(12).atTime(18, 40));
        operacao(conta, TipoOperacao.RECEBIMENTO, round(entradas * 0.15), "Serviços", titular, mes.atDay(Math.min(20, mes.lengthOfMonth())).atTime(9, 5));
        operacao(conta, TipoOperacao.PAGAMENTO, round(saidas * 0.40), "Alimentos", "Fornecedor Central", mes.atDay(3).atTime(8, 30));
        operacao(conta, TipoOperacao.PAGAMENTO, round(saidas * 0.35), "Folha e encargos", "Folha de pagamento", mes.atDay(10).atTime(7, 0));
        operacao(conta, TipoOperacao.PAGAMENTO, round(saidas * 0.15), "Aluguel e ocupação", "Imobiliária Parque", mes.atDay(8).atTime(9, 0));
        operacao(conta, TipoOperacao.PAGAMENTO, round(saidas * 0.10), "Energia", "Concessionária", mes.atDay(Math.min(18, mes.lengthOfMonth())).atTime(16, 20));
    }

    private ContaBancaria conta(
            Filial filial,
            String codigoBanco,
            String instituicao,
            String agencia,
            String digito,
            String numero,
            String tipo,
            BigDecimal saldo,
            boolean ativo) {
        ContaBancaria conta = new ContaBancaria();
        conta.setFilial(filial);
        conta.setCodigoBanco(codigoBanco);
        conta.setNomeInstituicao(instituicao);
        conta.setAgencia(agencia);
        conta.setAgenciaDigito(digito);
        conta.setNumeroConta(numero);
        conta.setTipoConta(tipo);
        conta.setCpfCnpjTitular(filial.getCnpj());
        conta.setNomeTitular(filial.getRazaoSocial());
        conta.setAtivo(ativo);
        conta.setSaldo(saldo);
        return contaBancariaRepository.save(conta);
    }

    private void operacao(
            ContaBancaria conta,
            TipoOperacao tipo,
            double valor,
            String categoria,
            String razaoSocial,
            LocalDateTime quando) {
        Operacao op = new Operacao();
        op.setContaBancaria(conta);
        op.setTipoOperacao(tipo);
        op.setValorOperacao(valor);
        op.setCategoria(categoria);
        op.setRazaoSocial(razaoSocial);
        op.setDtHora(quando);
        operacaoRepository.save(op);
    }

    private static BigDecimal bd(String value) {
        return new BigDecimal(value);
    }

    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
