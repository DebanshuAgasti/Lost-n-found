package com.lostfound.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lostfound.dto.auth.RegisterRequest;
import com.lostfound.dto.claim.ClaimRequest;
import com.lostfound.dto.claim.ClaimReviewRequest;
import com.lostfound.dto.item.FoundItemRequest;
import com.lostfound.model.enums.ClaimStatus;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ClaimControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String finderToken;
    private String claimantToken;
    private Long foundItemId;

    @BeforeEach
    void setUp() throws Exception {
        long timestamp = System.currentTimeMillis();

        // Register Finder
        RegisterRequest finderReq = new RegisterRequest(
                "finder" + timestamp + "@example.com",
                "password123",
                "Desk Custodian",
                "+1-555-111-2222"
        );
        MvcResult finderRes = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(finderReq)))
                .andExpect(status().isCreated())
                .andReturn();
        finderToken = objectMapper.readTree(finderRes.getResponse().getContentAsString()).path("data").path("token").asText();

        // Register Claimant
        RegisterRequest claimantReq = new RegisterRequest(
                "claimant" + timestamp + "@example.com",
                "password123",
                "Alex Claimant",
                "+1-555-333-4444"
        );
        MvcResult claimantRes = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(claimantReq)))
                .andExpect(status().isCreated())
                .andReturn();
        claimantToken = objectMapper.readTree(claimantRes.getResponse().getContentAsString()).path("data").path("token").asText();

        // Finder creates found item
        FoundItemRequest foundReq = new FoundItemRequest();
        foundReq.setTitle("Found Apple AirPods Pro 2");
        foundReq.setDescription("Found near fitness lockers");
        foundReq.setCategory(ItemCategory.ELECTRONICS);
        foundReq.setFoundDate(LocalDate.now());
        foundReq.setCity("Chicago");
        foundReq.setLocationName("Fitness Center");
        foundReq.setStorageLocation("Desk Drawer #2");
        foundReq.setCurrentCustodian("Desk Custodian");
        foundReq.setVerificationQuestion("What name is engraved on the charging case?");

        MvcResult foundRes = mockMvc.perform(post("/api/found-items")
                        .header("Authorization", "Bearer " + finderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(foundReq)))
                .andExpect(status().isCreated())
                .andReturn();
        foundItemId = objectMapper.readTree(foundRes.getResponse().getContentAsString()).path("data").path("id").asLong();
    }

    @Test
    void testClaimFlowSubmitQueryAndReview() throws Exception {
        // 1. Claimant submits claim
        ClaimRequest claimReq = new ClaimRequest();
        claimReq.setFoundItemId(foundItemId);
        claimReq.setVerificationAnswers("The engraved name is 'Alex M.' and has a blue silicone lanyard");
        claimReq.setProofDescription("I have the original Apple receipt and box serial number");

        MvcResult claimRes = mockMvc.perform(post("/api/claims")
                        .header("Authorization", "Bearer " + claimantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(claimReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("SUBMITTED"))
                .andReturn();

        long claimId = objectMapper.readTree(claimRes.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 2. Claimant queries my claims
        mockMvc.perform(get("/api/claims/my")
                        .header("Authorization", "Bearer " + claimantToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].id").value(claimId));

        // 3. Finder/Custodian reviews and approves claim
        ClaimReviewRequest reviewReq = new ClaimReviewRequest(
                ClaimStatus.APPROVED,
                "Engraving and receipt verified in person. Item released."
        );

        mockMvc.perform(patch("/api/claims/" + claimId + "/review")
                        .header("Authorization", "Bearer " + finderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("APPROVED"));
    }
}
