package com.lostfound.service.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.*;

@Component
public class MockLlmClient implements LlmClient {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getProviderName() {
        return "mock";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public String generateText(String systemPrompt, String userPrompt) {
        String lowerPrompt = (userPrompt != null ? userPrompt : "").toLowerCase();
        String lowerSys = (systemPrompt != null ? systemPrompt : "").toLowerCase();

        if (lowerSys.contains("parse") || lowerPrompt.contains("report")) {
            return generateMockParsedReport(userPrompt);
        } else if (lowerSys.contains("verify") || lowerPrompt.contains("claim")) {
            return generateMockClaimVerification(userPrompt);
        } else if (lowerSys.contains("explain") || lowerPrompt.contains("match")) {
            return generateMockMatchExplanation(userPrompt);
        }

        return generateMockParsedReport(userPrompt);
    }

    @Override
    public String generateMultimodal(String systemPrompt, String userPrompt, byte[] imageBytes, String mimeType) {
        String lowerPrompt = (userPrompt != null ? userPrompt : "").toLowerCase();

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("category", detectCategory(lowerPrompt));
        map.put("brand", detectBrand(lowerPrompt));
        map.put("model", detectModel(lowerPrompt));
        map.put("primaryColor", detectColor(lowerPrompt, "Black"));
        map.put("secondaryColor", detectSecondaryColor(lowerPrompt));
        map.put("distinctiveMarks", lowerPrompt.contains("sticker") ? "Decorative sticker visible" : "Minor edge wear");
        map.put("scratchesOrDamage", lowerPrompt.contains("scratch") ? "Light hairline scratches" : "None observed");
        map.put("stickersOrAccessories", lowerPrompt.contains("case") ? "Protective case attached" : "None");
        map.put("suggestedTitle", map.get("primaryColor") + " " + map.get("brand") + " " + map.get("category"));
        map.put("suggestedDescription", "Identified " + map.get("brand") + " item in " + map.get("primaryColor") + " finish.");
        map.put("confidenceScore", 0.88);

        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String generateMockParsedReport(String text) {
        String lower = text != null ? text.toLowerCase() : "";

        Map<String, Object> root = new LinkedHashMap<>();
        root.put("reportType", lower.contains("found") ? "FOUND" : "LOST");
        root.put("category", detectCategory(lower));
        root.put("title", capitalize(detectColor(lower, "Black")) + " " + detectBrand(lower) + " " + formatCategoryName(detectCategory(lower)));
        root.put("description", text != null ? text.trim() : "");
        root.put("reportedDate", LocalDate.now().toString());
        root.put("reportedTime", "14:30");
        root.put("locationName", detectLocation(lower));
        root.put("city", detectCity(lower));

        Map<String, Object> attr = new LinkedHashMap<>();
        attr.put("brand", detectBrand(lower));
        attr.put("model", detectModel(lower));
        attr.put("primaryColor", detectColor(lower, "Black"));
        attr.put("secondaryColor", detectSecondaryColor(lower));
        attr.put("distinctiveMarks", lower.contains("sticker") ? "Stickers attached" : (lower.contains("engrav") ? "Engraving" : null));
        attr.put("scratchesOrDamage", lower.contains("scratch") || lower.contains("dent") ? "Visible wear/damage" : null);
        attr.put("stickersOrAccessories", lower.contains("case") ? "Protective case" : null);
        root.put("attributes", attr);
        root.put("confidenceScore", 0.92);

        try {
            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String generateMockClaimVerification(String text) {
        String lower = text != null ? text.toLowerCase() : "";

        boolean hasPass = lower.contains("wallpaper") || lower.contains("photo") || lower.contains("sticker")
                || lower.contains("engraving") || lower.contains("blue") || lower.contains("black") || lower.contains("pikachu");

        double confidence = hasPass ? 0.91 : 0.42;
        String verdict = hasPass ? "LIKELY_MATCH" : "INCONCLUSIVE";
        String action = hasPass ? "APPROVE" : "REQUEST_MORE_INFO";

        Map<String, Object> root = new LinkedHashMap<>();
        root.put("confidenceScore", confidence);
        root.put("verdict", verdict);
        root.put("recommendedAction", action);
        root.put("reasoning", hasPass
                ? "Claimant's answer aligns closely with the secret verification question details."
                : "Claimant provided generic or incomplete answers that do not conclusively match the secret custodial question.");
        root.put("matchedEvidence", hasPass ? List.of("Color / marking correlation", "Specific detail consistency") : List.of());
        root.put("discrepancyEvidence", hasPass ? List.of() : List.of("Lacks distinctive proof of ownership detail"));

        try {
            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String generateMockMatchExplanation(String text) {
        Map<String, Object> root = new LinkedHashMap<>();
        root.put("overallScore", 0.85);
        root.put("confidenceGrade", "HIGH");
        root.put("executiveSummary", "Strong multi-dimensional correlation across category, visual appearance, brand, and temporal-geographic proximity.");
        root.put("matchingFactors", List.of(
                "Exact category and brand match",
                "Timeline aligns within 24 hours of reported loss",
                "Reported within 0.8 km of found location",
                "High visual feature cosine similarity (> 82%)"
        ));
        root.put("conflictingFactors", List.of(
                "Minor variance in user-described secondary markings"
        ));
        root.put("recommendation", "High likelihood of match. Recommend notifying both parties for custodial verification.");

        try {
            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String detectCategory(String text) {
        if (text.contains("iphone") || text.contains("phone") || text.contains("laptop") || text.contains("macbook") || text.contains("airpod") || text.contains("headphone")) return "ELECTRONICS";
        if (text.contains("wallet") || text.contains("purse")) return "WALLET_AND_PURSE";
        if (text.contains("key") || text.contains("keychain")) return "KEYS";
        if (text.contains("backpack") || text.contains("bag") || text.contains("pouch")) return "BAGS_AND_BACKPACKS";
        if (text.contains("passport") || text.contains("license") || text.contains("card") || text.contains("id")) return "DOCUMENTS_AND_ID";
        if (text.contains("watch") || text.contains("ring") || text.contains("necklace")) return "JEWELRY_AND_WATCHES";
        if (text.contains("jacket") || text.contains("coat") || text.contains("hat") || text.contains("scarf")) return "CLOTHING_AND_ACCESSORIES";
        if (text.contains("dog") || text.contains("cat") || text.contains("pet")) return "PETS";
        if (text.contains("book") || text.contains("notebook") || text.contains("pen")) return "BOOKS_AND_STATIONERY";
        return "OTHER";
    }

    private String detectBrand(String text) {
        if (text.contains("apple") || text.contains("iphone") || text.contains("macbook") || text.contains("airpod")) return "Apple";
        if (text.contains("samsung") || text.contains("galaxy")) return "Samsung";
        if (text.contains("sony")) return "Sony";
        if (text.contains("dell")) return "Dell";
        if (text.contains("nike")) return "Nike";
        if (text.contains("fossil")) return "Fossil";
        if (text.contains("hydro flask") || text.contains("hydroflask")) return "Hydro Flask";
        if (text.contains("osprey")) return "Osprey";
        return "Unknown Brand";
    }

    private String detectModel(String text) {
        if (text.contains("pro max")) return "Pro Max";
        if (text.contains("pro")) return "Pro";
        if (text.contains("air")) return "Air";
        if (text.contains("15")) return "15";
        if (text.contains("14")) return "14";
        if (text.contains("s24")) return "S24";
        return "Standard Model";
    }

    private String detectColor(String text, String fallback) {
        if (text.contains("blue") || text.contains("navy")) return "Blue";
        if (text.contains("black") || text.contains("dark")) return "Black";
        if (text.contains("silver") || text.contains("gray") || text.contains("grey")) return "Silver";
        if (text.contains("white")) return "White";
        if (text.contains("red")) return "Red";
        if (text.contains("green")) return "Green";
        if (text.contains("gold")) return "Gold";
        if (text.contains("brown")) return "Brown";
        return fallback;
    }

    private String detectSecondaryColor(String text) {
        if (text.contains("silver accent") || text.contains("silver trim")) return "Silver";
        if (text.contains("gold accent")) return "Gold";
        if (text.contains("white logo")) return "White";
        return null;
    }

    private String detectLocation(String text) {
        if (text.contains("library")) return "Central Campus Library";
        if (text.contains("gym") || text.contains("fitness")) return "Recreation & Fitness Center";
        if (text.contains("cafeteria") || text.contains("cafe") || text.contains("dining")) return "Campus Dining Hall";
        if (text.contains("station") || text.contains("metro") || text.contains("transit")) return "Central Transit Station";
        if (text.contains("park")) return "City Central Park";
        return "Reported Campus Area";
    }

    private String detectCity(String text) {
        if (text.contains("boston")) return "Boston";
        if (text.contains("chicago")) return "Chicago";
        if (text.contains("seattle")) return "Seattle";
        if (text.contains("san francisco")) return "San Francisco";
        return "San Jose";
    }

    private String formatCategoryName(String cat) {
        return cat.replace("_", " ").toLowerCase();
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return "";
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
}
