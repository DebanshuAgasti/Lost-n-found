package com.lostfound.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lostfound.dto.auth.RegisterRequest;
import com.lostfound.dto.item.FoundItemRequest;
import com.lostfound.model.enums.ItemCategory;
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
class FoundItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String finderToken;

    @BeforeEach
    void setUp() throws Exception {
        String testEmail = "finder" + System.currentTimeMillis() + "@example.com";
        RegisterRequest registerReq = new RegisterRequest(
                testEmail,
                "password123",
                "Campus Finder",
                "+1-555-444-3333"
        );

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        finderToken = objectMapper.readTree(responseBody).path("data").path("token").asText();
    }

    @Test
    void testCreateAndQueryFoundItem() throws Exception {
        FoundItemRequest request = new FoundItemRequest();
        request.setTitle("Found Sony WH-1000XM5 Headphones");
        request.setDescription("Found on table in Library study floor");
        request.setCategory(ItemCategory.ELECTRONICS);
        request.setFoundDate(LocalDate.now());
        request.setCity("Chicago");
        request.setLocationName("Campus Library");
        request.setStorageLocation("Safe Locker #4");
        request.setCurrentCustodian("Sarah Chen");
        request.setVerificationQuestion("What custom sticker is on the right earcup?");

        // 1. Create Found Item
        MvcResult createResult = mockMvc.perform(post("/api/found-items")
                        .header("Authorization", "Bearer " + finderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Found Sony WH-1000XM5 Headphones"))
                .andExpect(jsonPath("$.data.storageLocation").value("Safe Locker #4"))
                .andReturn();

        long foundId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 2. Query Public Listing without auth
        mockMvc.perform(get("/api/found-items/" + foundId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(foundId))
                .andExpect(jsonPath("$.data.currentCustodian").value("Sarah Chen"));

        // 3. Search public listings
        mockMvc.perform(get("/api/found-items")
                        .param("category", "ELECTRONICS")
                        .param("query", "Sony"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }
}
