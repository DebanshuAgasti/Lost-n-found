package com.lostfound.ml.scorers;

import com.lostfound.model.entity.FoundItem;
import com.lostfound.model.entity.LostItem;
import com.lostfound.model.enums.ItemCategory;
import org.springframework.stereotype.Component;

@Component
public class CategoryScorer {

    public double calculateScore(LostItem lostItem, FoundItem foundItem) {
        if (lostItem.getCategory() == null || foundItem.getCategory() == null) {
            return 0.5;
        }

        if (lostItem.getCategory() == foundItem.getCategory()) {
            return 1.0;
        }

        // If either item is classified as OTHER, give partial credit rather than zeroing out
        if (lostItem.getCategory() == ItemCategory.OTHER || foundItem.getCategory() == ItemCategory.OTHER) {
            return 0.4;
        }

        return 0.0;
    }
}
