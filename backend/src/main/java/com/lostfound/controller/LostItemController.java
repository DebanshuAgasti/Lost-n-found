package com.lostfound.controller;

import com.lostfound.dto.common.ApiResponse;
import com.lostfound.dto.common.PageResponse;
import com.lostfound.dto.item.LostItemRequest;
import com.lostfound.dto.item.LostItemResponse;
import com.lostfound.model.enums.ItemCategory;
import com.lostfound.model.enums.LostItemStatus;
import com.lostfound.security.UserPrincipal;
import com.lostfound.service.LostItemService;
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
@RequestMapping("/api/lost-items")
@Tag(name = "Lost Items", description = "Endpoints for managing lost item reports, images, and search")
public class LostItemController {

    private final LostItemService lostItemService;

    public LostItemController(LostItemService lostItemService) {
        this.lostItemService = lostItemService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create a lost item report without images (JSON)")
    public ResponseEntity<ApiResponse<LostItemResponse>> createLostItemJson(
            @Valid @RequestBody LostItemRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        LostItemResponse response = lostItemService.createLostItem(request, null, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Lost item report created successfully", response));
    }

    @PostMapping(value = "/with-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a lost item report with image attachments")
    public ResponseEntity<ApiResponse<LostItemResponse>> createLostItemMultipart(
            @Valid @RequestPart("item") LostItemRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        LostItemResponse response = lostItemService.createLostItem(request, images, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Lost item report and images processed successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a lost item report by ID")
    public ResponseEntity<ApiResponse<LostItemResponse>> getLostItemById(@PathVariable Long id) {
        LostItemResponse response = lostItemService.getLostItemById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Search and filter lost items (public)")
    public ResponseEntity<ApiResponse<PageResponse<LostItemResponse>>> searchLostItems(
            @RequestParam(required = false) ItemCategory category,
            @RequestParam(required = false) LostItemStatus status,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<LostItemResponse> response = lostItemService.searchLostItems(category, status, city, keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/my")
    @Operation(summary = "Get lost items reported by current user")
    public ResponseEntity<ApiResponse<PageResponse<LostItemResponse>>> getMyLostItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<LostItemResponse> response = lostItemService.getMyLostItems(currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing lost item report")
    public ResponseEntity<ApiResponse<LostItemResponse>> updateLostItem(
            @PathVariable Long id,
            @Valid @RequestBody LostItemRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        LostItemResponse response = lostItemService.updateLostItem(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Lost item report updated", response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update status of a lost item report")
    public ResponseEntity<ApiResponse<LostItemResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam LostItemStatus status,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        LostItemResponse response = lostItemService.updateStatus(id, status, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Status updated", response));
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload additional images to an existing lost item report")
    public ResponseEntity<ApiResponse<LostItemResponse>> addImages(
            @PathVariable Long id,
            @RequestPart("images") List<MultipartFile> images,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        LostItemResponse response = lostItemService.addImages(id, images, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Images added and embeddings generated", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a lost item report")
    public ResponseEntity<ApiResponse<Void>> deleteLostItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        lostItemService.deleteLostItem(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Report deleted successfully", null));
    }
}
