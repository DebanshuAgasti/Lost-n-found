package com.lostfound.dto.ai;

import java.util.ArrayList;
import java.util.List;

public class ClaimVerificationAiResponse {

    private Long claimId;
    private Double confidenceScore; // 0.0 to 1.0
    private String verdict;         // LIKELY_MATCH, UNLIKELY_MATCH, INCONCLUSIVE
    private String reasoning;
    private List<String> matchedEvidence = new ArrayList<>();
    private List<String> discrepancyEvidence = new ArrayList<>();
    private String recommendedAction; // APPROVE, REJECT, REQUEST_MORE_INFO

    public ClaimVerificationAiResponse() {
    }

    public Long getClaimId() {
        return claimId;
    }

    public void setClaimId(Long claimId) {
        this.claimId = claimId;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getVerdict() {
        return verdict;
    }

    public void setVerdict(String verdict) {
        this.verdict = verdict;
    }

    public String getReasoning() {
        return reasoning;
    }

    public void setReasoning(String reasoning) {
        this.reasoning = reasoning;
    }

    public List<String> getMatchedEvidence() {
        return matchedEvidence;
    }

    public void setMatchedEvidence(List<String> matchedEvidence) {
        this.matchedEvidence = matchedEvidence;
    }

    public List<String> getDiscrepancyEvidence() {
        return discrepancyEvidence;
    }

    public void setDiscrepancyEvidence(List<String> discrepancyEvidence) {
        this.discrepancyEvidence = discrepancyEvidence;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }
}
