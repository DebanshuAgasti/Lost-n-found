package com.lostfound.controller;

import com.lostfound.dto.claim.ClaimRequest;
import com.lostfound.dto.claim.ClaimResponse;
import com.lostfound.dto.claim.ClaimReviewRequest;
import com.lostfound.dto.common.ApiResponse;
import com.lostfound.dto.common.PageResponse;
import com.lostfound.security.UserPrincipal;
import com.lostfound.service.ClaimService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@Tag(name = "Claims & Verification", description = "Endpoints for claiming found items, submitting proof, and custodial reviews")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping
    @Operation(summary = "Submit an ownership claim for a found item")
    public ResponseEntity<ApiResponse<ClaimResponse>> createClaim(
            @Valid @RequestBody ClaimRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ClaimResponse response = claimService.createClaim(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Claim submitted successfully", response));
    }

    @GetMapping("/my")
    @Operation(summary = "Get claims submitted by the current user")
    public ResponseEntity<ApiResponse<PageResponse<ClaimResponse>>> getMyClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<ClaimResponse> response = claimService.getMyClaims(currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/found/{foundItemId}")
    @Operation(summary = "Get all claims submitted for a specific found item (custodian/admin only)")
    public ResponseEntity<ApiResponse<List<ClaimResponse>>> getClaimsForFoundItem(
            @PathVariable Long foundItemId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<ClaimResponse> responses = claimService.getClaimsForFoundItem(foundItemId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PatchMapping("/{claimId}/review")
    @Operation(summary = "Review a claim (approve, reject, or request information)")
    public ResponseEntity<ApiResponse<ClaimResponse>> reviewClaim(
            @PathVariable Long claimId,
            @Valid @RequestBody ClaimReviewRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ClaimResponse response = claimService.reviewClaim(claimId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Claim reviewed successfully", response));
    }
}
