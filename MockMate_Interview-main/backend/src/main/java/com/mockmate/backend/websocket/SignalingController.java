package com.mockmate.backend.websocket;

import java.time.Instant;
import java.util.Map;
import java.security.Principal;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.server.ResponseStatusException;

import com.mockmate.backend.dto.ChatMessage;
import com.mockmate.backend.dto.SignalMessage;
import com.mockmate.backend.repository.UserRepository;
import com.mockmate.backend.service.RoomRegistry;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Controller
public class SignalingController {

    private final RoomRegistry roomRegistry;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    public SignalingController(RoomRegistry roomRegistry,
                               SimpMessagingTemplate messagingTemplate,
                               UserRepository userRepository) {
        this.roomRegistry = roomRegistry;
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
    }

    @MessageMapping("/rooms/{roomId}/signal")
    public void signal(@DestinationVariable String roomId,
                       @Payload SignalMessage incoming,
                       Principal principal) {
        String userId = principal.getName();
        if (!roomRegistry.isMember(roomId, userId)) {
            throw new ResponseStatusException(FORBIDDEN, "You are not part of this room");
        }

        String partnerId = roomRegistry.partnerId(roomId, userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Peer not connected"));

        SignalMessage outbound = new SignalMessage(roomId, incoming.type(), userId, incoming.payload());
        messagingTemplate.convertAndSendToUser(partnerId, "/queue/signals", outbound);
    }

    @MessageMapping("/rooms/{roomId}/chat")
    public void chat(@DestinationVariable String roomId,
                     @Payload Map<String, String> payload,
                     Principal principal) {
        String userId = principal.getName();
        if (!roomRegistry.isMember(roomId, userId)) {
            throw new ResponseStatusException(FORBIDDEN, "You are not part of this room");
        }

        String senderName = userRepository.findById(userId)
                .map(user -> user.getName())
                .orElse("MockMate User");

        ChatMessage message = new ChatMessage(
                roomId,
                userId,
                senderName,
                payload.getOrDefault("message", "").trim(),
                Instant.now()
        );

        if (message.message().isBlank()) {
            return;
        }

        messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/chat", message);
    }
}
