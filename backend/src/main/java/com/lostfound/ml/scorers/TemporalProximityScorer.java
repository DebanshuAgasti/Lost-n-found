package com.lostfound.ml.scorers;

import com.lostfound.model.entity.FoundItem;
import com.lostfound.model.entity.LostItem;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class TemporalProximityScorer {

    public double calculateScore(LostItem lostItem, FoundItem foundItem) {
        LocalDate lostDate = lostItem.getLostDate();
        LocalDate foundDate = foundItem.getFoundDate();

        if (lostDate == null || foundDate == null) {
            return 0.5;
        }

        long daysDiff = ChronoUnit.DAYS.between(lostDate, foundDate);

        // If found item was found MORE than 2 days before the reported lost date,
        // it is unlikely to be the same item (penalty)
        if (daysDiff < -2) {
            return 0.05;
        }

        // Found on the same day or within 2 days after loss: optimal
        if (daysDiff >= -2 && daysDiff <= 2) {
            return 1.0;
        }

        // Found within 14 days
        if (daysDiff <= 14) {
            return 0.90 - ((daysDiff - 2) * 0.03); // smoothly decreases from 0.90 to ~0.54
        }

        // Found within 60 days
        if (daysDiff <= 60) {
            return Math.max(0.20, 0.54 - ((daysDiff - 14) * 0.007));
        }

        // Over 60 days
        return 0.15;
    }
}
