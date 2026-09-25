package com.lostfound.service;

import com.lostfound.config.MatchingEngineProperties;
import com.lostfound.dto.match.MatchCandidateResponse;
import com.lostfound.dto.match.MatchStatusUpdateRequest;
import com.lostfound.event.FoundItemCreatedEvent;
import com.lostfound.event.LostItemCreatedEvent;
import com.lostfound.exception.ResourceNotFoundException;
import com.lostfound.ml.MatchingEngine;
import com.lostfound.model.entity.CandidateMatch;
import com.lostfound.model.entity.FoundItem;
import com.lostfound.model.entity.LostItem;
import com.lostfound.model.enums.FoundItemStatus;
import com.lostfound.model.enums.LostItemStatus;
import com.lostfound.model.enums.MatchStatus;
import com.lostfound.model.enums.NotificationType;
import com.lostfound.repository.CandidateMatchRepository;
import com.lostfound.repository.FoundItemRepository;
import com.lostfound.repository.LostItemRepository;
import com.lostfound.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CandidateMatchService {

    private static final Logger log = LoggerFactory.getLogger(CandidateMatchService.class);

    private final CandidateMatchRepository matchRepository;
    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final MatchingEngine matchingEngine;
    private final MatchingEngineProperties matchingProperties;
    private final NotificationService notificationService;

    public CandidateMatchService(CandidateMatchRepository matchRepository,
                                 LostItemRepository lostItemRepository,
                                 FoundItemRepository foundItemRepository,
                                 MatchingEngine matchingEngine,
                                 MatchingEngineProperties matchingProperties,
                                 NotificationService notificationService) {
        this.matchRepository = matchRepository;
        this.lostItemRepository = lostItemRepository;
        this.foundItemRepository = foundItemRepository;
        this.matchingEngine = matchingEngine;
        this.matchingProperties = matchingProperties;
        this.notificationService = notificationService;
    }

    @EventListener
    @Transactional
    public void handleLostItemCreated(LostItemCreatedEvent event) {
        LostItem lostItem = event.lostItem();
        log.info("Running matching engine for new lost item #{}", lostItem.getId());
        runMatchingForLostItem(lostItem);
    }

    @EventListener
    @Transactional
    public void handleFoundItemCreated(FoundItemCreatedEvent event) {
        FoundItem foundItem = event.foundItem();
        log.info("Running matching engine for new found item #{}", foundItem.getId());
        runMatchingForFoundItem(foundItem);
    }

    @Transactional
    public void runMatchingForLostItem(LostItem lostItem) {
        List<FoundItem> activeFoundItems = foundItemRepository.findByStatus(FoundItemStatus.ACTIVE);

        for (FoundItem foundItem : activeFoundItems) {
            evaluateAndPersistMatch(lostItem, foundItem);
        }
    }

    @Transactional
    public void runMatchingForFoundItem(FoundItem foundItem) {
        List<LostItem> activeLostItems = lostItemRepository.findByStatus(LostItemStatus.ACTIVE);

        for (LostItem lostItem : activeLostItems) {
            evaluateAndPersistMatch(lostItem, foundItem);
        }
    }

    private void evaluateAndPersistMatch(LostItem lostItem, FoundItem foundItem) {
        MatchingEngine.MatchResult result = matchingEngine.evaluate(lostItem, foundItem);

        if (result.overallScore() >= matchingProperties.getMinCandidateScore()) {
            Optional<CandidateMatch> existingOpt = matchRepository.findByLostItemIdAndFoundItemId(lostItem.getId(), foundItem.getId());

            CandidateMatch match = existingOpt.orElseGet(CandidateMatch::new);
            match.setLostItem(lostItem);
            match.setFoundItem(foundItem);
            match.setOverallScore(result.overallScore());
            match.setVisualScore(result.visualScore());
            match.setCategoryScore(result.categoryScore());
            match.setAttributesScore(result.attributesScore());
            match.setTextScore(result.textScore());
            match.setLocationScore(result.locationScore());
            match.setTemporalScore(result.temporalScore());

            if (match.getStatus() == null || match.getStatus() == MatchStatus.POTENTIAL) {
                match.setStatus(result.overallScore() >= 0.70 ? MatchStatus.SUGGESTED : MatchStatus.POTENTIAL);
            }

            CandidateMatch saved = matchRepository.save(match);

            // Send notification if high confidence candidate match
            if (result.overallScore() >= 0.70 && existingOpt.isEmpty()) {
                notificationService.sendNotification(
                        lostItem.getUser(),
                        NotificationType.MATCH_FOUND,
                        "Possible Match Found!",
                        "A discovered item (" + foundItem.getTitle() + ") matches your lost item report with " +
                        Math.round(result.overallScore() * 100) + "% confidence.",
                        saved.getId(),
                        "MATCH"
                );
            }
        }
    }

    @Transactional(readOnly = true)
    public List<MatchCandidateResponse> getMatchesForLostItem(Long lostItemId, UserPrincipal currentUser) {
        return matchRepository.findByLostItemIdOrderByOverallScoreDesc(lostItemId).stream()
                .map(MatchCandidateResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MatchCandidateResponse> getMatchesForFoundItem(Long foundItemId, UserPrincipal currentUser) {
        return matchRepository.findByFoundItemIdOrderByOverallScoreDesc(foundItemId).stream()
                .map(MatchCandidateResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public MatchCandidateResponse updateMatchStatus(Long matchId, MatchStatusUpdateRequest request, UserPrincipal currentUser) {
        CandidateMatch match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match candidate not found with id: " + matchId));

        match.setStatus(request.getStatus());
        if (request.getReviewerNotes() != null) {
            match.setReviewerNotes(request.getReviewerNotes());
        }

        CandidateMatch updated = matchRepository.save(match);
        return MatchCandidateResponse.from(updated);
    }
}
