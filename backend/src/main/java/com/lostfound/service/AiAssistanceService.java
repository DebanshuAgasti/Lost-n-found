package com.lostfound.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lostfound.dto.ai.*;
import com.lostfound.dto.item.ItemAttributesDto;
import com.lostfound.exception.ResourceNotFoundException;
import com.lostfound.model.entity.CandidateMatch;
import com.lostfound.model.entity.Claim;
import com.lostfound.model.entity.FoundItem;
import com.lostfound.model.entity.LostItem;
import com.lostfound.model.enums.ItemCategory;
import com.lostfound.repository.CandidateMatchRepository;
import com.lostfound.repository.ClaimRepository;
import com.lostfound.service.llm.LlmClientRouter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AiAssistanceService {

    private static final Logger log = LoggerFactory.getLogger(AiAssistanceService.class);

    private final LlmClientRouter llmRouter;
    private final ClaimRepository claimRepository;
    private final CandidateMatchRepository matchRepository;
    private final ObjectMapper objectMapper;

    public AiAssistanceService(LlmClientRouter llmRouter,
                               ClaimRepository claimRepository,
                               CandidateMatchRepository matchRepository) {
        this.llmRouter = llmRouter;
        this.claimRepository = claimRepository;
        this.matchRepository = matchRepository;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Feature 1: Multimodal Vision Attribute Extraction
     */
    public ExtractedAttributesResponse extractAttributesFromImage(byte[] imageBytes, String mimeType, String optionalContext) {
        String systemPrompt = """
                You are an expert AI physical item inspection assistant for a Lost and Found campus platform.
                Inspect the provided item photo and extract structured attributes in JSON.
                JSON Keys required:
                - "category": one of [ELECTRONICS, WALLET_AND_PURSE, KEYS, DOCUMENTS_AND_ID, JEWELRY_AND_WATCHES, BAGS_AND_BACKPACKS, CLOTHING_AND_ACCESSORIES, PETS, BOOKS_AND_STATIONERY, SPORTS_EQUIPMENT, OTHER]
                - "brand": detected brand name or null
                - "model": specific model or null
                - "primaryColor": dominant color (e.g. Black, Blue, Silver, White, Red, Navy)
                - "secondaryColor": accent/trim color or null
                - "serialNumber": visible serial number or text or null
                - "distinctiveMarks": visible engravings, patterns, keychains or unique features
                - "scratchesOrDamage": visible cracks, scratches, dents, or wear
                - "stickersOrAccessories": visible stickers, decals, straps, or attached cases
                - "suggestedTitle": concise title (e.g. "Space Gray Apple MacBook Air 13-inch")
                - "suggestedDescription": brief 1-2 sentence description of appearance and condition
                - "confidenceScore": float between 0.0 and 1.0 indicating inspection confidence
                Respond only with valid JSON.
                """;

        String userPrompt = (optionalContext != null && !optionalContext.isBlank())
                ? "Additional context from user: " + optionalContext
                : "Analyze the uploaded item photo.";

        String jsonResponse = llmRouter.generateMultimodalWithFallback(systemPrompt, userPrompt, imageBytes, mimeType);
        return parseAttributesJson(jsonResponse);
    }

    /**
     * Feature 2: Natural Language Report Parser
     */
    public ParsedReportResponse parseNaturalLanguageReport(String userText) {
        String systemPrompt = """
                You are an intelligent report parser for a Lost and Found system.
                Extract structured fields from conversational user input into JSON.
                JSON Keys required:
                - "reportType": "LOST" or "FOUND"
                - "category": one of [ELECTRONICS, WALLET_AND_PURSE, KEYS, DOCUMENTS_AND_ID, JEWELRY_AND_WATCHES, BAGS_AND_BACKPACKS, CLOTHING_AND_ACCESSORIES, PETS, BOOKS_AND_STATIONERY, SPORTS_EQUIPMENT, OTHER]
                - "title": concise descriptive title
                - "description": clean summary of what happened
                - "reportedDate": ISO-8601 date (YYYY-MM-DD), infer relative dates like 'yesterday', 'this morning'
                - "reportedTime": time in HH:mm (24-hour) if mentioned, or null
                - "locationName": specific place mentioned (e.g. "Student Center Cafe", "Gate B4")
                - "city": city name if mentioned or "San Jose"
                - "attributes": object with "brand", "model", "primaryColor", "secondaryColor", "distinctiveMarks", "scratchesOrDamage", "stickersOrAccessories"
                - "confidenceScore": float between 0.0 and 1.0
                Respond only with valid JSON.
                """;

        String jsonResponse = llmRouter.generateTextWithFallback(systemPrompt, userText);
        return parseReportJson(jsonResponse, userText);
    }

    /**
     * Feature 3: Smart Claim Verification Assistant
     */
    @Transactional(readOnly = true)
    public ClaimVerificationAiResponse verifyClaim(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim", "id", claimId));

        FoundItem foundItem = claim.getFoundItem();
        String question = foundItem.getVerificationQuestion();
        String answers = claim.getVerificationAnswers();
        String proofDesc = claim.getProofDescription();

        String systemPrompt = """
                You are a fraud prevention and custodial verification assistant for a Lost and Found facility.
                Evaluate whether the claimant's submitted answer and proof match the custodian's verification question.
                Do not penalize minor typos, casing, or synonym differences. Flag suspicious or vague answers.
                JSON Keys required:
                - "confidenceScore": float between 0.0 and 1.0
                - "verdict": "LIKELY_MATCH", "UNLIKELY_MATCH", or "INCONCLUSIVE"
                - "recommendedAction": "APPROVE", "REJECT", or "REQUEST_MORE_INFO"
                - "reasoning": 2-3 sentence explanation of alignment or discrepancies
                - "matchedEvidence": list of strings citing matching details
                - "discrepancyEvidence": list of strings citing conflicting or missing details
                Respond only with valid JSON.
                """;

        String userPrompt = String.format("""
                Target Item: %s (%s)
                Custodian Secret Verification Question: "%s"
                Claimant Submitted Answers: "%s"
                Claimant Proof Description: "%s"
                """,
                foundItem.getTitle(),
                foundItem.getCategory(),
                question != null ? question : "No question recorded",
                answers != null ? answers : "",
                proofDesc != null ? proofDesc : ""
        );

        String jsonResponse = llmRouter.generateTextWithFallback(systemPrompt, userPrompt);
        ClaimVerificationAiResponse response = parseClaimVerificationJson(jsonResponse);
        response.setClaimId(claimId);
        return response;
    }

    /**
     * Feature 4: Match Explanation & Reasoning Generator
     */
    @Transactional(readOnly = true)
    public MatchExplanationResponse explainMatch(Long matchId) {
        CandidateMatch match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("CandidateMatch", "id", matchId));

        LostItem lost = match.getLostItem();
        FoundItem found = match.getFoundItem();

        String systemPrompt = """
                You are an explainable AI assistant for a Lost and Found multi-modal matching engine.
                Explain in human terms why this Lost Item and Found Item received this match score.
                JSON Keys required:
                - "executiveSummary": 2-3 sentences summarizing the match reasoning
                - "matchingFactors": list of strings highlighting strong positive correspondences
                - "conflictingFactors": list of strings highlighting differences, risks, or gaps
                - "confidenceGrade": "VERY_HIGH", "HIGH", "MODERATE", or "LOW"
                - "recommendation": guidance for owners/custodians on next steps
                Respond only with valid JSON.
                """;

        String userPrompt = String.format("""
                Overall Score: %.1f%%
                Category Score: %s
                Visual Cosine Score: %s
                Attribute Score: %s
                Text Similarity Score: %s
                Location Score: %s
                Temporal Score: %s

                LOST ITEM:
                Title: %s
                Category: %s
                Brand: %s | Model: %s | Color: %s
                Location: %s, %s
                Date: %s
                Description: %s
                Marks: %s | Damage: %s | Stickers: %s

                FOUND ITEM:
                Title: %s
                Category: %s
                Brand: %s | Model: %s | Color: %s
                Location: %s, %s
                Date: %s
                Description: %s
                Marks: %s | Damage: %s | Stickers: %s
                """,
                match.getOverallScore() * 100,
                match.getCategoryScore(),
                match.getVisualScore(),
                match.getAttributesScore(),
                match.getTextScore(),
                match.getLocationScore(),
                match.getTemporalScore(),
                lost.getTitle(), lost.getCategory(),
                lost.getAttributes() != null ? lost.getAttributes().getBrand() : "",
                lost.getAttributes() != null ? lost.getAttributes().getModel() : "",
                lost.getAttributes() != null ? lost.getAttributes().getPrimaryColor() : "",
                lost.getLocationName(), lost.getCity(), lost.getLostDate(), lost.getDescription(),
                lost.getAttributes() != null ? lost.getAttributes().getDistinctiveMarks() : "",
                lost.getAttributes() != null ? lost.getAttributes().getScratchesOrDamage() : "",
                lost.getAttributes() != null ? lost.getAttributes().getStickersOrAccessories() : "",
                found.getTitle(), found.getCategory(),
                found.getAttributes() != null ? found.getAttributes().getBrand() : "",
                found.getAttributes() != null ? found.getAttributes().getModel() : "",
                found.getAttributes() != null ? found.getAttributes().getPrimaryColor() : "",
                found.getLocationName(), found.getCity(), found.getFoundDate(), found.getDescription(),
                found.getAttributes() != null ? found.getAttributes().getDistinctiveMarks() : "",
                found.getAttributes() != null ? found.getAttributes().getScratchesOrDamage() : "",
                found.getAttributes() != null ? found.getAttributes().getStickersOrAccessories() : ""
        );

        String jsonResponse = llmRouter.generateTextWithFallback(systemPrompt, userPrompt);
        MatchExplanationResponse response = parseMatchExplanationJson(jsonResponse);
        response.setMatchId(matchId);
        response.setLostItemId(lost.getId());
        response.setFoundItemId(found.getId());
        response.setOverallScore(match.getOverallScore());
        return response;
    }

    // Helper JSON Parsers
    private ExtractedAttributesResponse parseAttributesJson(String json) {
        ExtractedAttributesResponse res = new ExtractedAttributesResponse();
        try {
            JsonNode node = cleanAndParseJson(json);
            res.setCategory(resolveCategory(node.path("category").asText(null)));
            res.setBrand(getTextOrNull(node, "brand"));
            res.setModel(getTextOrNull(node, "model"));
            res.setPrimaryColor(getTextOrNull(node, "primaryColor"));
            res.setSecondaryColor(getTextOrNull(node, "secondaryColor"));
            res.setSerialNumber(getTextOrNull(node, "serialNumber"));
            res.setDistinctiveMarks(getTextOrNull(node, "distinctiveMarks"));
            res.setScratchesOrDamage(getTextOrNull(node, "scratchesOrDamage"));
            res.setStickersOrAccessories(getTextOrNull(node, "stickersOrAccessories"));
            res.setSuggestedTitle(getTextOrNull(node, "suggestedTitle"));
            res.setSuggestedDescription(getTextOrNull(node, "suggestedDescription"));
            res.setConfidenceScore(node.has("confidenceScore") ? node.path("confidenceScore").asDouble(0.85) : 0.85);
        } catch (Exception e) {
            log.warn("Failed to parse attributes JSON: {}", e.getMessage());
            res.setCategory(ItemCategory.OTHER);
            res.setConfidenceScore(0.5);
        }
        return res;
    }

    private ParsedReportResponse parseReportJson(String json, String originalText) {
        ParsedReportResponse res = new ParsedReportResponse();
        try {
            JsonNode node = cleanAndParseJson(json);
            res.setReportType(node.path("reportType").asText("LOST").toUpperCase());
            res.setCategory(resolveCategory(node.path("category").asText(null)));
            res.setTitle(node.path("title").asText("Reported Item"));
            res.setDescription(node.path("description").asText(originalText));

            if (node.hasNonNull("reportedDate")) {
                try {
                    res.setReportedDate(LocalDate.parse(node.path("reportedDate").asText()));
                } catch (Exception ignored) {
                    res.setReportedDate(LocalDate.now());
                }
            } else {
                res.setReportedDate(LocalDate.now());
            }

            if (node.hasNonNull("reportedTime")) {
                try {
                    res.setReportedTime(LocalTime.parse(node.path("reportedTime").asText()));
                } catch (Exception ignored) {}
            }

            res.setLocationName(getTextOrNull(node, "locationName"));
            res.setCity(node.path("city").asText("San Jose"));

            ItemAttributesDto attr = new ItemAttributesDto();
            JsonNode attrNode = node.path("attributes");
            if (!attrNode.isMissingNode()) {
                attr.setBrand(getTextOrNull(attrNode, "brand"));
                attr.setModel(getTextOrNull(attrNode, "model"));
                attr.setPrimaryColor(getTextOrNull(attrNode, "primaryColor"));
                attr.setSecondaryColor(getTextOrNull(attrNode, "secondaryColor"));
                attr.setDistinctiveMarks(getTextOrNull(attrNode, "distinctiveMarks"));
                attr.setScratchesOrDamage(getTextOrNull(attrNode, "scratchesOrDamage"));
                attr.setStickersOrAccessories(getTextOrNull(attrNode, "stickersOrAccessories"));
            }
            res.setAttributes(attr);
            res.setConfidenceScore(node.path("confidenceScore").asDouble(0.90));
        } catch (Exception e) {
            log.warn("Failed to parse report JSON: {}", e.getMessage());
            res.setReportType("LOST");
            res.setCategory(ItemCategory.OTHER);
            res.setTitle("Reported Item");
            res.setDescription(originalText);
            res.setReportedDate(LocalDate.now());
            res.setConfidenceScore(0.5);
        }
        return res;
    }

    private ClaimVerificationAiResponse parseClaimVerificationJson(String json) {
        ClaimVerificationAiResponse res = new ClaimVerificationAiResponse();
        try {
            JsonNode node = cleanAndParseJson(json);
            res.setConfidenceScore(node.path("confidenceScore").asDouble(0.5));
            res.setVerdict(node.path("verdict").asText("INCONCLUSIVE"));
            res.setRecommendedAction(node.path("recommendedAction").asText("REQUEST_MORE_INFO"));
            res.setReasoning(node.path("reasoning").asText("Automated assessment completed."));

            List<String> matches = new ArrayList<>();
            JsonNode matchArray = node.path("matchedEvidence");
            if (matchArray.isArray()) {
                for (JsonNode m : matchArray) matches.add(m.asText());
            }
            res.setMatchedEvidence(matches);

            List<String> discrepancies = new ArrayList<>();
            JsonNode discArray = node.path("discrepancyEvidence");
            if (discArray.isArray()) {
                for (JsonNode d : discArray) discrepancies.add(d.asText());
            }
            res.setDiscrepancyEvidence(discrepancies);
        } catch (Exception e) {
            log.warn("Failed to parse claim verification JSON: {}", e.getMessage());
            res.setVerdict("INCONCLUSIVE");
            res.setConfidenceScore(0.5);
            res.setRecommendedAction("REQUEST_MORE_INFO");
            res.setReasoning("Unable to conclusively evaluate claim. Manual custodian review advised.");
        }
        return res;
    }

    private MatchExplanationResponse parseMatchExplanationJson(String json) {
        MatchExplanationResponse res = new MatchExplanationResponse();
        try {
            JsonNode node = cleanAndParseJson(json);
            res.setExecutiveSummary(node.path("executiveSummary").asText("Strong multi-dimensional correlation between lost and found reports."));
            res.setConfidenceGrade(node.path("confidenceGrade").asText("HIGH"));
            res.setRecommendation(node.path("recommendation").asText("Recommend contacting finder/custodian."));

            List<String> matches = new ArrayList<>();
            JsonNode matchArray = node.path("matchingFactors");
            if (matchArray.isArray()) {
                for (JsonNode m : matchArray) matches.add(m.asText());
            }
            res.setMatchingFactors(matches);

            List<String> conflicts = new ArrayList<>();
            JsonNode conflictArray = node.path("conflictingFactors");
            if (conflictArray.isArray()) {
                for (JsonNode c : conflictArray) conflicts.add(c.asText());
            }
            res.setConflictingFactors(conflicts);
        } catch (Exception e) {
            log.warn("Failed to parse match explanation JSON: {}", e.getMessage());
            res.setExecutiveSummary("Candidate match flagged based on composite scoring thresholds.");
            res.setConfidenceGrade("MODERATE");
            res.setRecommendation("Verify individual item attributes with custodian.");
        }
        return res;
    }

    private JsonNode cleanAndParseJson(String raw) throws Exception {
        String clean = raw.trim();
        if (clean.startsWith("```json")) {
            clean = clean.substring(7);
        } else if (clean.startsWith("```")) {
            clean = clean.substring(3);
        }
        if (clean.endsWith("```")) {
            clean = clean.substring(0, clean.length() - 3);
        }
        return objectMapper.readTree(clean.trim());
    }

    private ItemCategory resolveCategory(String raw) {
        if (raw == null) return ItemCategory.OTHER;
        try {
            return ItemCategory.valueOf(raw.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return ItemCategory.OTHER;
        }
    }

    private String getTextOrNull(JsonNode node, String field) {
        if (node.hasNonNull(field) && !node.path(field).asText().isBlank() && !node.path(field).asText().equalsIgnoreCase("null")) {
            return node.path(field).asText().trim();
        }
        return null;
    }
}
