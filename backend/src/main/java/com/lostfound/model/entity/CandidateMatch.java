package com.lostfound.model.entity;

import com.lostfound.model.enums.MatchStatus;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "candidate_matches", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"lost_item_id", "found_item_id"})
})
public class CandidateMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lost_item_id", nullable = false)
    private LostItem lostItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "found_item_id", nullable = false)
    private FoundItem foundItem;

    @Column(nullable = false)
    private Double overallScore;

    private Double visualScore;

    private Double categoryScore;

    private Double attributesScore;

    private Double textScore;

    private Double locationScore;

    private Double temporalScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MatchStatus status = MatchStatus.POTENTIAL;

    @Column(length = 500)
    private String reviewerNotes;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    public CandidateMatch() {
    }

    public CandidateMatch(LostItem lostItem, FoundItem foundItem, Double overallScore,
                          Double visualScore, Double categoryScore, Double attributesScore,
                          Double textScore, Double locationScore, Double temporalScore,
                          MatchStatus status) {
        this.lostItem = lostItem;
        this.foundItem = foundItem;
        this.overallScore = overallScore;
        this.visualScore = visualScore;
        this.categoryScore = categoryScore;
        this.attributesScore = attributesScore;
        this.textScore = textScore;
        this.locationScore = locationScore;
        this.temporalScore = temporalScore;
        this.status = status != null ? status : MatchStatus.POTENTIAL;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LostItem getLostItem() {
        return lostItem;
    }

    public void setLostItem(LostItem lostItem) {
        this.lostItem = lostItem;
    }

    public FoundItem getFoundItem() {
        return foundItem;
    }

    public void setFoundItem(FoundItem foundItem) {
        this.foundItem = foundItem;
    }

    public Double getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Double overallScore) {
        this.overallScore = overallScore;
    }

    public Double getVisualScore() {
        return visualScore;
    }

    public void setVisualScore(Double visualScore) {
        this.visualScore = visualScore;
    }

    public Double getCategoryScore() {
        return categoryScore;
    }

    public void setCategoryScore(Double categoryScore) {
        this.categoryScore = categoryScore;
    }

    public Double getAttributesScore() {
        return attributesScore;
    }

    public void setAttributesScore(Double attributesScore) {
        this.attributesScore = attributesScore;
    }

    public Double getTextScore() {
        return textScore;
    }

    public void setTextScore(Double textScore) {
        this.textScore = textScore;
    }

    public Double getLocationScore() {
        return locationScore;
    }

    public void setLocationScore(Double locationScore) {
        this.locationScore = locationScore;
    }

    public Double getTemporalScore() {
        return temporalScore;
    }

    public void setTemporalScore(Double temporalScore) {
        this.temporalScore = temporalScore;
    }

    public MatchStatus getStatus() {
        return status;
    }

    public void setStatus(MatchStatus status) {
        this.status = status;
    }

    public String getReviewerNotes() {
        return reviewerNotes;
    }

    public void setReviewerNotes(String reviewerNotes) {
        this.reviewerNotes = reviewerNotes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
