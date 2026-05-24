package com.mockmate.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.mockmate.backend.model.InterviewType;

@Service
public class QuestionCatalogService {

    public List<String> getQuestions(InterviewType type) {
        return switch (type) {
            case HR -> List.of(
                    "Tell me about yourself in two minutes.",
                    "Why do you want to join this company?",
                    "Describe a time you handled conflict in a team.",
                    "What is your biggest professional strength?",
                    "How do you prioritize work under pressure?"
            );
            case TECHNICAL -> List.of(
                    "Explain the tradeoff between SQL and NoSQL for a user session store.",
                    "Design a rate limiter for a public API.",
                    "How would you debug a memory leak in production?",
                    "Walk through the time and space complexity of merge sort.",
                    "How do you secure a JWT-based application end to end?"
            );
        };
    }
}
