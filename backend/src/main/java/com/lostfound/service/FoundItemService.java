package com.lostfound.service;

import com.lostfound.dto.common.PageResponse;
import com.lostfound.dto.item.FoundItemRequest;
import com.lostfound.dto.item.FoundItemResponse;
import com.lostfound.event.FoundItemCreatedEvent;
import com.lostfound.exception.BadRequestException;
import com.lostfound.exception.ResourceNotFoundException;
import com.lostfound.exception.UnauthorizedException;
import com.lostfound.model.entity.FoundItem;
import com.lostfound.model.entity.ItemImage;
import com.lostfound.model.entity.User;
import com.lostfound.model.enums.FoundItemStatus;
import com.lostfound.model.enums.ItemCategory;
import com.lostfound.model.enums.Role;
import com.lostfound.repository.FoundItemRepository;
import com.lostfound.repository.ItemImageRepository;
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
public class FoundItemService {

    private final FoundItemRepository foundItemRepository;
    private final UserRepository userRepository;
    private final ItemImageRepository itemImageRepository;
    private final ImageStorageService imageStorageService;
    private final ImageEmbeddingService embeddingService;
    private final ApplicationEventPublisher eventPublisher;

    public FoundItemService(FoundItemRepository foundItemRepository,
                            UserRepository userRepository,
                            ItemImageRepository itemImageRepository,
                            ImageStorageService imageStorageService,
                            ImageEmbeddingService embeddingService,
                            ApplicationEventPublisher eventPublisher) {
        this.foundItemRepository = foundItemRepository;
        this.userRepository = userRepository;
        this.itemImageRepository = itemImageRepository;
        this.imageStorageService = imageStorageService;
        this.embeddingService = embeddingService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public FoundItemResponse createFoundItem(FoundItemRequest request, List<MultipartFile> files, UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        FoundItem foundItem = new FoundItem();
        foundItem.setTitle(request.getTitle());
        foundItem.setDescription(request.getDescription());
        foundItem.setCategory(request.getCategory());
        foundItem.setStatus(FoundItemStatus.ACTIVE);
        foundItem.setFoundDate(request.getFoundDate());
        foundItem.setFoundTime(request.getFoundTime());
        foundItem.setLocationName(request.getLocationName());
        foundItem.setAddress(request.getAddress());
        foundItem.setCity(request.getCity());
        foundItem.setLatitude(request.getLatitude());
        foundItem.setLongitude(request.getLongitude());
        foundItem.setStorageLocation(request.getStorageLocation());
        foundItem.setCurrentCustodian(request.getCurrentCustodian());
        foundItem.setVerificationQuestion(request.getVerificationQuestion());
        if (request.getAttributes() != null) {
            foundItem.setAttributes(request.getAttributes().toEntity());
        }
        foundItem.setUser(user);

        FoundItem savedItem = foundItemRepository.save(foundItem);

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
        eventPublisher.publishEvent(new FoundItemCreatedEvent(savedItem));

        return FoundItemResponse.from(savedItem);
    }

    @Transactional(readOnly = true)
    public FoundItemResponse getFoundItemById(Long id) {
        FoundItem item = foundItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Found item report not found with id: " + id));
        return FoundItemResponse.from(item);
    }

    @Transactional(readOnly = true)
    public PageResponse<FoundItemResponse> searchFoundItems(ItemCategory category,
                                                            FoundItemStatus status,
                                                            String city,
                                                            String keyword,
                                                            Pageable pageable) {
        Page<FoundItem> page = foundItemRepository.searchFoundItems(category, status, city, keyword, pageable);
        return PageResponse.from(page.map(FoundItemResponse::from));
    }

    @Transactional(readOnly = true)
    public PageResponse<FoundItemResponse> getMyFoundItems(UserPrincipal currentUser, Pageable pageable) {
        Page<FoundItem> page = foundItemRepository.findByUserId(currentUser.getId(), pageable);
        return PageResponse.from(page.map(FoundItemResponse::from));
    }

    @Transactional
    public FoundItemResponse updateFoundItem(Long id, FoundItemRequest request, UserPrincipal currentUser) {
        FoundItem item = foundItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Found item report not found with id: " + id));

        verifyOwnerOrAdmin(item.getUser().getId(), currentUser);

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setFoundDate(request.getFoundDate());
        item.setFoundTime(request.getFoundTime());
        item.setLocationName(request.getLocationName());
        item.setAddress(request.getAddress());
        item.setCity(request.getCity());
        item.setLatitude(request.getLatitude());
        item.setLongitude(request.getLongitude());
        item.setStorageLocation(request.getStorageLocation());
        item.setCurrentCustodian(request.getCurrentCustodian());
        item.setVerificationQuestion(request.getVerificationQuestion());
        if (request.getAttributes() != null) {
            item.setAttributes(request.getAttributes().toEntity());
        }

        FoundItem updated = foundItemRepository.save(item);
        eventPublisher.publishEvent(new FoundItemCreatedEvent(updated));
        return FoundItemResponse.from(updated);
    }

    @Transactional
    public FoundItemResponse updateStatus(Long id, FoundItemStatus status, UserPrincipal currentUser) {
        FoundItem item = foundItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Found item report not found with id: " + id));

        verifyOwnerOrAdmin(item.getUser().getId(), currentUser);
        item.setStatus(status);
        return FoundItemResponse.from(foundItemRepository.save(item));
    }

    @Transactional
    public void deleteFoundItem(Long id, UserPrincipal currentUser) {
        FoundItem item = foundItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Found item report not found with id: " + id));

        verifyOwnerOrAdmin(item.getUser().getId(), currentUser);
        foundItemRepository.delete(item);
    }

    @Transactional
    public FoundItemResponse addImages(Long id, List<MultipartFile> files, UserPrincipal currentUser) {
        FoundItem item = foundItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Found item report not found with id: " + id));

        verifyOwnerOrAdmin(item.getUser().getId(), currentUser);

        boolean isFirst = item.getImages().isEmpty();
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                attachImage(item, file, isFirst);
                isFirst = false;
            }
        }

        FoundItem saved = foundItemRepository.save(item);
        eventPublisher.publishEvent(new FoundItemCreatedEvent(saved));
        return FoundItemResponse.from(saved);
    }

    private void attachImage(FoundItem item, MultipartFile file, boolean isPrimary) {
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
