package com.lostfound.dto.item;

import com.lostfound.model.entity.ItemAttributes;

public class ItemAttributesDto {

    private String brand;
    private String model;
    private String primaryColor;
    private String secondaryColor;
    private String serialNumber;
    private String distinctiveMarks;
    private String scratchesOrDamage;
    private String stickersOrAccessories;
    private String dimensions;
    private String conditionNotes;

    public ItemAttributesDto() {
    }

    public static ItemAttributesDto from(ItemAttributes attributes) {
        if (attributes == null) return new ItemAttributesDto();
        ItemAttributesDto dto = new ItemAttributesDto();
        dto.setBrand(attributes.getBrand());
        dto.setModel(attributes.getModel());
        dto.setPrimaryColor(attributes.getPrimaryColor());
        dto.setSecondaryColor(attributes.getSecondaryColor());
        dto.setSerialNumber(attributes.getSerialNumber());
        dto.setDistinctiveMarks(attributes.getDistinctiveMarks());
        dto.setScratchesOrDamage(attributes.getScratchesOrDamage());
        dto.setStickersOrAccessories(attributes.getStickersOrAccessories());
        dto.setDimensions(attributes.getDimensions());
        dto.setConditionNotes(attributes.getConditionNotes());
        return dto;
    }

    public ItemAttributes toEntity() {
        return new ItemAttributes(
                brand, model, primaryColor, secondaryColor, serialNumber,
                distinctiveMarks, scratchesOrDamage, stickersOrAccessories,
                dimensions, conditionNotes
        );
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
