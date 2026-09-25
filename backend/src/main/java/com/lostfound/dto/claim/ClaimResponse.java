package com.lostfound.dto.claim;

import com.lostfound.dto.auth.UserDto;
import com.lostfound.dto.item.FoundItemResponse;
import com.lostfound.dto.item.LostItemResponse;
import com.lostfound.model.entity.Claim;
import com.lostfound.model.enums.ClaimStatus;
import java.time.Instant;

public class ClaimResponse {

    private Long id;
    private Long foundItemId;
    private Long lostItemId;
    private FoundItemResponse foundItem;
    private LostItemResponse lostItem;
    private UserDto claimant;
    private ClaimStatus status;
    private String proofDescription;
    private String verificationAnswers;
    private String proofImageUrls;
    private UserDto reviewer;
    private String reviewerNotes;
    private Instant createdAt;
    private Instant updatedAt;

    public ClaimResponse() {
    }

    public static ClaimResponse from(Claim claim) {
        if (claim == null) return null;
        ClaimResponse response = new ClaimResponse();
        response.setId(claim.getId());
        response.setFoundItemId(claim.getFoundItem().getId());
        response.setFoundItem(FoundItemResponse.from(claim.getFoundItem()));
        if (claim.getLostItem() != null) {
            response.setLostItemId(claim.getLostItem().getId());
            response.setLostItem(LostItemResponse.from(claim.getLostItem()));
        }
        response.setClaimant(UserDto.from(claim.getClaimant()));
        response.setStatus(claim.getStatus());
        response.setProofDescription(claim.getProofDescription());
        response.setVerificationAnswers(claim.getVerificationAnswers());
        response.setProofImageUrls(claim.getProofImageUrls());
        response.setReviewer(UserDto.from(claim.getReviewer()));
        response.setReviewerNotes(claim.getReviewerNotes());
        response.setCreatedAt(claim.getCreatedAt());
        response.setUpdatedAt(claim.getUpdatedAt());
        return response;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public FoundItemResponse getFoundItem() {
        return foundItem;
    }

    public void setFoundItem(FoundItemResponse foundItem) {
        this.foundItem = foundItem;
    }

    public LostItemResponse getLostItem() {
        return lostItem;
    }

    public void setLostItem(LostItemResponse lostItem) {
        this.lostItem = lostItem;
    }

    public UserDto getClaimant() {
        return claimant;
    }

    public void setClaimant(UserDto claimant) {
        this.claimant = claimant;
    }

    public ClaimStatus getStatus() {
        return status;
    }

    public void setStatus(ClaimStatus status) {
        this.status = status;
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

    public UserDto getReviewer() {
        return reviewer;
    }

    public void setReviewer(UserDto reviewer) {
        this.reviewer = reviewer;
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
