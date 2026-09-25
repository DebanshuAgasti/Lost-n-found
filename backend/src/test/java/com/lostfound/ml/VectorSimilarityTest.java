package com.lostfound.ml;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class VectorSimilarityTest {

    private VectorSimilarityCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new VectorSimilarityCalculator();
    }

    @Test
    void testIdenticalVectorsProduceMaxSimilarity() {
        float[] a = new float[]{1.0f, 2.0f, 3.0f};
        float[] b = new float[]{1.0f, 2.0f, 3.0f};

        double sim = calculator.cosineSimilarity(a, b);
        assertEquals(1.0, sim, 0.001, "Identical vectors must have similarity of 1.0");
    }

    @Test
    void testOppositeVectorsProduceZeroSimilarity() {
        float[] a = new float[]{1.0f, 0.0f, 0.0f};
        float[] b = new float[]{-1.0f, 0.0f, 0.0f};

        double sim = calculator.cosineSimilarity(a, b);
        assertEquals(0.0, sim, 0.001, "Opposite vectors normalized to [0, 1] range should yield 0.0");
    }

    @Test
    void testOrthogonalVectorsProduceMidpointSimilarity() {
        float[] a = new float[]{1.0f, 0.0f};
        float[] b = new float[]{0.0f, 1.0f};

        double sim = calculator.cosineSimilarity(a, b);
        assertEquals(0.5, sim, 0.001, "Orthogonal vectors in normalized [0, 1] range should yield 0.5");
    }

    @Test
    void testNullOrMismatchedLengthsHandledGracefully() {
        assertEquals(0.0, calculator.cosineSimilarity(null, new float[]{1.0f}));
        assertEquals(0.0, calculator.cosineSimilarity(new float[]{1.0f}, null));
        assertEquals(0.0, calculator.cosineSimilarity(new float[]{1.0f}, new float[]{1.0f, 2.0f}));
    }
}
