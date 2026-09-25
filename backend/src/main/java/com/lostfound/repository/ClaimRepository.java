package com.lostfound.repository;

import com.lostfound.model.entity.Claim;
import com.lostfound.model.enums.ClaimStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByFoundItemId(Long foundItemId);

    Page<Claim> findByClaimantId(Long claimantId, Pageable pageable);

    Page<Claim> findByStatus(ClaimStatus status, Pageable pageable);
}
