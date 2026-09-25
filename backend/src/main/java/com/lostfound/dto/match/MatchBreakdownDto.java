package com.lostfound.dto.match;

public class MatchBreakdownDto {

    private Double visualScore;
    private Double categoryScore;
    private Double attributesScore;
    private Double textScore;
    private Double locationScore;
    private Double temporalScore;
    private String explanation;

    public MatchBreakdownDto() {
    }

    public MatchBreakdownDto(Double visualScore, Double categoryScore, Double attributesScore,
                             Double textScore, Double locationScore, Double temporalScore,
                             String explanation) {
        this.visualScore = visualScore;
        this.categoryScore = categoryScore;
        this.attributesScore = attributesScore;
        this.textScore = textScore;
        this.locationScore = locationScore;
        this.temporalScore = temporalScore;
        this.explanation = explanation;
    }

    // Getters and Setters
    public Double getVisualScore() {
        return visualScore;
    }

    public void setVisualScore(Double visualScore) {
        this.visualScore = visualScore;
    }

    public Double getCategoryScore() {
        return categoryScore;
    }

    public void setCategoryScore(Double categoryScore) {
        this.categoryScore = categoryScore;
    }

    public Double getAttributesScore() {
        return attributesScore;
    }

    public void setAttributesScore(Double attributesScore) {
        this.attributesScore = attributesScore;
    }

    public Double getTextScore() {
        return textScore;
    }

    public void setTextScore(Double textScore) {
        this.textScore = textScore;
    }

    public Double getLocationScore() {
        return locationScore;
    }

    public void setLocationScore(Double locationScore) {
        this.locationScore = locationScore;
    }

    public Double getTemporalScore() {
        return temporalScore;
    }

    public void setTemporalScore(Double temporalScore) {
        this.temporalScore = temporalScore;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
