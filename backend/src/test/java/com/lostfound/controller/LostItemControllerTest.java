package com.lostfound.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lostfound.dto.auth.RegisterRequest;
import com.lostfound.dto.item.LostItemRequest;
import com.lostfound.model.enums.ItemCategory;
import com.lostfound.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LostItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String userToken;

    @BeforeEach
    void setUp() throws Exception {
        String testEmail = "lostitemtester" + System.currentTimeMillis() + "@example.com";
        RegisterRequest registerReq = new RegisterRequest(
                testEmail,
                "password123",
                "Item Reporter",
                "+1-999-888-7777"
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
    void testCreateAndQueryLostItem() throws Exception {
        LostItemRequest request = new LostItemRequest();
        request.setTitle("Lost Black Ray-Ban Sunglasses");
        request.setDescription("Lost on bench near university plaza");
        request.setCategory(ItemCategory.CLOTHING_AND_ACCESSORIES);
        request.setLostDate(LocalDate.now());
        request.setCity("Chicago");

        // 1. Create item with JWT
        mockMvc.perform(post("/api/lost-items")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Lost Black Ray-Ban Sunglasses"))
                .andExpect(jsonPath("$.data.city").value("Chicago"));

        // 2. Query public search endpoint without authentication
        mockMvc.perform(get("/api/lost-items")
                        .param("keyword", "Ray-Ban")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content[0].title").value("Lost Black Ray-Ban Sunglasses"));
    }
}
