package com.lostfound.ml.scorers;

import com.lostfound.model.entity.FoundItem;
import com.lostfound.model.entity.ItemAttributes;
import com.lostfound.model.entity.LostItem;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Component
public class AttributeScorer {

    public double calculateScore(LostItem lostItem, FoundItem foundItem) {
        ItemAttributes lostAttr = lostItem.getAttributes();
        ItemAttributes foundAttr = foundItem.getAttributes();

        if (lostAttr == null && foundAttr == null) {
            return 0.5;
        }
        if (lostAttr == null || foundAttr == null) {
            return 0.5;
        }

        double totalWeight = 0.0;
        double accumulatedScore = 0.0;

        // 1. Brand matching (Weight: 0.35)
        if (hasValue(lostAttr.getBrand()) && hasValue(foundAttr.getBrand())) {
            totalWeight += 0.35;
            if (lostAttr.getBrand().trim().equalsIgnoreCase(foundAttr.getBrand().trim())) {
                accumulatedScore += 0.35;
            } else if (lostAttr.getBrand().toLowerCase().contains(foundAttr.getBrand().toLowerCase()) ||
                       foundAttr.getBrand().toLowerCase().contains(lostAttr.getBrand().toLowerCase())) {
                accumulatedScore += 0.25;
            }
        }

        // 2. Model matching (Weight: 0.25)
        if (hasValue(lostAttr.getModel()) && hasValue(foundAttr.getModel())) {
            totalWeight += 0.25;
            if (lostAttr.getModel().trim().equalsIgnoreCase(foundAttr.getModel().trim())) {
                accumulatedScore += 0.25;
            } else if (lostAttr.getModel().toLowerCase().contains(foundAttr.getModel().toLowerCase()) ||
                       foundAttr.getModel().toLowerCase().contains(lostAttr.getModel().toLowerCase())) {
                accumulatedScore += 0.18;
            }
        }

        // 3. Color matching (Weight: 0.20)
        if (hasValue(lostAttr.getPrimaryColor()) && hasValue(foundAttr.getPrimaryColor())) {
            totalWeight += 0.20;
            String lostPrim = lostAttr.getPrimaryColor().trim().toLowerCase();
            String foundPrim = foundAttr.getPrimaryColor().trim().toLowerCase();

            if (lostPrim.equals(foundPrim)) {
                accumulatedScore += 0.20;
            } else if (hasValue(lostAttr.getSecondaryColor()) && lostAttr.getSecondaryColor().trim().equalsIgnoreCase(foundPrim)) {
                accumulatedScore += 0.14;
            } else if (hasValue(foundAttr.getSecondaryColor()) && foundAttr.getSecondaryColor().trim().equalsIgnoreCase(lostPrim)) {
                accumulatedScore += 0.14;
            }
        }

        // 4. Distinctive markings / stickers / damage overlap (Weight: 0.20)
        String lostSpecial = combineText(lostAttr.getDistinctiveMarks(), lostAttr.getScratchesOrDamage(), lostAttr.getStickersOrAccessories());
        String foundSpecial = combineText(foundAttr.getDistinctiveMarks(), foundAttr.getScratchesOrDamage(), foundAttr.getStickersOrAccessories());

        if (hasValue(lostSpecial) && hasValue(foundSpecial)) {
            totalWeight += 0.20;
            double overlap = computeTokenOverlap(lostSpecial, foundSpecial);
            accumulatedScore += 0.20 * overlap;
        }

        if (totalWeight == 0.0) {
            return 0.5; // neutral when no comparable attributes were entered
        }

        return accumulatedScore / totalWeight;
    }

    private boolean hasValue(String s) {
        return s != null && !s.trim().isEmpty();
    }

    private String combineText(String... parts) {
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (hasValue(p)) {
                sb.append(p).append(" ");
            }
        }
        return sb.toString().trim();
    }

    private double computeTokenOverlap(String textA, String textB) {
        Set<String> wordsA = extractTokens(textA);
        Set<String> wordsB = extractTokens(textB);
        if (wordsA.isEmpty() || wordsB.isEmpty()) return 0.0;

        Set<String> intersection = new HashSet<>(wordsA);
        intersection.retainAll(wordsB);

        Set<String> union = new HashSet<>(wordsA);
        union.addAll(wordsB);

        return (double) intersection.size() / union.size();
    }

    private Set<String> extractTokens(String text) {
        String clean = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ");
        String[] tokens = clean.split("\\s+");
        Set<String> set = new HashSet<>();
        for (String token : tokens) {
            if (token.length() > 2) {
                set.add(token);
            }
        }
        return set;
    }
}
