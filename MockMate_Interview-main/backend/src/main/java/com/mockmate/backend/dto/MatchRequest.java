package com.mockmate.backend.dto;

import com.mockmate.backend.model.InterviewRole;
import com.mockmate.backend.model.InterviewType;
import jakarta.validation.constraints.NotNull;

public record MatchRequest(
        @NotNull InterviewType interviewType,
        InterviewRole preferredRole
) {
}
