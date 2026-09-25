package com.lostfound.repository;

import com.lostfound.model.entity.FoundItem;
import com.lostfound.model.enums.FoundItemStatus;
import com.lostfound.model.enums.ItemCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoundItemRepository extends JpaRepository<FoundItem, Long> {

    Page<FoundItem> findByUserId(Long userId, Pageable pageable);

    Page<FoundItem> findByStatus(FoundItemStatus status, Pageable pageable);

    List<FoundItem> findByStatus(FoundItemStatus status);

    @Query("SELECT f FROM FoundItem f WHERE " +
           "(:category IS NULL OR f.category = :category) AND " +
           "(:status IS NULL OR f.status = :status) AND " +
           "(:city IS NULL OR LOWER(f.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:keyword IS NULL OR (" +
           " LOWER(f.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(f.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(f.attributes.brand) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(f.attributes.model) LIKE LOWER(CONCAT('%', :keyword, '%'))))")
    Page<FoundItem> searchFoundItems(@Param("category") ItemCategory category,
                                     @Param("status") FoundItemStatus status,
                                     @Param("city") String city,
                                     @Param("keyword") String keyword,
                                     Pageable pageable);
}
