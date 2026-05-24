package com.mockmate.backend.dto;

public record MatchStatusResponse(
        String status,
        String roomId,
        String note
) {
}
