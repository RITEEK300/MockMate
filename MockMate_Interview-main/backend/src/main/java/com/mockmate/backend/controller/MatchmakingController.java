package com.mockmate.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mockmate.backend.dto.MatchRequest;
import com.mockmate.backend.dto.MatchStatusResponse;
import com.mockmate.backend.service.MatchmakingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/matchmaking")
public class MatchmakingController {

    private final MatchmakingService matchmakingService;

    public MatchmakingController(MatchmakingService matchmakingService) {
        this.matchmakingService = matchmakingService;
    }

    @PostMapping("/enqueue")
    public MatchStatusResponse enqueue(Authentication authentication, @Valid @RequestBody MatchRequest request) {
        return matchmakingService.enqueue(authentication.getName(), request);
    }

    @PostMapping("/cancel")
    public MatchStatusResponse cancel(Authentication authentication) {
        return matchmakingService.cancel(authentication.getName());
    }

    @GetMapping("/status")
    public MatchStatusResponse status(Authentication authentication) {
        return matchmakingService.status(authentication.getName());
    }
}
