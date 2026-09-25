package com.lostfound.repository;

import com.lostfound.model.entity.CandidateMatch;
import com.lostfound.model.enums.MatchStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateMatchRepository extends JpaRepository<CandidateMatch, Long> {

    List<CandidateMatch> findByLostItemIdOrderByOverallScoreDesc(Long lostItemId);

    List<CandidateMatch> findByFoundItemIdOrderByOverallScoreDesc(Long foundItemId);

    Optional<CandidateMatch> findByLostItemIdAndFoundItemId(Long lostItemId, Long foundItemId);

    Page<CandidateMatch> findByStatus(MatchStatus status, Pageable pageable);

    void deleteByLostItemId(Long lostItemId);

    void deleteByFoundItemId(Long foundItemId);
}
