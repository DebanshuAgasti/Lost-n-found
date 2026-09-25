package com.lostfound.dto.item;

import com.lostfound.dto.auth.UserDto;
import com.lostfound.model.entity.FoundItem;
import com.lostfound.model.enums.FoundItemStatus;
import com.lostfound.model.enums.ItemCategory;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

public class FoundItemResponse {

    private Long id;
    private String title;
    private String description;
    private ItemCategory category;
    private FoundItemStatus status;
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
    private ItemAttributesDto attributes;
    private UserDto user;
    private List<ItemImageDto> images;
    private Instant createdAt;
    private Instant updatedAt;

    public FoundItemResponse() {
    }

    public static FoundItemResponse from(FoundItem item) {
        if (item == null) return null;
        FoundItemResponse response = new FoundItemResponse();
        response.setId(item.getId());
        response.setTitle(item.getTitle());
        response.setDescription(item.getDescription());
        response.setCategory(item.getCategory());
        response.setStatus(item.getStatus());
        response.setFoundDate(item.getFoundDate());
        response.setFoundTime(item.getFoundTime());
        response.setLocationName(item.getLocationName());
        response.setAddress(item.getAddress());
        response.setCity(item.getCity());
        response.setLatitude(item.getLatitude());
        response.setLongitude(item.getLongitude());
        response.setStorageLocation(item.getStorageLocation());
        response.setCurrentCustodian(item.getCurrentCustodian());
        response.setVerificationQuestion(item.getVerificationQuestion());
        response.setAttributes(ItemAttributesDto.from(item.getAttributes()));
        response.setUser(UserDto.from(item.getUser()));
        if (item.getImages() != null) {
            response.setImages(item.getImages().stream()
                    .map(ItemImageDto::from)
                    .collect(Collectors.toList()));
        }
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());
        return response;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public FoundItemStatus getStatus() {
        return status;
    }

    public void setStatus(FoundItemStatus status) {
        this.status = status;
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
        this.attributes = attributes;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public List<ItemImageDto> getImages() {
        return images;
    }

    public void setImages(List<ItemImageDto> images) {
        this.images = images;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
