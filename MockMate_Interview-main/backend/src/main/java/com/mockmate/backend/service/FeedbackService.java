package com.mockmate.backend.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.mockmate.backend.dto.FeedbackRequest;
import com.mockmate.backend.model.Feedback;
import com.mockmate.backend.repository.FeedbackRepository;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    public Feedback save(String reviewerUserId, FeedbackRequest request) {
        Feedback feedback = new Feedback(
                request.roomId(),
                reviewerUserId,
                request.targetUserId(),
                request.rating(),
                request.summary(),
                request.highlights(),
                request.improvements(),
                Instant.now()
        );
        return feedbackRepository.save(feedback);
    }

    public List<Feedback> historyFor(String userId) {
        return feedbackRepository.findByTargetUserIdOrderByCreatedAtDesc(userId);
    }
}
