package com.lostfound.controller;

import com.lostfound.dto.ai.ClaimVerificationAiResponse;
import com.lostfound.dto.ai.ExtractedAttributesResponse;
import com.lostfound.dto.ai.MatchExplanationResponse;
import com.lostfound.dto.ai.NaturalLanguageReportRequest;
import com.lostfound.dto.ai.ParsedReportResponse;
import com.lostfound.dto.common.ApiResponse;
import com.lostfound.service.AiAssistanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Assistance", description = "Endpoints for multimodal item inspection, natural language parsing, smart claim verification, and match explanations")
public class AiController {

    private final AiAssistanceService aiService;

    public AiController(AiAssistanceService aiService) {
        this.aiService = aiService;
    }

    @PostMapping(value = "/extract-attributes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Extract structured attributes (brand, model, color, scratches, stickers) from uploaded photo using Multimodal VLM")
    public ResponseEntity<ApiResponse<ExtractedAttributesResponse>> extractAttributes(
            @RequestPart("image") MultipartFile image,
            @RequestParam(value = "context", required = false) String context) throws IOException {

        ExtractedAttributesResponse response = aiService.extractAttributesFromImage(
                image.getBytes(),
                image.getContentType(),
                context
        );
        return ResponseEntity.ok(ApiResponse.success("Attributes extracted successfully from image", response));
    }

    @PostMapping(value = "/parse-report", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Parse unstructured conversational text into structured lost/found item fields")
    public ResponseEntity<ApiResponse<ParsedReportResponse>> parseReport(
            @Valid @RequestBody NaturalLanguageReportRequest request) {

        ParsedReportResponse response = aiService.parseNaturalLanguageReport(request.getText());
        return ResponseEntity.ok(ApiResponse.success("Report parsed successfully", response));
    }

    @PostMapping("/verify-claim/{claimId}")
    @Operation(summary = "AI-assisted custodial claim verification comparing answers to secret verification questions")
    public ResponseEntity<ApiResponse<ClaimVerificationAiResponse>> verifyClaim(@PathVariable Long claimId) {
        ClaimVerificationAiResponse response = aiService.verifyClaim(claimId);
        return ResponseEntity.ok(ApiResponse.success("Claim verification analysis generated", response));
    }

    @GetMapping("/explain-match/{matchId}")
    @Operation(summary = "Generate human-readable AI explanation of match reasoning, factors, and potential discrepancies")
    public ResponseEntity<ApiResponse<MatchExplanationResponse>> explainMatch(@PathVariable Long matchId) {
        MatchExplanationResponse response = aiService.explainMatch(matchId);
        return ResponseEntity.ok(ApiResponse.success("Match explanation generated successfully", response));
    }
}
