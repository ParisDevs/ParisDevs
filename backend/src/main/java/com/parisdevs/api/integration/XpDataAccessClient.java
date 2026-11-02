package com.parisdevs.api.integration;

import com.parisdevs.api.entity.ConexaoBancaria;
import com.parisdevs.api.service.ProvedorCredencialService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * A documentação pública da XP descreve o onboarding (certificado, CName, IPs, avaliação e Subscription Key)
 * e não publica os paths REST. Este cliente não chama a rede e não inventa lançamento.
 */
@Service
public class XpDataAccessClient {

    private final ProvedorCredencialService credenciais;

    public XpDataAccessClient(ProvedorCredencialService credenciais) {
        this.credenciais = credenciais;
    }

    public List<String> pendencias(ConexaoBancaria conexao) {
        List<String> faltas = new ArrayList<>();
        if (!credenciais.certificadoXpReferenciado()) {
            faltas.add("Certificado digital com OCSP e EKU 1.3.6.1.5.5.7.3.2 (Client Authentication), referenciado fora do repositório.");
        }
        if (conexao.getCname() == null || conexao.getCname().isBlank()) {
            faltas.add("CName do certificado.");
        }
        if (conexao.getIps() == null || conexao.getIps().isBlank()) {
            faltas.add("IPs dos servidores que chamarão a API.");
        }
        if (!Boolean.TRUE.equals(conexao.getAvaliacaoSolicitada())) {
            faltas.add("Chamado de avaliação de segurança com o CName e os IPs.");
        }
        if (!credenciais.subscriptionXpPresente()) {
            faltas.add("Subscription Key enviada pela XP depois da aprovação.");
        }
        if (!credenciais.clientIdPresente(com.parisdevs.api.enums.ProvedorBancario.XP)) {
            faltas.add("Client id do OAuth 2.0 para o Access Token.");
        }
        faltas.add("Documentação técnica dos recursos no portal Data Access. Sem ela o extrato não é consultado.");
        return faltas;
    }
}
