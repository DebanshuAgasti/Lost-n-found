package com.lostfound.service.llm;

public interface LlmClient {

    /**
     * Provider identifier, e.g. "gemini", "openai", "ollama", "mock".
     */
    String getProviderName();

    /**
     * Generate text completion using system prompt and user prompt.
     */
    String generateText(String systemPrompt, String userPrompt);

    /**
     * Generate multimodal completion using system prompt, user prompt, and image bytes.
     */
    String generateMultimodal(String systemPrompt, String userPrompt, byte[] imageBytes, String mimeType);

    /**
     * True if client credentials/connection are valid.
     */
    boolean isAvailable();
}
