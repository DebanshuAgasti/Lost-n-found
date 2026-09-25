package com.lostfound.dto.match;

import com.lostfound.model.enums.MatchStatus;
import jakarta.validation.constraints.NotNull;

public class MatchStatusUpdateRequest {

    @NotNull(message = "Match status is required")
    private MatchStatus status;

    private String reviewerNotes;

    public MatchStatusUpdateRequest() {
    }

    public MatchStatusUpdateRequest(MatchStatus status, String reviewerNotes) {
        this.status = status;
        this.reviewerNotes = reviewerNotes;
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
}
