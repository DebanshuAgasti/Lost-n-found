package com.lostfound.dto.ai;

import java.util.ArrayList;
import java.util.List;

public class MatchExplanationResponse {

    private Long matchId;
    private Long lostItemId;
    private Long foundItemId;
    private Double overallScore;
    private String executiveSummary;
    private List<String> matchingFactors = new ArrayList<>();
    private List<String> conflictingFactors = new ArrayList<>();
    private String confidenceGrade; // "VERY_HIGH", "HIGH", "MODERATE", "LOW"
    private String recommendation;

    public MatchExplanationResponse() {
    }

    public Long getMatchId() {
        return matchId;
    }

    public void setMatchId(Long matchId) {
        this.matchId = matchId;
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

    public Double getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Double overallScore) {
        this.overallScore = overallScore;
    }

    public String getExecutiveSummary() {
        return executiveSummary;
    }

    public void setExecutiveSummary(String executiveSummary) {
        this.executiveSummary = executiveSummary;
    }

    public List<String> getMatchingFactors() {
        return matchingFactors;
    }

    public void setMatchingFactors(List<String> matchingFactors) {
        this.matchingFactors = matchingFactors;
    }

    public List<String> getConflictingFactors() {
        return conflictingFactors;
    }

    public void setConflictingFactors(List<String> conflictingFactors) {
        this.conflictingFactors = conflictingFactors;
    }

    public String getConfidenceGrade() {
        return confidenceGrade;
    }

    public void setConfidenceGrade(String confidenceGrade) {
        this.confidenceGrade = confidenceGrade;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
}
