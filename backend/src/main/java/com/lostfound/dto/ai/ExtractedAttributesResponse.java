package com.lostfound.dto.ai;

import com.lostfound.model.enums.ItemCategory;

public class ExtractedAttributesResponse {

    private ItemCategory category;
    private String brand;
    private String model;
    private String primaryColor;
    private String secondaryColor;
    private String serialNumber;
    private String distinctiveMarks;
    private String scratchesOrDamage;
    private String stickersOrAccessories;
    private String suggestedTitle;
    private String suggestedDescription;
    private Double confidenceScore;

    public ExtractedAttributesResponse() {
    }

    public ItemCategory getCategory() {
        return category;
    }

    public void setCategory(ItemCategory category) {
        this.category = category;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public void setPrimaryColor(String primaryColor) {
        this.primaryColor = primaryColor;
    }

    public String getSecondaryColor() {
        return secondaryColor;
    }

    public void setSecondaryColor(String secondaryColor) {
        this.secondaryColor = secondaryColor;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getDistinctiveMarks() {
        return distinctiveMarks;
    }

    public void setDistinctiveMarks(String distinctiveMarks) {
        this.distinctiveMarks = distinctiveMarks;
    }

    public String getScratchesOrDamage() {
        return scratchesOrDamage;
    }

    public void setScratchesOrDamage(String scratchesOrDamage) {
        this.scratchesOrDamage = scratchesOrDamage;
    }

    public String getStickersOrAccessories() {
        return stickersOrAccessories;
    }

    public void setStickersOrAccessories(String stickersOrAccessories) {
        this.stickersOrAccessories = stickersOrAccessories;
    }

    public String getSuggestedTitle() {
        return suggestedTitle;
    }

    public void setSuggestedTitle(String suggestedTitle) {
        this.suggestedTitle = suggestedTitle;
    }

    public String getSuggestedDescription() {
        return suggestedDescription;
    }

    public void setSuggestedDescription(String suggestedDescription) {
        this.suggestedDescription = suggestedDescription;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
}
