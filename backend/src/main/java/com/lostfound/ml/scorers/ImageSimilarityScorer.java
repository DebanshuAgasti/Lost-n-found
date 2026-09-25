package com.lostfound.ml.scorers;

import com.lostfound.ml.VectorSimilarityCalculator;
import com.lostfound.model.entity.FoundItem;
import com.lostfound.model.entity.ItemImage;
import com.lostfound.model.entity.LostItem;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ImageSimilarityScorer {

    private final VectorSimilarityCalculator vectorCalculator;

    public ImageSimilarityScorer(VectorSimilarityCalculator vectorCalculator) {
        this.vectorCalculator = vectorCalculator;
    }

    /**
     * Calculates the highest visual similarity between images of the lost and found items.
     * Returns null if either item lacks valid embeddings, enabling dynamic weight redistribution.
     */
    public Double calculateScore(LostItem lostItem, FoundItem foundItem) {
        List<ItemImage> lostImages = lostItem.getImages();
        List<ItemImage> foundImages = foundItem.getImages();

        if (lostImages == null || lostImages.isEmpty() || foundImages == null || foundImages.isEmpty()) {
            return null;
        }

        double maxScore = -1.0;
        boolean hasValidEmbeddingPair = false;

        for (ItemImage lostImg : lostImages) {
            float[] embA = lostImg.getEmbedding();
            if (embA == null || embA.length == 0) continue;

            for (ItemImage foundImg : foundImages) {
                float[] embB = foundImg.getEmbedding();
                if (embB == null || embB.length == 0) continue;

                hasValidEmbeddingPair = true;
                double score = vectorCalculator.cosineSimilarity(embA, embB);
                if (score > maxScore) {
                    maxScore = score;
                }
            }
        }

        if (!hasValidEmbeddingPair) {
            return null;
        }

        return maxScore;
    }
}
