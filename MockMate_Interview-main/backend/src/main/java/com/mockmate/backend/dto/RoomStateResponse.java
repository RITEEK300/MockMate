package com.mockmate.backend.dto;

import java.util.List;

import com.mockmate.backend.model.InterviewRole;
import com.mockmate.backend.model.InterviewType;

public record RoomStateResponse(
        String roomId,
        InterviewType interviewType,
        InterviewRole assignedRole,
        String partnerId,
        String partnerName,
        long durationSeconds,
        List<String> questions,
        boolean initiator
) {
}
