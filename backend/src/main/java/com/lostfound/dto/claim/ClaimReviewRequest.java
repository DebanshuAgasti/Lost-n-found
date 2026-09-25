package com.lostfound.dto.claim;

import com.lostfound.model.enums.ClaimStatus;
import jakarta.validation.constraints.NotNull;

public class ClaimReviewRequest {

    @NotNull(message = "Review status is required")
    private ClaimStatus status;

    private String reviewerNotes;

    public ClaimReviewRequest() {
    }

    public ClaimReviewRequest(ClaimStatus status, String reviewerNotes) {
        this.status = status;
        this.reviewerNotes = reviewerNotes;
    }

    public ClaimStatus getStatus() {
        return status;
    }

    public void setStatus(ClaimStatus status) {
        this.status = status;
    }

    public String getReviewerNotes() {
        return reviewerNotes;
    }

    public void setReviewerNotes(String reviewerNotes) {
        this.reviewerNotes = reviewerNotes;
    }
}
