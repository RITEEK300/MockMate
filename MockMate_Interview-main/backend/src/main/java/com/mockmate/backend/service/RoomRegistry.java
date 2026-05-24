package com.mockmate.backend.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.mockmate.backend.dto.MatchFoundPayload;
import com.mockmate.backend.dto.QueueTicket;
import com.mockmate.backend.dto.RoomStateResponse;
import com.mockmate.backend.model.InterviewRole;
import com.mockmate.backend.model.InterviewType;
import com.mockmate.backend.model.RoomStatus;
import com.mockmate.backend.model.User;

@Component
public class RoomRegistry {

    private final Map<String, RoomSession> roomsById = new ConcurrentHashMap<>();
    private final Map<String, String> roomIdByUser = new ConcurrentHashMap<>();

    public RoomSession createRoom(User firstUser,
                                  InterviewRole firstRole,
                                  QueueTicket firstTicket,
                                  User secondUser,
                                  InterviewRole secondRole,
                                  QueueTicket secondTicket,
                                  InterviewType interviewType,
                                  List<String> questions) {
        String roomId = UUID.randomUUID().toString();
        String initiatorUserId = firstUser.getId().compareTo(secondUser.getId()) <= 0 ? firstUser.getId() : secondUser.getId();

        RoomParticipant first = new RoomParticipant(firstUser.getId(), firstUser.getName(), firstRole, firstTicket);
        RoomParticipant second = new RoomParticipant(secondUser.getId(), secondUser.getName(), secondRole, secondTicket);

        RoomSession room = new RoomSession(roomId, interviewType, RoomStatus.ACTIVE, 900L, questions, initiatorUserId, Instant.now());
        room.participants.put(first.userId(), first);
        room.participants.put(second.userId(), second);

        roomsById.put(roomId, room);
        roomIdByUser.put(first.userId(), roomId);
        roomIdByUser.put(second.userId(), roomId);
        return room;
    }

    public Optional<RoomStateResponse> roomStateFor(String userId) {
        String roomId = roomIdByUser.get(userId);
        if (roomId == null) {
            return Optional.empty();
        }
        return roomState(roomId, userId);
    }

    public Optional<RoomStateResponse> roomState(String roomId, String userId) {
        RoomSession room = roomsById.get(roomId);
        if (room == null) {
            return Optional.empty();
        }
        RoomParticipant self = room.participants.get(userId);
        if (self == null) {
            return Optional.empty();
        }
        RoomParticipant partner = room.participants.values().stream()
                .filter(participant -> !participant.userId().equals(userId))
                .findFirst()
                .orElse(null);
        if (partner == null) {
            return Optional.empty();
        }

        return Optional.of(new RoomStateResponse(
                room.roomId,
                room.interviewType,
                self.role(),
                partner.userId(),
                partner.name(),
                room.durationSeconds,
                room.questions,
                room.initiatorUserId.equals(userId)
        ));
    }

    public Optional<MatchFoundPayload> payloadFor(String userId) {
        return roomStateFor(userId)
                .map(room -> new MatchFoundPayload(
                        room.roomId(),
                        room.interviewType(),
                        room.assignedRole(),
                        room.partnerId(),
                        room.partnerName(),
                        room.durationSeconds(),
                        room.questions(),
                        room.initiator()
                ));
    }

    public Optional<String> partnerId(String roomId, String userId) {
        RoomSession room = roomsById.get(roomId);
        if (room == null || !room.participants.containsKey(userId)) {
            return Optional.empty();
        }
        return room.participants.values().stream()
                .filter(participant -> !participant.userId().equals(userId))
                .map(RoomParticipant::userId)
                .findFirst();
    }

    public Optional<String> partnerName(String roomId, String userId) {
        RoomSession room = roomsById.get(roomId);
        if (room == null || !room.participants.containsKey(userId)) {
            return Optional.empty();
        }
        return room.participants.values().stream()
                .filter(participant -> !participant.userId().equals(userId))
                .map(RoomParticipant::name)
                .findFirst();
    }

    public boolean isMember(String roomId, String userId) {
        RoomSession room = roomsById.get(roomId);
        return room != null && room.participants.containsKey(userId);
    }

    public Optional<QueueTicket> removeRoomAndPrepareRequeue(String userId) {
        String roomId = roomIdByUser.get(userId);
        if (roomId == null) {
            return Optional.empty();
        }

        RoomSession room = roomsById.remove(roomId);
        if (room == null) {
            roomIdByUser.remove(userId);
            return Optional.empty();
        }

        List<RoomParticipant> participants = new ArrayList<>(room.participants.values());
        for (RoomParticipant participant : participants) {
            roomIdByUser.remove(participant.userId());
        }

        return participants.stream()
                .filter(participant -> !participant.userId().equals(userId))
                .findFirst()
                .map(RoomParticipant::lastTicket);
    }

    public void closeRoom(String roomId) {
        RoomSession room = roomsById.remove(roomId);
        if (room == null) {
            return;
        }
        room.participants.values().forEach(participant -> roomIdByUser.remove(participant.userId()));
    }

    static class RoomSession {
        private final String roomId;
        private final InterviewType interviewType;
        private final RoomStatus status;
        private final long durationSeconds;
        private final List<String> questions;
        private final String initiatorUserId;
        private final Instant createdAt;
        private final Map<String, RoomParticipant> participants = new ConcurrentHashMap<>();

        RoomSession(String roomId,
                    InterviewType interviewType,
                    RoomStatus status,
                    long durationSeconds,
                    List<String> questions,
                    String initiatorUserId,
                    Instant createdAt) {
            this.roomId = roomId;
            this.interviewType = interviewType;
            this.status = status;
            this.durationSeconds = durationSeconds;
            this.questions = questions;
            this.initiatorUserId = initiatorUserId;
            this.createdAt = createdAt;
        }
    }

    record RoomParticipant(
            String userId,
            String name,
            InterviewRole role,
            QueueTicket lastTicket
    ) {
    }
}
