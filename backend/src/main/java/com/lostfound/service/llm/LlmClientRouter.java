package com.lostfound.service.llm;

import com.lostfound.config.LlmProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class LlmClientRouter {

    private static final Logger log = LoggerFactory.getLogger(LlmClientRouter.class);

    private final LlmProperties properties;
    private final GeminiLlmClient geminiClient;
    private final OpenAiLlmClient openAiClient;
    private final OllamaLlmClient ollamaClient;
    private final MockLlmClient mockClient;

    public LlmClientRouter(LlmProperties properties,
                           GeminiLlmClient geminiClient,
                           OpenAiLlmClient openAiClient,
                           OllamaLlmClient ollamaClient,
                           MockLlmClient mockClient) {
        this.properties = properties;
        this.geminiClient = geminiClient;
        this.openAiClient = openAiClient;
        this.ollamaClient = ollamaClient;
        this.mockClient = mockClient;
    }

    public LlmClient getActiveClient() {
        String provider = properties.getProvider() != null ? properties.getProvider().trim().toLowerCase() : "mock";

        switch (provider) {
            case "gemini":
                if (geminiClient.isAvailable()) {
                    return geminiClient;
                }
                log.warn("Gemini requested but API key is missing. Falling back to mock LLM.");
                return mockClient;

            case "openai":
                if (openAiClient.isAvailable()) {
                    return openAiClient;
                }
                log.warn("OpenAI requested but API key is missing. Falling back to mock LLM.");
                return mockClient;

            case "ollama":
                return ollamaClient;

            case "mock":
            default:
                return mockClient;
        }
    }

    public String generateTextWithFallback(String systemPrompt, String userPrompt) {
        LlmClient active = getActiveClient();
        try {
            return active.generateText(systemPrompt, userPrompt);
        } catch (Exception ex) {
            log.warn("Primary LLM provider [{}] failed: {}. Falling back to MockLlmClient.", active.getProviderName(), ex.getMessage());
            return mockClient.generateText(systemPrompt, userPrompt);
        }
    }

    public String generateMultimodalWithFallback(String systemPrompt, String userPrompt, byte[] imageBytes, String mimeType) {
        LlmClient active = getActiveClient();
        try {
            return active.generateMultimodal(systemPrompt, userPrompt, imageBytes, mimeType);
        } catch (Exception ex) {
            log.warn("Primary multimodal LLM provider [{}] failed: {}. Falling back to MockLlmClient.", active.getProviderName(), ex.getMessage());
            return mockClient.generateMultimodal(systemPrompt, userPrompt, imageBytes, mimeType);
        }
    }
}
