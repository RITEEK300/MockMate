package com.mockmate.backend.dto;

public record AuthResponse(
        String token,
        String userId,
        String name,
        String email
) {
}
