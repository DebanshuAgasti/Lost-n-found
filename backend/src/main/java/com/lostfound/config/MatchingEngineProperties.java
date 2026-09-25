package com.lostfound.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "lostfound.matching")
public class MatchingEngineProperties {

    private double weightVisual = 0.35;
    private double weightCategory = 0.20;
    private double weightAttributes = 0.20;
    private double weightText = 0.10;
    private double weightLocation = 0.10;
    private double weightTemporal = 0.05;

    // Minimum overall score to consider a candidate match
    private double minCandidateScore = 0.40;

    // Maximum distance in kilometers for full location score
    private double maxProximityKm = 25.0;

    public double getWeightVisual() {
        return weightVisual;
    }

    public void setWeightVisual(double weightVisual) {
        this.weightVisual = weightVisual;
    }

    public double getWeightCategory() {
        return weightCategory;
    }

    public void setWeightCategory(double weightCategory) {
        this.weightCategory = weightCategory;
    }

    public double getWeightAttributes() {
        return weightAttributes;
    }

    public void setWeightAttributes(double weightAttributes) {
        this.weightAttributes = weightAttributes;
    }

    public double getWeightText() {
        return weightText;
    }

    public void setWeightText(double weightText) {
        this.weightText = weightText;
    }

    public double getWeightLocation() {
        return weightLocation;
    }

    public void setWeightLocation(double weightLocation) {
        this.weightLocation = weightLocation;
    }

    public double getWeightTemporal() {
        return weightTemporal;
    }

    public void setWeightTemporal(double weightTemporal) {
        this.weightTemporal = weightTemporal;
    }

    public double getMinCandidateScore() {
        return minCandidateScore;
    }

    public void setMinCandidateScore(double minCandidateScore) {
        this.minCandidateScore = minCandidateScore;
    }

    public double getMaxProximityKm() {
        return maxProximityKm;
    }

    public void setMaxProximityKm(double maxProximityKm) {
        this.maxProximityKm = maxProximityKm;
    }
}
