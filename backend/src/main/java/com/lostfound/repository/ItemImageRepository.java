package com.lostfound.repository;

import com.lostfound.model.entity.ItemImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemImageRepository extends JpaRepository<ItemImage, Long> {
    List<ItemImage> findByLostItemId(Long lostItemId);
    List<ItemImage> findByFoundItemId(Long foundItemId);
}
