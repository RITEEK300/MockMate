package com.mockmate.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.mockmate.backend.model.Feedback;

public interface FeedbackRepository extends MongoRepository<Feedback, String> {

    List<Feedback> findByTargetUserIdOrderByCreatedAtDesc(String targetUserId);
}
