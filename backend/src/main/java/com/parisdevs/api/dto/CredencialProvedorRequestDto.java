package com.parisdevs.api.dto;

public record CredencialProvedorRequestDto(String provedor, String clientId, String clientSecret, String extra) {
}
