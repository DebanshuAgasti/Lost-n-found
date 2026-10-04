package com.lostfound.service.llm;

import com.lostfound.config.LlmProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class LlmClientRouterTest {

    private LlmProperties properties;
    private GeminiLlmClient geminiClient;
    private OpenAiLlmClient openAiClient;
    private OllamaLlmClient ollamaClient;
    private MockLlmClient mockClient;
    private LlmClientRouter router;

    @BeforeEach
    void setUp() {
        properties = new LlmProperties();
        geminiClient = Mockito.mock(GeminiLlmClient.class);
        openAiClient = Mockito.mock(OpenAiLlmClient.class);
        ollamaClient = Mockito.mock(OllamaLlmClient.class);
        mockClient = new MockLlmClient();

        router = new LlmClientRouter(properties, geminiClient, openAiClient, ollamaClient, mockClient);
    }

    @Test
    void testDefaultProviderFallsBackToMock() {
        properties.setProvider("mock");
        LlmClient client = router.getActiveClient();
        assertInstanceOf(MockLlmClient.class, client);
    }

    @Test
    void testUnknownProviderFallsBackToMock() {
        properties.setProvider("non-existent-provider");
        LlmClient client = router.getActiveClient();
        assertInstanceOf(MockLlmClient.class, client);
    }

    @Test
    void testGeminiUnavailableFallsBackToMock() {
        properties.setProvider("gemini");
        when(geminiClient.isAvailable()).thenReturn(false);

        LlmClient client = router.getActiveClient();
        assertInstanceOf(MockLlmClient.class, client);
    }

    @Test
    void testGeminiAvailableReturnsGemini() {
        properties.setProvider("gemini");
        when(geminiClient.isAvailable()).thenReturn(true);

        LlmClient client = router.getActiveClient();
        assertEquals(geminiClient, client);
    }

    @Test
    void testGenerateTextWithFallbackGracefullyRecoversOnError() {
        properties.setProvider("gemini");
        when(geminiClient.isAvailable()).thenReturn(true);
        when(geminiClient.generateText(Mockito.anyString(), Mockito.anyString()))
                .thenThrow(new RuntimeException("API quota exceeded"));

        String result = router.generateTextWithFallback("system prompt", "user prompt");
        assertNotNull(result);
        assertFalse(result.isBlank());
    }
}
