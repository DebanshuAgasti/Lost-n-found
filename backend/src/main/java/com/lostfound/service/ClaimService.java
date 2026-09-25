package com.lostfound.service;

import com.lostfound.dto.claim.ClaimRequest;
import com.lostfound.dto.claim.ClaimResponse;
import com.lostfound.dto.claim.ClaimReviewRequest;
import com.lostfound.dto.common.PageResponse;
import com.lostfound.exception.BadRequestException;
import com.lostfound.exception.ResourceNotFoundException;
import com.lostfound.exception.UnauthorizedException;
import com.lostfound.model.entity.Claim;
import com.lostfound.model.entity.FoundItem;
import com.lostfound.model.entity.LostItem;
import com.lostfound.model.entity.User;
import com.lostfound.model.enums.*;
import com.lostfound.repository.ClaimRepository;
import com.lostfound.repository.FoundItemRepository;
import com.lostfound.repository.LostItemRepository;
import com.lostfound.repository.UserRepository;
import com.lostfound.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final FoundItemRepository foundItemRepository;
    private final LostItemRepository lostItemRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ClaimService(ClaimRepository claimRepository,
                        FoundItemRepository foundItemRepository,
                        LostItemRepository lostItemRepository,
                        UserRepository userRepository,
                        NotificationService notificationService) {
        this.claimRepository = claimRepository;
        this.foundItemRepository = foundItemRepository;
        this.lostItemRepository = lostItemRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ClaimResponse createClaim(ClaimRequest request, UserPrincipal currentUser) {
        User claimant = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        FoundItem foundItem = foundItemRepository.findById(request.getFoundItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Found item not found with id: " + request.getFoundItemId()));

        if (foundItem.getStatus() != FoundItemStatus.ACTIVE && foundItem.getStatus() != FoundItemStatus.CLAIM_PENDING) {
            throw new BadRequestException("This item is not open for claims (current status: " + foundItem.getStatus() + ")");
        }

        LostItem lostItem = null;
        if (request.getLostItemId() != null) {
            lostItem = lostItemRepository.findById(request.getLostItemId()).orElse(null);
        }

        Claim claim = new Claim();
        claim.setFoundItem(foundItem);
        claim.setLostItem(lostItem);
        claim.setClaimant(claimant);
        claim.setStatus(ClaimStatus.SUBMITTED);
        claim.setProofDescription(request.getProofDescription());
        claim.setVerificationAnswers(request.getVerificationAnswers());
        claim.setProofImageUrls(request.getProofImageUrls());

        Claim savedClaim = claimRepository.save(claim);

        // Update found item status to CLAIM_PENDING
        foundItem.setStatus(FoundItemStatus.CLAIM_PENDING);
        foundItemRepository.save(foundItem);

        // Notify finder/custodian
        notificationService.sendNotification(
                foundItem.getUser(),
                NotificationType.CLAIM_SUBMITTED,
                "New Claim Submitted",
                "A user has submitted an ownership claim for found item: " + foundItem.getTitle(),
                savedClaim.getId(),
                "CLAIM"
        );

        return ClaimResponse.from(savedClaim);
    }

    @Transactional
    public ClaimResponse reviewClaim(Long claimId, ClaimReviewRequest request, UserPrincipal currentUser) {
        User reviewer = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        FoundItem foundItem = claim.getFoundItem();

        // Only the founder or an admin/staff can review claims
        boolean isFounder = foundItem.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(Role.ROLE_ADMIN.name()) || a.getAuthority().equals(Role.ROLE_STAFF.name()));

        if (!isFounder && !isAdmin) {
            throw new UnauthorizedException("Only the item custodian or an administrator can review this claim.");
        }

        claim.setStatus(request.getStatus());
        claim.setReviewer(reviewer);
        claim.setReviewerNotes(request.getReviewerNotes());

        if (request.getStatus() == ClaimStatus.APPROVED) {
            foundItem.setStatus(FoundItemStatus.CLAIMED);
            foundItemRepository.save(foundItem);

            if (claim.getLostItem() != null) {
                claim.getLostItem().setStatus(LostItemStatus.RESOLVED);
                lostItemRepository.save(claim.getLostItem());
            }

            notificationService.sendNotification(
                    claim.getClaimant(),
                    NotificationType.CLAIM_STATUS_UPDATED,
                    "Claim Approved!",
                    "Your claim for '" + foundItem.getTitle() + "' has been approved. Review details to arrange handover.",
                    claim.getId(),
                    "CLAIM"
            );
        } else if (request.getStatus() == ClaimStatus.REJECTED) {
            notificationService.sendNotification(
                    claim.getClaimant(),
                    NotificationType.CLAIM_STATUS_UPDATED,
                    "Claim Rejected",
                    "Your claim for '" + foundItem.getTitle() + "' was not approved. Notes: " +
                    (request.getReviewerNotes() != null ? request.getReviewerNotes() : "Insufficient verification"),
                    claim.getId(),
                    "CLAIM"
            );
        }

        Claim saved = claimRepository.save(claim);
        return ClaimResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getClaimsForFoundItem(Long foundItemId, UserPrincipal currentUser) {
        return claimRepository.findByFoundItemId(foundItemId).stream()
                .map(ClaimResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<ClaimResponse> getMyClaims(UserPrincipal currentUser, Pageable pageable) {
        Page<Claim> page = claimRepository.findByClaimantId(currentUser.getId(), pageable);
        return PageResponse.from(page.map(ClaimResponse::from));
    }
}
