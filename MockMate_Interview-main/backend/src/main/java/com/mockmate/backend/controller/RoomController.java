package com.mockmate.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.mockmate.backend.dto.RoomStateResponse;
import com.mockmate.backend.service.RoomRegistry;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomRegistry roomRegistry;

    public RoomController(RoomRegistry roomRegistry) {
        this.roomRegistry = roomRegistry;
    }

    @GetMapping("/{roomId}")
    public RoomStateResponse room(@PathVariable String roomId, Authentication authentication) {
        return roomRegistry.roomState(roomId, authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Room not found"));
    }

    @GetMapping("/active/me")
    public RoomStateResponse activeRoom(Authentication authentication) {
        return roomRegistry.roomStateFor(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "No active room"));
    }
}
