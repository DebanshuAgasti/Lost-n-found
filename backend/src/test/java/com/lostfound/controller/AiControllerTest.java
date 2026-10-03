package com.lostfound.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lostfound.dto.ai.NaturalLanguageReportRequest;
import com.lostfound.dto.auth.RegisterRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String userToken;

    @BeforeEach
    void setUp() throws Exception {
        String testEmail = "aitester" + System.currentTimeMillis() + "@example.com";
        RegisterRequest registerReq = new RegisterRequest(
                testEmail,
                "password123",
                "AI Tester",
                "+1-999-555-1234"
        );

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        userToken = objectMapper.readTree(responseBody).path("data").path("token").asText();
    }

    @Test
    void testParseNaturalLanguageReport() throws Exception {
        NaturalLanguageReportRequest request = new NaturalLanguageReportRequest(
                "I lost my blue Apple iPhone 15 Pro with a clear case near the campus library yesterday."
        );

        mockMvc.perform(post("/api/ai/parse-report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.reportType").value("LOST"))
                .andExpect(jsonPath("$.data.category").value("ELECTRONICS"))
                .andExpect(jsonPath("$.data.attributes.brand").value("Apple"))
                .andExpect(jsonPath("$.data.attributes.primaryColor").value("Blue"))
                .andExpect(jsonPath("$.data.confidenceScore").isNumber());
    }

    @Test
    void testExtractAttributesFromImage() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "image",
                "test-phone.jpg",
                "image/jpeg",
                new byte[]{1, 2, 3, 4, 5, 6, 7, 8}
        );

        mockMvc.perform(multipart("/api/ai/extract-attributes")
                        .file(file)
                        .param("context", "Found black Samsung phone"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.category").isNotEmpty())
                .andExpect(jsonPath("$.data.confidenceScore").isNumber());
    }

    @Test
    void testExplainMatchSecurityAndValidation() throws Exception {
        // 1. Without auth -> 401 Unauthorized
        mockMvc.perform(get("/api/ai/explain-match/1"))
                .andExpect(status().isUnauthorized());

        // 2. With valid auth but non-existent match -> 404 Not Found (proves auth passes to service)
        mockMvc.perform(get("/api/ai/explain-match/999999")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void testVerifyClaimSecurityAndValidation() throws Exception {
        // 1. Without auth -> 401 Unauthorized
        mockMvc.perform(post("/api/ai/verify-claim/1"))
                .andExpect(status().isUnauthorized());

        // 2. With valid auth but non-existent claim -> 404 Not Found
        mockMvc.perform(post("/api/ai/verify-claim/999999")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isNotFound());
    }
}
