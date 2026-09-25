package com.lostfound.ml;

import org.springframework.stereotype.Component;

@Component
public class VectorSimilarityCalculator {

    /**
     * Calculates cosine similarity between two float vectors.
     * Normalized result lies between 0.0 (orthogonal or opposing) and 1.0 (identical direction).
     */
    public double cosineSimilarity(float[] vectorA, float[] vectorB) {
        if (vectorA == null || vectorB == null) {
            return 0.0;
        }
        if (vectorA.length == 0 || vectorB.length == 0 || vectorA.length != vectorB.length) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        double similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        // Clamp to [0.0, 1.0] for normalized positive space
        return Math.max(0.0, Math.min(1.0, (similarity + 1.0) / 2.0));
    }
}
