package com.parisdevs.api.mapper;

import com.parisdevs.api.domain.DreRegras;
import com.parisdevs.api.dto.DreLinhaDto;
import com.parisdevs.api.entity.DreDiario;
import com.parisdevs.api.entity.Filial;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public class DreMapper {

    private DreMapper() {
    }

    public static DreLinhaDto toLinha(DreDiario row) {
        if (row == null) {
            return null;
        }
        DreLinhaDto dto = new DreLinhaDto();
        Filial filial = row.getFilial();
        dto.setIdFilial(filial == null ? null : filial.getIdFilial());
        dto.setEmpresaRelatorio(DreRegras.empresaRelatorio(filial == null ? null : filial.getRazaoSocial()));
        dto.setReceitaTotal(toDouble(row.getReceitaTotal()));
        dto.setReceitaLiquida(toDouble(row.getReceitaLiquida()));
        dto.setMercadorias(toDouble(row.getMercadorias()));
        dto.setPercMercadorias(row.getPercMercadorias() == null ? null : row.getPercMercadorias().doubleValue());
        dto.setResultado(toDouble(row.getResultado()));
        return dto;
    }

    public static DreLinhaDto totalOf(List<DreLinhaDto> linhas) {
        DreLinhaDto total = new DreLinhaDto();
        total.setEmpresaRelatorio("Total");
        double receita = 0;
        double liquida = 0;
        double mercadorias = 0;
        double resultado = 0;
        if (linhas != null) {
            for (DreLinhaDto linha : linhas) {
                receita += n(linha.getReceitaTotal());
                liquida += n(linha.getReceitaLiquida());
                mercadorias += n(linha.getMercadorias());
                resultado += n(linha.getResultado());
            }
        }
        total.setReceitaTotal(round(receita));
        total.setReceitaLiquida(round(liquida));
        total.setMercadorias(round(mercadorias));
        total.setPercMercadorias(liquida == 0 ? null : roundRatio(mercadorias / liquida));
        total.setResultado(round(resultado));
        return total;
    }

    public static BigDecimal money(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal ratio(Double value) {
        if (value == null) {
            return null;
        }
        return BigDecimal.valueOf(value).setScale(6, RoundingMode.HALF_UP);
    }

    private static double n(Double value) {
        return value == null ? 0 : value;
    }

    private static Double toDouble(BigDecimal value) {
        return value == null ? 0d : value.doubleValue();
    }

    private static Double round(double value) {
        return money(value).doubleValue();
    }

    private static Double roundRatio(double value) {
        return BigDecimal.valueOf(value).setScale(6, RoundingMode.HALF_UP).doubleValue();
    }
}
