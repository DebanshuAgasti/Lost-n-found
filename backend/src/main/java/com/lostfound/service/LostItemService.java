package com.lostfound.service;

import com.lostfound.dto.common.PageResponse;
import com.lostfound.dto.item.LostItemRequest;
import com.lostfound.dto.item.LostItemResponse;
import com.lostfound.event.LostItemCreatedEvent;
import com.lostfound.exception.BadRequestException;
import com.lostfound.exception.ResourceNotFoundException;
import com.lostfound.exception.UnauthorizedException;
import com.lostfound.model.entity.ItemImage;
import com.lostfound.model.entity.LostItem;
import com.lostfound.model.entity.User;
import com.lostfound.model.enums.LostItemStatus;
import com.lostfound.model.enums.Role;
import com.lostfound.repository.ItemImageRepository;
import com.lostfound.repository.LostItemRepository;
import com.lostfound.repository.UserRepository;
import com.lostfound.security.UserPrincipal;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class LostItemService {

    private final LostItemRepository lostItemRepository;
    private final UserRepository userRepository;
    private final ItemImageRepository itemImageRepository;
    private final ImageStorageService imageStorageService;
    private final ImageEmbeddingService embeddingService;
    private final ApplicationEventPublisher eventPublisher;

    public LostItemService(LostItemRepository lostItemRepository,
                           UserRepository userRepository,
                           ItemImageRepository itemImageRepository,
                           ImageStorageService imageStorageService,
                           ImageEmbeddingService embeddingService,
                           ApplicationEventPublisher eventPublisher) {
        this.lostItemRepository = lostItemRepository;
        this.userRepository = userRepository;
        this.itemImageRepository = itemImageRepository;
        this.imageStorageService = imageStorageService;
        this.embeddingService = embeddingService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public LostItemResponse createLostItem(LostItemRequest request, List<MultipartFile> files, UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LostItem lostItem = new LostItem();
        lostItem.setTitle(request.getTitle());
        lostItem.setDescription(request.getDescription());
        lostItem.setCategory(request.getCategory());
        lostItem.setStatus(LostItemStatus.ACTIVE);
        lostItem.setLostDate(request.getLostDate());
        lostItem.setLostTime(request.getLostTime());
        lostItem.setLocationName(request.getLocationName());
        lostItem.setAddress(request.getAddress());
        lostItem.setCity(request.getCity());
        lostItem.setLatitude(request.getLatitude());
        lostItem.setLongitude(request.getLongitude());
        if (request.getAttributes() != null) {
            lostItem.setAttributes(request.getAttributes().toEntity());
        }
        lostItem.setRewardAmount(request.getRewardAmount());
        lostItem.setContactPreference(request.getContactPreference());
        lostItem.setContactPhone(request.getContactPhone());
        lostItem.setContactEmail(request.getContactEmail());
        lostItem.setUser(user);

        LostItem savedItem = lostItemRepository.save(lostItem);

        // Process and attach images if provided
        if (files != null && !files.isEmpty()) {
            boolean isFirst = true;
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    attachImage(savedItem, file, isFirst);
                    isFirst = false;
                }
            }
        }

        // Fire event to trigger matching pipeline
        eventPublisher.publishEvent(new LostItemCreatedEvent(savedItem));

        return LostItemResponse.from(savedItem);
    }

    @Transactional(readOnly = true)
    public LostItemResponse getLostItemById(Long id) {
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item report not found with id: " + id));
        return LostItemResponse.from(item);
    }

    @Transactional(readOnly = true)
    public PageResponse<LostItemResponse> searchLostItems(com.lostfound.model.enums.ItemCategory category,
                                                          LostItemStatus status,
                                                          String city,
                                                          String keyword,
                                                          Pageable pageable) {
        Page<LostItem> page = lostItemRepository.searchLostItems(category, status, city, keyword, pageable);
        return PageResponse.from(page.map(LostItemResponse::from));
    }

    @Transactional(readOnly = true)
    public PageResponse<LostItemResponse> getMyLostItems(UserPrincipal currentUser, Pageable pageable) {
        Page<LostItem> page = lostItemRepository.findByUserId(currentUser.getId(), pageable);
        return PageResponse.from(page.map(LostItemResponse::from));
    }

    @Transactional
    public LostItemResponse updateLostItem(Long id, LostItemRequest request, UserPrincipal currentUser) {
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item report not found with id: " + id));

        verifyOwnerOrAdmin(item.getUser().getId(), currentUser);

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setLostDate(request.getLostDate());
        item.setLostTime(request.getLostTime());
        item.setLocationName(request.getLocationName());
        item.setAddress(request.getAddress());
        item.setCity(request.getCity());
        item.setLatitude(request.getLatitude());
        item.setLongitude(request.getLongitude());
        if (request.getAttributes() != null) {
            item.setAttributes(request.getAttributes().toEntity());
        }
        item.setRewardAmount(request.getRewardAmount());
        item.setContactPreference(request.getContactPreference());
        item.setContactPhone(request.getContactPhone());
        item.setContactEmail(request.getContactEmail());

        LostItem updated = lostItemRepository.save(item);
        eventPublisher.publishEvent(new LostItemCreatedEvent(updated));
        return LostItemResponse.from(updated);
    }

    @Transactional
    public LostItemResponse updateStatus(Long id, LostItemStatus status, UserPrincipal currentUser) {
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item report not found with id: " + id));

        verifyOwnerOrAdmin(item.getUser().getId(), currentUser);
        item.setStatus(status);
        return LostItemResponse.from(lostItemRepository.save(item));
    }

    @Transactional
    public void deleteLostItem(Long id, UserPrincipal currentUser) {
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item report not found with id: " + id));

        verifyOwnerOrAdmin(item.getUser().getId(), currentUser);
        lostItemRepository.delete(item);
    }

    @Transactional
    public LostItemResponse addImages(Long id, List<MultipartFile> files, UserPrincipal currentUser) {
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item report not found with id: " + id));

        verifyOwnerOrAdmin(item.getUser().getId(), currentUser);

        boolean isFirst = item.getImages().isEmpty();
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                attachImage(item, file, isFirst);
                isFirst = false;
            }
        }

        LostItem saved = lostItemRepository.save(item);
        eventPublisher.publishEvent(new LostItemCreatedEvent(saved));
        return LostItemResponse.from(saved);
    }

    private void attachImage(LostItem item, MultipartFile file, boolean isPrimary) {
        try {
            ImageStorageService.StoredFileInfo fileInfo = imageStorageService.storeFile(file);
            float[] embedding = embeddingService.generateEmbedding(file.getBytes(), file.getContentType());

            ItemImage image = new ItemImage(
                    fileInfo.url(),
                    fileInfo.filePath(),
                    fileInfo.filename(),
                    fileInfo.fileSize(),
                    fileInfo.mimeType(),
                    isPrimary,
                    embedding
            );
            item.addImage(image);
        } catch (IOException e) {
            throw new BadRequestException("Failed to process image file: " + file.getOriginalFilename());
        }
    }

    private void verifyOwnerOrAdmin(Long ownerId, UserPrincipal currentUser) {
        boolean isOwner = ownerId.equals(currentUser.getId());
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(Role.ROLE_ADMIN.name()));

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You do not have permission to modify this report.");
        }
    }
}
