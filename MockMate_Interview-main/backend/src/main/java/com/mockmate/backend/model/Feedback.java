package com.mockmate.backend.model;

import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("feedback")
public class Feedback {

    @Id
    private String id;
    private String roomId;
    private String reviewerUserId;
    private String targetUserId;
    private int rating;
    private String summary;
    private List<String> highlights;
    private List<String> improvements;
    private Instant createdAt;

    public Feedback() {
    }

    public Feedback(String roomId,
                    String reviewerUserId,
                    String targetUserId,
                    int rating,
                    String summary,
                    List<String> highlights,
                    List<String> improvements,
                    Instant createdAt) {
        this.roomId = roomId;
        this.reviewerUserId = reviewerUserId;
        this.targetUserId = targetUserId;
        this.rating = rating;
        this.summary = summary;
        this.highlights = highlights;
        this.improvements = improvements;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public String getReviewerUserId() {
        return reviewerUserId;
    }

    public void setReviewerUserId(String reviewerUserId) {
        this.reviewerUserId = reviewerUserId;
    }

    public String getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(String targetUserId) {
        this.targetUserId = targetUserId;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getHighlights() {
        return highlights;
    }

    public void setHighlights(List<String> highlights) {
        this.highlights = highlights;
    }

    public List<String> getImprovements() {
        return improvements;
    }

    public void setImprovements(List<String> improvements) {
        this.improvements = improvements;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
