package com.mockmate.backend.dto;

import java.time.Instant;

import com.mockmate.backend.model.InterviewRole;
import com.mockmate.backend.model.InterviewType;

public record QueueTicket(
        String userId,
        InterviewType interviewType,
        InterviewRole preferredRole,
        Instant queuedAt
) {
}
