package com.mockmate.backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mockmate.backend.dto.FeedbackRequest;
import com.mockmate.backend.model.Feedback;
import com.mockmate.backend.service.FeedbackService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public Feedback submit(Authentication authentication, @Valid @RequestBody FeedbackRequest request) {
        return feedbackService.save(authentication.getName(), request);
    }

    @GetMapping("/me")
    public List<Feedback> myFeedback(Authentication authentication) {
        return feedbackService.historyFor(authentication.getName());
    }
}
