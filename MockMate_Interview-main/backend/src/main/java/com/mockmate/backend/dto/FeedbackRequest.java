package com.mockmate.backend.dto;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record FeedbackRequest(
        @NotBlank String roomId,
        @NotBlank String targetUserId,
        @Min(1) @Max(5) int rating,
        @NotBlank String summary,
        @NotEmpty List<String> highlights,
        @NotEmpty List<String> improvements
) {
}
