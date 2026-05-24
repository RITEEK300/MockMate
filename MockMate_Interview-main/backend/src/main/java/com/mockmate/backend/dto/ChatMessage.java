package com.mockmate.backend.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;

public record ChatMessage(
        String roomId,
        String senderId,
        String senderName,
        @NotBlank String message,
        Instant sentAt
) {
}
