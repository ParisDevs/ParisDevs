package com.parisdevs.api.service;

import com.parisdevs.api.enums.ProvedorBancario;
import com.parisdevs.api.exception.ProvedorNaoConfiguradoException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.EnumMap;

@Service
public class ProvedorCredencialService {

    public record Segredo(String clientId, String clientSecret, String extra) {
    }

    private final EnumMap<ProvedorBancario, Segredo> memoria = new EnumMap<>(ProvedorBancario.class);
    private final String itauClientId;
    private final String itauClientSecret;
    private final String pluggyClientId;
    private final String pluggyClientSecret;
    private final String xpClientId;
    private final String xpClientSecret;
    private final String xpSubscriptionKey;
    private final String xpCertificado;

    public ProvedorCredencialService(
            @Value("${app.itau.client-id:}") String itauClientId,
            @Value("${app.itau.client-secret:}") String itauClientSecret,
            @Value("${app.pluggy.client-id:}") String pluggyClientId,
            @Value("${app.pluggy.client-secret:}") String pluggyClientSecret,
            @Value("${app.xp.client-id:}") String xpClientId,
            @Value("${app.xp.client-secret:}") String xpClientSecret,
            @Value("${app.xp.subscription-key:}") String xpSubscriptionKey,
            @Value("${app.xp.certificado-caminho:}") String xpCertificado
    ) {
        this.itauClientId = itauClientId;
        this.itauClientSecret = itauClientSecret;
        this.pluggyClientId = pluggyClientId;
        this.pluggyClientSecret = pluggyClientSecret;
        this.xpClientId = xpClientId;
        this.xpClientSecret = xpClientSecret;
        this.xpSubscriptionKey = xpSubscriptionKey;
        this.xpCertificado = xpCertificado;
    }

    public synchronized void definir(ProvedorBancario provedor, String clientId, String clientSecret, String extra) {
        memoria.put(provedor, new Segredo(limpo(clientId), limpo(clientSecret), limpo(extra)));
    }

    public boolean clientIdPresente(ProvedorBancario provedor) {
        return !resolver(provedor).clientId().isBlank();
    }

    public boolean configurado(ProvedorBancario provedor) {
        Segredo segredo = resolver(provedor);
        if (provedor == ProvedorBancario.XP) {
            return !segredo.extra().isBlank() || !segredo.clientId().isBlank();
        }
        return !segredo.clientId().isBlank() && !segredo.clientSecret().isBlank();
    }

    public Segredo exigir(ProvedorBancario provedor) {
        Segredo segredo = resolver(provedor);
        if (provedor != ProvedorBancario.XP && (segredo.clientId().isBlank() || segredo.clientSecret().isBlank())) {
            throw new ProvedorNaoConfiguradoException(provedor.name());
        }
        return segredo;
    }

    public boolean certificadoXpReferenciado() {
        Segredo segredo = resolver(ProvedorBancario.XP);
        return !segredo.clientSecret().isBlank() || !xpCertificado.isBlank();
    }

    public boolean subscriptionXpPresente() {
        return !resolver(ProvedorBancario.XP).extra().isBlank();
    }

    private Segredo resolver(ProvedorBancario provedor) {
        Segredo naMemoria = memoria.get(provedor);
        Segredo ambiente = switch (provedor) {
            case ITAU -> new Segredo(itauClientId, itauClientSecret, "");
            case PLUGGY -> new Segredo(pluggyClientId, pluggyClientSecret, "");
            case XP -> new Segredo(xpClientId, xpCertificado, xpSubscriptionKey);
        };
        if (naMemoria == null) {
            return ambiente;
        }
        return new Segredo(
                preferir(naMemoria.clientId(), ambiente.clientId()),
                preferir(naMemoria.clientSecret(), ambiente.clientSecret()),
                preferir(naMemoria.extra(), ambiente.extra())
        );
    }

    private static String preferir(String memoria, String ambiente) {
        return memoria == null || memoria.isBlank() ? limpo(ambiente) : memoria;
    }

    private static String limpo(String valor) {
        return valor == null ? "" : valor.trim();
    }
}
