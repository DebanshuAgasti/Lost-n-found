package com.lostfound.ml;

import com.lostfound.config.MatchingEngineProperties;
import com.lostfound.ml.scorers.*;
import com.lostfound.model.entity.FoundItem;
import com.lostfound.model.entity.LostItem;
import org.springframework.stereotype.Service;

@Service
public class MatchingEngine {

    public record MatchResult(
            double overallScore,
            Double visualScore,
            double categoryScore,
            double attributesScore,
            double textScore,
            double locationScore,
            double temporalScore
    ) {}

    private final MatchingEngineProperties properties;
    private final ImageSimilarityScorer imageScorer;
    private final CategoryScorer categoryScorer;
    private final AttributeScorer attributeScorer;
    private final TextSimilarityScorer textScorer;
    private final GeoProximityScorer geoScorer;
    private final TemporalProximityScorer temporalScorer;

    public MatchingEngine(MatchingEngineProperties properties,
                          ImageSimilarityScorer imageScorer,
                          CategoryScorer categoryScorer,
                          AttributeScorer attributeScorer,
                          TextSimilarityScorer textScorer,
                          GeoProximityScorer geoScorer,
                          TemporalProximityScorer temporalScorer) {
        this.properties = properties;
        this.imageScorer = imageScorer;
        this.categoryScorer = categoryScorer;
        this.attributeScorer = attributeScorer;
        this.textScorer = textScorer;
        this.geoScorer = geoScorer;
        this.temporalScorer = temporalScorer;
    }

    public MatchResult evaluate(LostItem lostItem, FoundItem foundItem) {
        double catScore = categoryScorer.calculateScore(lostItem, foundItem);

        // If categories are completely incompatible, early exit with 0.0
        if (catScore == 0.0) {
            return new MatchResult(0.0, null, 0.0, 0.0, 0.0, 0.0, 0.0);
        }

        Double visScore = imageScorer.calculateScore(lostItem, foundItem);
        double attrScore = attributeScorer.calculateScore(lostItem, foundItem);
        double txtScore = textScorer.calculateScore(lostItem, foundItem);
        double locScore = geoScorer.calculateScore(lostItem, foundItem);
        double tempScore = temporalScorer.calculateScore(lostItem, foundItem);

        // Calculate dynamic weighted score
        double totalWeight = 0.0;
        double weightedSum = 0.0;

        if (visScore != null) {
            totalWeight += properties.getWeightVisual();
            weightedSum += visScore * properties.getWeightVisual();
        }

        totalWeight += properties.getWeightCategory();
        weightedSum += catScore * properties.getWeightCategory();

        totalWeight += properties.getWeightAttributes();
        weightedSum += attrScore * properties.getWeightAttributes();

        totalWeight += properties.getWeightText();
        weightedSum += txtScore * properties.getWeightText();

        totalWeight += properties.getWeightLocation();
        weightedSum += locScore * properties.getWeightLocation();

        totalWeight += properties.getWeightTemporal();
        weightedSum += tempScore * properties.getWeightTemporal();

        double rawScore = totalWeight > 0 ? (weightedSum / totalWeight) : 0.0;

        // Apply category multiplier if category was only partial (e.g. OTHER)
        double overallScore = Math.round(rawScore * 1000.0) / 1000.0;

        return new MatchResult(overallScore, visScore, catScore, attrScore, txtScore, locScore, tempScore);
    }
}
