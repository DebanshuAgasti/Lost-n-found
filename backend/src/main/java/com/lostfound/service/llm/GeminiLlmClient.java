package com.lostfound.service.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lostfound.config.LlmProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
public class GeminiLlmClient implements LlmClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiLlmClient.class);
    private static final String DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com";

    private final LlmProperties properties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiLlmClient(LlmProperties properties) {
        this.properties = properties;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public String getProviderName() {
        return "gemini";
    }

    @Override
    public boolean isAvailable() {
        return properties.getApiKey() != null && !properties.getApiKey().trim().isEmpty();
    }

    @Override
    public String generateText(String systemPrompt, String userPrompt) {
        return executeGeminiRequest(systemPrompt, userPrompt, null, null);
    }

    @Override
    public String generateMultimodal(String systemPrompt, String userPrompt, byte[] imageBytes, String mimeType) {
        return executeGeminiRequest(systemPrompt, userPrompt, imageBytes, mimeType);
    }

    private String executeGeminiRequest(String systemPrompt, String userPrompt, byte[] imageBytes, String mimeType) {
        if (!isAvailable()) {
            throw new IllegalStateException("Gemini API key is not configured");
        }

        String baseUrl = (properties.getBaseUrl() != null && !properties.getBaseUrl().isBlank())
                ? properties.getBaseUrl().replaceAll("/+$", "")
                : DEFAULT_BASE_URL;

        String model = properties.getModel() != null && !properties.getModel().isBlank()
                ? properties.getModel()
                : "gemini-1.5-flash";

        String url = String.format("%s/v1beta/models/%s:generateContent?key=%s", baseUrl, model, properties.getApiKey().trim());

        Map<String, Object> requestBody = new LinkedHashMap<>();

        if (systemPrompt != null && !systemPrompt.isBlank()) {
            Map<String, Object> sysInstruction = new HashMap<>();
            sysInstruction.put("parts", List.of(Map.of("text", systemPrompt)));
            requestBody.put("systemInstruction", sysInstruction);
        }

        List<Map<String, Object>> parts = new ArrayList<>();
        if (userPrompt != null && !userPrompt.isBlank()) {
            parts.add(Map.of("text", userPrompt));
        }

        if (imageBytes != null && imageBytes.length > 0) {
            String resolvedMime = (mimeType != null && !mimeType.isBlank()) ? mimeType : "image/jpeg";
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mimeType", resolvedMime);
            inlineData.put("data", base64Image);
            parts.add(Map.of("inlineData", inlineData));
        }

        Map<String, Object> contentNode = new HashMap<>();
        contentNode.put("parts", parts);
        requestBody.put("contents", List.of(contentNode));

        Map<String, Object> genConfig = new HashMap<>();
        genConfig.put("temperature", properties.getTemperature());
        genConfig.put("maxOutputTokens", properties.getMaxTokens());
        genConfig.put("responseMimeType", "application/json");
        requestBody.put("generationConfig", genConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            String jsonPayload = objectMapper.writeValueAsString(requestBody);
            HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            if (response.getBody() == null) {
                return "{}";
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode textNode = root.at("/candidates/0/content/parts/0/text");
            if (!textNode.isMissingNode()) {
                return textNode.asText();
            }
            return response.getBody();
        } catch (Exception ex) {
            log.error("Gemini API call failed: {}", ex.getMessage());
            throw new RuntimeException("Gemini generation failed: " + ex.getMessage(), ex);
        }
    }
}
