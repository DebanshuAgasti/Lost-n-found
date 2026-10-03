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
public class OpenAiLlmClient implements LlmClient {

    private static final Logger log = LoggerFactory.getLogger(OpenAiLlmClient.class);
    private static final String DEFAULT_BASE_URL = "https://api.openai.com/v1";

    private final LlmProperties properties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OpenAiLlmClient(LlmProperties properties) {
        this.properties = properties;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public String getProviderName() {
        return "openai";
    }

    @Override
    public boolean isAvailable() {
        return properties.getApiKey() != null && !properties.getApiKey().trim().isEmpty();
    }

    @Override
    public String generateText(String systemPrompt, String userPrompt) {
        return executeOpenAiRequest(systemPrompt, userPrompt, null, null);
    }

    @Override
    public String generateMultimodal(String systemPrompt, String userPrompt, byte[] imageBytes, String mimeType) {
        return executeOpenAiRequest(systemPrompt, userPrompt, imageBytes, mimeType);
    }

    private String executeOpenAiRequest(String systemPrompt, String userPrompt, byte[] imageBytes, String mimeType) {
        if (!isAvailable()) {
            throw new IllegalStateException("OpenAI API key is not configured");
        }

        String baseUrl = (properties.getBaseUrl() != null && !properties.getBaseUrl().isBlank())
                ? properties.getBaseUrl().replaceAll("/+$", "")
                : DEFAULT_BASE_URL;

        String model = properties.getModel() != null && !properties.getModel().isBlank()
                ? properties.getModel()
                : "gpt-4o-mini";

        String url = baseUrl + "/chat/completions";

        List<Map<String, Object>> messages = new ArrayList<>();
        if (systemPrompt != null && !systemPrompt.isBlank()) {
            messages.add(Map.of("role", "system", "content", systemPrompt));
        }

        if (imageBytes != null && imageBytes.length > 0) {
            String resolvedMime = (mimeType != null && !mimeType.isBlank()) ? mimeType : "image/jpeg";
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            String dataUrl = "data:" + resolvedMime + ";base64," + base64Image;

            List<Map<String, Object>> userContent = List.of(
                    Map.of("type", "text", "text", userPrompt != null ? userPrompt : ""),
                    Map.of("type", "image_url", "image_url", Map.of("url", dataUrl))
            );
            messages.add(Map.of("role", "user", "content", userContent));
        } else {
            messages.add(Map.of("role", "user", "content", userPrompt != null ? userPrompt : ""));
        }

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", messages);
        requestBody.put("temperature", properties.getTemperature());
        requestBody.put("max_tokens", properties.getMaxTokens());
        requestBody.put("response_format", Map.of("type", "json_object"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(properties.getApiKey().trim());

        try {
            String jsonPayload = objectMapper.writeValueAsString(requestBody);
            HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            if (response.getBody() == null) {
                return "{}";
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode textNode = root.at("/choices/0/message/content");
            if (!textNode.isMissingNode()) {
                return textNode.asText();
            }
            return response.getBody();
        } catch (Exception ex) {
            log.error("OpenAI API call failed: {}", ex.getMessage());
            throw new RuntimeException("OpenAI generation failed: " + ex.getMessage(), ex);
        }
    }
}
