package com.mockmate.backend.dto;

import java.util.Map;

public record SignalMessage(
        String roomId,
        String type,
        String senderId,
        Map<String, Object> payload
) {
}
