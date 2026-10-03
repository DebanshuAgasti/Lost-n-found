package com.lostfound.dto.ai;

import com.lostfound.dto.item.ItemAttributesDto;
import com.lostfound.model.enums.ItemCategory;
import java.time.LocalDate;
import java.time.LocalTime;

public class ParsedReportResponse {

    private String reportType; // "LOST" or "FOUND"
    private String title;
    private String description;
    private ItemCategory category;
    private LocalDate reportedDate;
    private LocalTime reportedTime;
    private String locationName;
    private String address;
    private String city;
    private ItemAttributesDto attributes;
    private Double confidenceScore;

    public ParsedReportResponse() {
        this.attributes = new ItemAttributesDto();
    }

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ItemCategory getCategory() {
        return category;
    }

    public void setCategory(ItemCategory category) {
        this.category = category;
    }

    public LocalDate getReportedDate() {
        return reportedDate;
    }

    public void setReportedDate(LocalDate reportedDate) {
        this.reportedDate = reportedDate;
    }

    public LocalTime getReportedTime() {
        return reportedTime;
    }

    public void setReportedTime(LocalTime reportedTime) {
        this.reportedTime = reportedTime;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public ItemAttributesDto getAttributes() {
        return attributes;
    }

    public void setAttributes(ItemAttributesDto attributes) {
        this.attributes = attributes;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
}
