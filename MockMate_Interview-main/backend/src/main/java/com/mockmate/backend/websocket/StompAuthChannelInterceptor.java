package com.mockmate.backend.websocket;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.mockmate.backend.dto.QueueTicket;
import com.mockmate.backend.security.JwtService;
import com.mockmate.backend.service.MatchmakingService;
import com.mockmate.backend.service.RoomRegistry;

import io.jsonwebtoken.Claims;

@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final RoomRegistry roomRegistry;
    private final MatchmakingService matchmakingService;
    private final SimpMessagingTemplate messagingTemplate;

    public StompAuthChannelInterceptor(JwtService jwtService,
                                       RoomRegistry roomRegistry,
                                       @Lazy MatchmakingService matchmakingService,
                                       @Lazy SimpMessagingTemplate messagingTemplate) {
        this.jwtService = jwtService;
        this.roomRegistry = roomRegistry;
        this.matchmakingService = matchmakingService;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authorization = firstHeader(accessor, HttpHeaders.AUTHORIZATION);
            if (authorization != null && authorization.startsWith("Bearer ")) {
                Claims claims = jwtService.parse(authorization.substring(7));
                UsernamePasswordAuthenticationToken principal = new UsernamePasswordAuthenticationToken(
                        claims.getSubject(),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))
                );
                accessor.setUser(principal);
            }
        }

        if (StompCommand.DISCONNECT.equals(accessor.getCommand()) && accessor.getUser() != null) {
            String userId = accessor.getUser().getName();
            Optional<String> roomId = roomRegistry.roomStateFor(userId).map(room -> room.roomId());
            Optional<String> partnerId = roomId.flatMap(id -> roomRegistry.partnerId(id, userId));
            Optional<QueueTicket> requeueTicket = roomRegistry.removeRoomAndPrepareRequeue(userId);
            requeueTicket.ifPresent(matchmakingService::requeueAfterDisconnect);
            partnerId.ifPresent(partner -> {
                messagingTemplate.convertAndSendToUser(partner, "/queue/room", "partner-disconnected");
                roomRegistry.payloadFor(partner)
                        .ifPresent(payload -> messagingTemplate.convertAndSendToUser(partner, "/queue/match", payload));
            });
        }

        return message;
    }

    private String firstHeader(StompHeaderAccessor accessor, String headerName) {
        List<String> values = accessor.getNativeHeader(headerName);
        if (values == null || values.isEmpty()) {
            return null;
        }
        return values.get(0);
    }
}
