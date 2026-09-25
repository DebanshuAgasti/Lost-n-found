package com.lostfound.controller;

import com.lostfound.dto.common.ApiResponse;
import com.lostfound.dto.match.MatchCandidateResponse;
import com.lostfound.dto.match.MatchStatusUpdateRequest;
import com.lostfound.security.UserPrincipal;
import com.lostfound.service.CandidateMatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@Tag(name = "Matches & Similarity", description = "Endpoints for retrieving AI/multimodal candidate matches and reviewing ranking breakdowns")
public class MatchController {

    private final CandidateMatchService matchService;

    public MatchController(CandidateMatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping("/lost/{lostItemId}")
    @Operation(summary = "Get ranked candidate matches for a specific lost item")
    public ResponseEntity<ApiResponse<List<MatchCandidateResponse>>> getMatchesForLostItem(
            @PathVariable Long lostItemId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<MatchCandidateResponse> matches = matchService.getMatchesForLostItem(lostItemId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(matches));
    }

    @GetMapping("/found/{foundItemId}")
    @Operation(summary = "Get ranked candidate matches for a specific found item")
    public ResponseEntity<ApiResponse<List<MatchCandidateResponse>>> getMatchesForFoundItem(
            @PathVariable Long foundItemId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<MatchCandidateResponse> matches = matchService.getMatchesForFoundItem(foundItemId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(matches));
    }

    @PatchMapping("/{matchId}/status")
    @Operation(summary = "Update status of a candidate match (e.g. CONFIRMED, REJECTED)")
    public ResponseEntity<ApiResponse<MatchCandidateResponse>> updateMatchStatus(
            @PathVariable Long matchId,
            @Valid @RequestBody MatchStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        MatchCandidateResponse response = matchService.updateMatchStatus(matchId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Match status updated", response));
    }
}
