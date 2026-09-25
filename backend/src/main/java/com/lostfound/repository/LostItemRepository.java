package com.lostfound.repository;

import com.lostfound.model.entity.LostItem;
import com.lostfound.model.enums.ItemCategory;
import com.lostfound.model.enums.LostItemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LostItemRepository extends JpaRepository<LostItem, Long> {

    Page<LostItem> findByUserId(Long userId, Pageable pageable);

    Page<LostItem> findByStatus(LostItemStatus status, Pageable pageable);

    List<LostItem> findByStatus(LostItemStatus status);

    @Query("SELECT l FROM LostItem l WHERE " +
           "(:category IS NULL OR l.category = :category) AND " +
           "(:status IS NULL OR l.status = :status) AND " +
           "(:city IS NULL OR LOWER(l.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:keyword IS NULL OR (" +
           " LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(l.attributes.brand) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(l.attributes.model) LIKE LOWER(CONCAT('%', :keyword, '%'))))")
    Page<LostItem> searchLostItems(@Param("category") ItemCategory category,
                                  @Param("status") LostItemStatus status,
                                  @Param("city") String city,
                                  @Param("keyword") String keyword,
                                  Pageable pageable);
}
