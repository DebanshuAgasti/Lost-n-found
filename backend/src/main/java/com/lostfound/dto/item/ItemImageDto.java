package com.lostfound.dto.item;

import com.lostfound.model.entity.ItemImage;
import java.time.Instant;

public class ItemImageDto {

    private Long id;
    private String imageUrl;
    private String originalFilename;
    private Long fileSize;
    private String mimeType;
    private boolean isPrimary;
    private boolean hasEmbedding;
    private Instant createdAt;

    public ItemImageDto() {
    }

    public static ItemImageDto from(ItemImage image) {
        if (image == null) return null;
        ItemImageDto dto = new ItemImageDto();
        dto.setId(image.getId());
        dto.setImageUrl(image.getImageUrl());
        dto.setOriginalFilename(image.getOriginalFilename());
        dto.setFileSize(image.getFileSize());
        dto.setMimeType(image.getMimeType());
        dto.setPrimary(image.isPrimary());
        dto.setHasEmbedding(image.getEmbedding() != null && image.getEmbedding().length > 0);
        dto.setCreatedAt(image.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public boolean isPrimary() {
        return isPrimary;
    }

    public void setPrimary(boolean primary) {
        isPrimary = primary;
    }

    public boolean isHasEmbedding() {
        return hasEmbedding;
    }

    public void setHasEmbedding(boolean hasEmbedding) {
        this.hasEmbedding = hasEmbedding;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
