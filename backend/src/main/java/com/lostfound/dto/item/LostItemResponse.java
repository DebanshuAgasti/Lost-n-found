package com.lostfound.dto.item;

import com.lostfound.dto.auth.UserDto;
import com.lostfound.model.entity.LostItem;
import com.lostfound.model.enums.ContactPreference;
import com.lostfound.model.enums.ItemCategory;
import com.lostfound.model.enums.LostItemStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

public class LostItemResponse {

    private Long id;
    private String title;
    private String description;
    private ItemCategory category;
    private LostItemStatus status;
    private LocalDate lostDate;
    private LocalTime lostTime;
    private String locationName;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private ItemAttributesDto attributes;
    private BigDecimal rewardAmount;
    private ContactPreference contactPreference;
    private String contactPhone;
    private String contactEmail;
    private UserDto user;
    private List<ItemImageDto> images;
    private Instant createdAt;
    private Instant updatedAt;

    public LostItemResponse() {
    }

    public static LostItemResponse from(LostItem item) {
        if (item == null) return null;
        LostItemResponse response = new LostItemResponse();
        response.setId(item.getId());
        response.setTitle(item.getTitle());
        response.setDescription(item.getDescription());
        response.setCategory(item.getCategory());
        response.setStatus(item.getStatus());
        response.setLostDate(item.getLostDate());
        response.setLostTime(item.getLostTime());
        response.setLocationName(item.getLocationName());
        response.setAddress(item.getAddress());
        response.setCity(item.getCity());
        response.setLatitude(item.getLatitude());
        response.setLongitude(item.getLongitude());
        response.setAttributes(ItemAttributesDto.from(item.getAttributes()));
        response.setRewardAmount(item.getRewardAmount());
        response.setContactPreference(item.getContactPreference());
        response.setContactPhone(item.getContactPhone());
        response.setContactEmail(item.getContactEmail());
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

    public LostItemStatus getStatus() {
        return status;
    }

    public void setStatus(LostItemStatus status) {
        this.status = status;
    }

    public LocalDate getLostDate() {
        return lostDate;
    }

    public void setLostDate(LocalDate lostDate) {
        this.lostDate = lostDate;
    }

    public LocalTime getLostTime() {
        return lostTime;
    }

    public void setLostTime(LocalTime lostTime) {
        this.lostTime = lostTime;
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

    public ItemAttributesDto getAttributes() {
        return attributes;
    }

    public void setAttributes(ItemAttributesDto attributes) {
        this.attributes = attributes;
    }

    public BigDecimal getRewardAmount() {
        return rewardAmount;
    }

    public void setRewardAmount(BigDecimal rewardAmount) {
        this.rewardAmount = rewardAmount;
    }

    public ContactPreference getContactPreference() {
        return contactPreference;
    }

    public void setContactPreference(ContactPreference contactPreference) {
        this.contactPreference = contactPreference;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
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
