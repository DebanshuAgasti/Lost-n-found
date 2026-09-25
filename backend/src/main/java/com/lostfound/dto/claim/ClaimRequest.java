package com.lostfound.dto.claim;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ClaimRequest {

    @NotNull(message = "Found item ID is required")
    private Long foundItemId;

    private Long lostItemId;

    @NotBlank(message = "Proof description is required")
    private String proofDescription;

    private String verificationAnswers;

    private String proofImageUrls;

    public ClaimRequest() {
    }

    public Long getFoundItemId() {
        return foundItemId;
    }

    public void setFoundItemId(Long foundItemId) {
        this.foundItemId = foundItemId;
    }

    public Long getLostItemId() {
        return lostItemId;
    }

    public void setLostItemId(Long lostItemId) {
        this.lostItemId = lostItemId;
    }

    public String getProofDescription() {
        return proofDescription;
    }

    public void setProofDescription(String proofDescription) {
        this.proofDescription = proofDescription;
    }

    public String getVerificationAnswers() {
        return verificationAnswers;
    }

    public void setVerificationAnswers(String verificationAnswers) {
        this.verificationAnswers = verificationAnswers;
    }

    public String getProofImageUrls() {
        return proofImageUrls;
    }

    public void setProofImageUrls(String proofImageUrls) {
        this.proofImageUrls = proofImageUrls;
    }
}
