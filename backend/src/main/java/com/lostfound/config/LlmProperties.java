package com.lostfound.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "lostfound.llm")
public class LlmProperties {

    /**
     * Active provider: 'gemini', 'openai', 'ollama', or 'mock'.
     */
    private String provider = "mock";

    /**
     * API key for cloud providers (Gemini, OpenAI).
     */
    private String apiKey = "";

    /**
     * Target model name, e.g. 'gemini-1.5-flash', 'gpt-4o-mini', 'llama3'.
     */
    private String model = "gemini-1.5-flash";

    /**
     * Optional custom base URL (e.g. 'http://localhost:11434' for Ollama,
     * or custom proxy endpoint).
     */
    private String baseUrl = "";

    /**
     * Temperature for generation (0.0 to 1.0, lower means more deterministic).
     */
    private double temperature = 0.2;

    /**
     * Max output tokens for generation.
     */
    private int maxTokens = 1200;

    /**
     * Request timeout in milliseconds.
     */
    private int timeoutMs = 20000;

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public double getTemperature() {
        return temperature;
    }

    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }

    public int getMaxTokens() {
        return maxTokens;
    }

    public void setMaxTokens(int maxTokens) {
        this.maxTokens = maxTokens;
    }

    public int getTimeoutMs() {
        return timeoutMs;
    }

    public void setTimeoutMs(int timeoutMs) {
        this.timeoutMs = timeoutMs;
    }
}
