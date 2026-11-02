package com.parisdevs.api.dto;

import java.util.List;

public record GrupoRequestDto(String titulo, List<Integer> usuarioIds) {
}
