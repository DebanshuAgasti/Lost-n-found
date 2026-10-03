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
public class OllamaLlmClient implements LlmClient {

    private static final Logger log = LoggerFactory.getLogger(OllamaLlmClient.class);
    private static final String DEFAULT_BASE_URL = "http://localhost:11434";

    private final LlmProperties properties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OllamaLlmClient(LlmProperties properties) {
        this.properties = properties;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public String getProviderName() {
        return "ollama";
    }

    @Override
    public boolean isAvailable() {
        return true; // Local service attempt
    }

    @Override
    public String generateText(String systemPrompt, String userPrompt) {
        return executeOllamaRequest(systemPrompt, userPrompt, null);
    }

    @Override
    public String generateMultimodal(String systemPrompt, String userPrompt, byte[] imageBytes, String mimeType) {
        return executeOllamaRequest(systemPrompt, userPrompt, imageBytes);
    }

    private String executeOllamaRequest(String systemPrompt, String userPrompt, byte[] imageBytes) {
        String baseUrl = (properties.getBaseUrl() != null && !properties.getBaseUrl().isBlank())
                ? properties.getBaseUrl().replaceAll("/+$", "")
                : DEFAULT_BASE_URL;

        String model = properties.getModel() != null && !properties.getModel().isBlank()
                ? properties.getModel()
                : "llama3";

        String url = baseUrl + "/api/chat";

        List<Map<String, Object>> messages = new ArrayList<>();
        if (systemPrompt != null && !systemPrompt.isBlank()) {
            messages.add(Map.of("role", "system", "content", systemPrompt));
        }

        Map<String, Object> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userPrompt != null ? userPrompt : "");
        if (imageBytes != null && imageBytes.length > 0) {
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            userMsg.put("images", List.of(base64Image));
        }
        messages.add(userMsg);

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", messages);
        requestBody.put("stream", false);
        requestBody.put("format", "json");
        requestBody.put("options", Map.of("temperature", properties.getTemperature()));

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
            JsonNode textNode = root.at("/message/content");
            if (!textNode.isMissingNode()) {
                return textNode.asText();
            }
            return response.getBody();
        } catch (Exception ex) {
            log.error("Ollama API call failed: {}", ex.getMessage());
            throw new RuntimeException("Ollama generation failed: " + ex.getMessage(), ex);
        }
    }
}
