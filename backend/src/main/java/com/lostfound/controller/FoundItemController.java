package com.lostfound.controller;

import com.lostfound.dto.common.ApiResponse;
import com.lostfound.dto.common.PageResponse;
import com.lostfound.dto.item.FoundItemRequest;
import com.lostfound.dto.item.FoundItemResponse;
import com.lostfound.model.enums.FoundItemStatus;
import com.lostfound.model.enums.ItemCategory;
import com.lostfound.security.UserPrincipal;
import com.lostfound.service.FoundItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/found-items")
@Tag(name = "Found Items", description = "Endpoints for reporting found items, uploading discovery photos, and search")
public class FoundItemController {

    private final FoundItemService foundItemService;

    public FoundItemController(FoundItemService foundItemService) {
        this.foundItemService = foundItemService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create a found item report without images (JSON)")
    public ResponseEntity<ApiResponse<FoundItemResponse>> createFoundItemJson(
            @Valid @RequestBody FoundItemRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        FoundItemResponse response = foundItemService.createFoundItem(request, null, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Found item report created successfully", response));
    }

    @PostMapping(value = "/with-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a found item report with image attachments")
    public ResponseEntity<ApiResponse<FoundItemResponse>> createFoundItemMultipart(
            @Valid @RequestPart("item") FoundItemRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        FoundItemResponse response = foundItemService.createFoundItem(request, images, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Found item report and images processed successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a found item report by ID")
    public ResponseEntity<ApiResponse<FoundItemResponse>> getFoundItemById(@PathVariable Long id) {
        FoundItemResponse response = foundItemService.getFoundItemById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Search and filter found items (public)")
    public ResponseEntity<ApiResponse<PageResponse<FoundItemResponse>>> searchFoundItems(
            @RequestParam(required = false) ItemCategory category,
            @RequestParam(required = false) FoundItemStatus status,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<FoundItemResponse> response = foundItemService.searchFoundItems(category, status, city, keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/my")
    @Operation(summary = "Get found items reported by current user")
    public ResponseEntity<ApiResponse<PageResponse<FoundItemResponse>>> getMyFoundItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<FoundItemResponse> response = foundItemService.getMyFoundItems(currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing found item report")
    public ResponseEntity<ApiResponse<FoundItemResponse>> updateFoundItem(
            @PathVariable Long id,
            @Valid @RequestBody FoundItemRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        FoundItemResponse response = foundItemService.updateFoundItem(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Found item report updated", response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update status of a found item report")
    public ResponseEntity<ApiResponse<FoundItemResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam FoundItemStatus status,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        FoundItemResponse response = foundItemService.updateStatus(id, status, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Status updated", response));
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload additional images to an existing found item report")
    public ResponseEntity<ApiResponse<FoundItemResponse>> addImages(
            @PathVariable Long id,
            @RequestPart("images") List<MultipartFile> images,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        FoundItemResponse response = foundItemService.addImages(id, images, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Images added and embeddings generated", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a found item report")
    public ResponseEntity<ApiResponse<Void>> deleteFoundItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        foundItemService.deleteFoundItem(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Report deleted successfully", null));
    }
}
