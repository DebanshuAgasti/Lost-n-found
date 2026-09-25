package com.lostfound.dto.item;

import com.lostfound.model.enums.ItemCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class FoundItemRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Category is required")
    private ItemCategory category;

    @NotNull(message = "Found date is required")
    private LocalDate foundDate;

    private LocalTime foundTime;

    private String locationName;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;

    private String storageLocation;
    private String currentCustodian;
    private String verificationQuestion;

    private ItemAttributesDto attributes = new ItemAttributesDto();

    public FoundItemRequest() {
    }

    // Getters and Setters
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

    public LocalDate getFoundDate() {
        return foundDate;
    }

    public void setFoundDate(LocalDate foundDate) {
        this.foundDate = foundDate;
    }

    public LocalTime getFoundTime() {
        return foundTime;
    }

    public void setFoundTime(LocalTime foundTime) {
        this.foundTime = foundTime;
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

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getStorageLocation() {
        return storageLocation;
    }

    public void setStorageLocation(String storageLocation) {
        this.storageLocation = storageLocation;
    }

    public String getCurrentCustodian() {
        return currentCustodian;
    }

    public void setCurrentCustodian(String currentCustodian) {
        this.currentCustodian = currentCustodian;
    }

    public String getVerificationQuestion() {
        return verificationQuestion;
    }

    public void setVerificationQuestion(String verificationQuestion) {
        this.verificationQuestion = verificationQuestion;
    }

    public ItemAttributesDto getAttributes() {
        return attributes;
    }

    public void setAttributes(ItemAttributesDto attributes) {
        this.attributes = attributes != null ? attributes : new ItemAttributesDto();
    }
}
