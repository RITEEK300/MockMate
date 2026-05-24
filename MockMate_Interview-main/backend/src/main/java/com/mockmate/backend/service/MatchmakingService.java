package com.mockmate.backend.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mockmate.backend.dto.MatchFoundPayload;
import com.mockmate.backend.dto.MatchRequest;
import com.mockmate.backend.dto.MatchStatusResponse;
import com.mockmate.backend.dto.QueueTicket;
import com.mockmate.backend.model.InterviewRole;
import com.mockmate.backend.model.InterviewType;
import com.mockmate.backend.model.User;
import com.mockmate.backend.repository.UserRepository;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class MatchmakingService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final RoomRegistry roomRegistry;
    private final QuestionCatalogService questionCatalogService;
    private final SimpMessagingTemplate messagingTemplate;

    public MatchmakingService(StringRedisTemplate redisTemplate,
                              ObjectMapper objectMapper,
                              UserRepository userRepository,
                              RoomRegistry roomRegistry,
                              QuestionCatalogService questionCatalogService,
                              SimpMessagingTemplate messagingTemplate) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.userRepository = userRepository;
        this.roomRegistry = roomRegistry;
        this.questionCatalogService = questionCatalogService;
        this.messagingTemplate = messagingTemplate;
    }

    public MatchStatusResponse enqueue(String userId, MatchRequest request) {
        dequeueUser(userId);

        QueueTicket ticket = new QueueTicket(userId, request.interviewType(), request.preferredRole(), Instant.now());
        redisTemplate.opsForList().rightPush(queueKey(request.interviewType()), serialize(ticket));
        return new MatchStatusResponse("QUEUED", null, "Searching for a peer");
    }

    public MatchStatusResponse cancel(String userId) {
        dequeueUser(userId);
        return new MatchStatusResponse("CANCELLED", null, "Queue entry removed");
    }

    public MatchStatusResponse status(String userId) {
        Optional<MatchFoundPayload> roomPayload = roomRegistry.payloadFor(userId);
        if (roomPayload.isPresent()) {
            return new MatchStatusResponse("MATCHED", roomPayload.get().roomId(), "Room ready");
        }

        boolean queued = EnumSet.allOf(InterviewType.class).stream()
                .map(this::queueKey)
                .map(key -> redisTemplate.opsForList().range(key, 0, -1))
                .filter(Objects::nonNull)
                .flatMap(List::stream)
                .map(this::deserialize)
                .flatMap(Optional::stream)
                .anyMatch(ticket -> ticket.userId().equals(userId));

        return queued
                ? new MatchStatusResponse("QUEUED", null, "Still waiting for a match")
                : new MatchStatusResponse("IDLE", null, "Not in queue");
    }

    public void requeueAfterDisconnect(QueueTicket ticket) {
        redisTemplate.opsForList().rightPush(queueKey(ticket.interviewType()), serialize(
                new QueueTicket(ticket.userId(), ticket.interviewType(), ticket.preferredRole(), Instant.now())
        ));
    }

    @Scheduled(fixedDelayString = "${app.matchmaking.poll-ms:1500}")
    public void attemptMatches() {
        for (InterviewType type : InterviewType.values()) {
            tryMatch(type);
        }
    }

    private void tryMatch(InterviewType type) {
        List<String> rawItems = redisTemplate.opsForList().range(queueKey(type), 0, -1);
        if (rawItems == null || rawItems.size() < 2) {
            return;
        }

        List<QueueEntry> entries = rawItems.stream()
                .map(raw -> deserialize(raw).map(ticket -> new QueueEntry(raw, ticket)).orElse(null))
                .filter(Objects::nonNull)
                .toList();

        for (int i = 0; i < entries.size(); i++) {
            for (int j = i + 1; j < entries.size(); j++) {
                QueueEntry first = entries.get(i);
                QueueEntry second = entries.get(j);
                if (first.ticket.userId().equals(second.ticket.userId())) {
                    continue;
                }
                Optional<RolePair> rolePair = assignRoles(first.ticket, second.ticket);
                if (rolePair.isEmpty()) {
                    continue;
                }

                redisTemplate.opsForList().remove(queueKey(type), 1, first.raw);
                redisTemplate.opsForList().remove(queueKey(type), 1, second.raw);
                createRoom(first.ticket, second.ticket, rolePair.get());
                return;
            }
        }
    }

    private void createRoom(QueueTicket firstTicket, QueueTicket secondTicket, RolePair roles) {
        User firstUser = userRepository.findById(firstTicket.userId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Queued user missing"));
        User secondUser = userRepository.findById(secondTicket.userId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Queued user missing"));

        roomRegistry.createRoom(
                firstUser,
                roles.firstRole,
                firstTicket,
                secondUser,
                roles.secondRole,
                secondTicket,
                firstTicket.interviewType(),
                questionCatalogService.getQuestions(firstTicket.interviewType())
        );

        roomRegistry.payloadFor(firstUser.getId())
                .ifPresent(payload -> messagingTemplate.convertAndSendToUser(firstUser.getId(), "/queue/match", payload));
        roomRegistry.payloadFor(secondUser.getId())
                .ifPresent(payload -> messagingTemplate.convertAndSendToUser(secondUser.getId(), "/queue/match", payload));
    }

    private Optional<RolePair> assignRoles(QueueTicket first, QueueTicket second) {
        InterviewRole firstPreferred = first.preferredRole();
        InterviewRole secondPreferred = second.preferredRole();

        if (firstPreferred != null && secondPreferred != null) {
            if (firstPreferred == secondPreferred) {
                return Optional.empty();
            }
            return Optional.of(new RolePair(firstPreferred, secondPreferred));
        }

        if (firstPreferred != null) {
            return Optional.of(new RolePair(firstPreferred, opposite(firstPreferred)));
        }

        if (secondPreferred != null) {
            return Optional.of(new RolePair(opposite(secondPreferred), secondPreferred));
        }

        return Optional.of(new RolePair(InterviewRole.INTERVIEWER, InterviewRole.CANDIDATE));
    }

    private InterviewRole opposite(InterviewRole role) {
        return role == InterviewRole.INTERVIEWER ? InterviewRole.CANDIDATE : InterviewRole.INTERVIEWER;
    }

    private void dequeueUser(String userId) {
        for (InterviewType interviewType : InterviewType.values()) {
            String key = queueKey(interviewType);
            List<String> rawItems = redisTemplate.opsForList().range(key, 0, -1);
            if (rawItems == null || rawItems.isEmpty()) {
                continue;
            }
            List<String> removals = new ArrayList<>();
            for (String rawItem : rawItems) {
                Optional<QueueTicket> ticket = deserialize(rawItem);
                if (ticket.isPresent() && ticket.get().userId().equals(userId)) {
                    removals.add(rawItem);
                }
            }
            removals.forEach(raw -> redisTemplate.opsForList().remove(key, 1, raw));
        }
    }

    private String queueKey(InterviewType interviewType) {
        return "mockmate:queue:" + interviewType.name();
    }

    private String serialize(QueueTicket ticket) {
        try {
            return objectMapper.writeValueAsString(ticket);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Unable to serialize queue ticket", ex);
        }
    }

    private Optional<QueueTicket> deserialize(String raw) {
        try {
            return Optional.of(objectMapper.readValue(raw, QueueTicket.class));
        } catch (JsonProcessingException ex) {
            return Optional.empty();
        }
    }

    private record QueueEntry(String raw, QueueTicket ticket) {
    }

    private record RolePair(InterviewRole firstRole, InterviewRole secondRole) {
    }
}
