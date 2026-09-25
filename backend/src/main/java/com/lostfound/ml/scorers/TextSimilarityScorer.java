package com.lostfound.ml.scorers;

import com.lostfound.model.entity.FoundItem;
import com.lostfound.model.entity.LostItem;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class TextSimilarityScorer {

    public double calculateScore(LostItem lostItem, FoundItem foundItem) {
        String lostText = ((lostItem.getTitle() != null ? lostItem.getTitle() : "") + " " +
                           (lostItem.getDescription() != null ? lostItem.getDescription() : "")).trim();
        String foundText = ((foundItem.getTitle() != null ? foundItem.getTitle() : "") + " " +
                            (foundItem.getDescription() != null ? foundItem.getDescription() : "")).trim();

        if (lostText.isEmpty() || foundText.isEmpty()) {
            return 0.5;
        }

        Set<String> setA = extractTokens(lostText);
        Set<String> setB = extractTokens(foundText);

        if (setA.isEmpty() || setB.isEmpty()) {
            return 0.5;
        }

        Set<String> intersection = new HashSet<>(setA);
        intersection.retainAll(setB);

        Set<String> union = new HashSet<>(setA);
        union.addAll(setB);

        if (union.isEmpty()) {
            return 0.5;
        }

        double jaccard = (double) intersection.size() / union.size();

        // Scale jaccard slightly so non-zero token overlaps give noticeable signal
        return Math.min(1.0, jaccard * 2.0);
    }

    private Set<String> extractTokens(String text) {
        String clean = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ");
        String[] tokens = clean.split("\\s+");
        Set<String> set = new HashSet<>();
        for (String token : tokens) {
            // Ignore common stop words and very short tokens
            if (token.length() > 2 && !isStopWord(token)) {
                set.add(token);
            }
        }
        return set;
    }

    private boolean isStopWord(String word) {
        return switch (word) {
            case "the", "and", "with", "for", "that", "this", "from", "have", "were", "lost", "found", "item" -> true;
            default -> false;
        };
    }
}
