package com.lostfound.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ItemAttributes {

    @Column(length = 100)
    private String brand;

    @Column(length = 100)
    private String model;

    @Column(length = 50)
    private String primaryColor;

    @Column(length = 50)
    private String secondaryColor;

    @Column(length = 100)
    private String serialNumber;

    @Column(length = 500)
    private String distinctiveMarks;

    @Column(length = 500)
    private String scratchesOrDamage;

    @Column(length = 500)
    private String stickersOrAccessories;

    @Column(length = 100)
    private String dimensions;

    @Column(length = 100)
    private String conditionNotes;

    public ItemAttributes() {
    }

    public ItemAttributes(String brand, String model, String primaryColor, String secondaryColor,
                          String serialNumber, String distinctiveMarks, String scratchesOrDamage,
                          String stickersOrAccessories, String dimensions, String conditionNotes) {
        this.brand = brand;
        this.model = model;
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
        this.serialNumber = serialNumber;
        this.distinctiveMarks = distinctiveMarks;
        this.scratchesOrDamage = scratchesOrDamage;
        this.stickersOrAccessories = stickersOrAccessories;
        this.dimensions = dimensions;
        this.conditionNotes = conditionNotes;
    }

    // Getters and Setters
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

    public String getDimensions() {
        return dimensions;
    }

    public void setDimensions(String dimensions) {
        this.dimensions = dimensions;
    }

    public String getConditionNotes() {
        return conditionNotes;
    }

    public void setConditionNotes(String conditionNotes) {
        this.conditionNotes = conditionNotes;
    }
}
