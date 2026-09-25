package com.lostfound.dto.match;

import com.lostfound.dto.item.FoundItemResponse;
import com.lostfound.dto.item.LostItemResponse;
import com.lostfound.model.entity.CandidateMatch;
import com.lostfound.model.enums.MatchStatus;
import java.time.Instant;

public class MatchCandidateResponse {

    private Long id;
    private Long lostItemId;
    private Long foundItemId;
    private LostItemResponse lostItem;
    private FoundItemResponse foundItem;
    private Double overallScore;
    private MatchBreakdownDto breakdown;
    private MatchStatus status;
    private String reviewerNotes;
    private Instant createdAt;
    private Instant updatedAt;

    public MatchCandidateResponse() {
    }

    public static MatchCandidateResponse from(CandidateMatch match) {
        if (match == null) return null;
        MatchCandidateResponse response = new MatchCandidateResponse();
        response.setId(match.getId());
        response.setLostItemId(match.getLostItem().getId());
        response.setFoundItemId(match.getFoundItem().getId());
        response.setLostItem(LostItemResponse.from(match.getLostItem()));
        response.setFoundItem(FoundItemResponse.from(match.getFoundItem()));
        response.setOverallScore(match.getOverallScore());
        response.setStatus(match.getStatus());
        response.setReviewerNotes(match.getReviewerNotes());
        response.setCreatedAt(match.getCreatedAt());
        response.setUpdatedAt(match.getUpdatedAt());

        MatchBreakdownDto breakdown = new MatchBreakdownDto(
                match.getVisualScore(),
                match.getCategoryScore(),
                match.getAttributesScore(),
                match.getTextScore(),
                match.getLocationScore(),
                match.getTemporalScore(),
                generateExplanation(match)
        );
        response.setBreakdown(breakdown);

        return response;
    }

    private static String generateExplanation(CandidateMatch match) {
        StringBuilder sb = new StringBuilder();
        if (match.getCategoryScore() != null && match.getCategoryScore() > 0.9) {
            sb.append("Exact category match. ");
        }
        if (match.getVisualScore() != null && match.getVisualScore() > 0.75) {
            sb.append("High visual similarity (").append(Math.round(match.getVisualScore() * 100)).append("%). ");
        }
        if (match.getAttributesScore() != null && match.getAttributesScore() > 0.6) {
            sb.append("Matching attributes (brand, color, or markings). ");
        }
        if (match.getLocationScore() != null && match.getLocationScore() > 0.8) {
            sb.append("Close geographical proximity. ");
        }
        if (match.getTemporalScore() != null && match.getTemporalScore() > 0.8) {
            sb.append("Timing aligns closely with report date. ");
        }
        return sb.toString().trim();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLostItemId() {
        return lostItemId;
    }

    public void setLostItemId(Long lostItemId) {
        this.lostItemId = lostItemId;
    }

    public Long getFoundItemId() {
        return foundItemId;
    }

    public void setFoundItemId(Long foundItemId) {
        this.foundItemId = foundItemId;
    }

    public LostItemResponse getLostItem() {
        return lostItem;
    }

    public void setLostItem(LostItemResponse lostItem) {
        this.lostItem = lostItem;
    }

    public FoundItemResponse getFoundItem() {
        return foundItem;
    }

    public void setFoundItem(FoundItemResponse foundItem) {
        this.foundItem = foundItem;
    }

    public Double getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Double overallScore) {
        this.overallScore = overallScore;
    }

    public MatchBreakdownDto getBreakdown() {
        return breakdown;
    }

    public void setBreakdown(MatchBreakdownDto breakdown) {
        this.breakdown = breakdown;
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
