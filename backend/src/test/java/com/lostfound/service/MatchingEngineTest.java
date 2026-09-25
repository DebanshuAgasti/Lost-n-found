package com.lostfound.service;

import com.lostfound.config.MatchingEngineProperties;
import com.lostfound.ml.MatchingEngine;
import com.lostfound.ml.VectorSimilarityCalculator;
import com.lostfound.ml.scorers.*;
import com.lostfound.model.entity.*;
import com.lostfound.model.enums.ItemCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MatchingEngineTest {

    private MatchingEngine matchingEngine;
    private MatchingEngineProperties properties;

    @BeforeEach
    void setUp() {
        properties = new MatchingEngineProperties();
        VectorSimilarityCalculator vectorCalc = new VectorSimilarityCalculator();
        ImageSimilarityScorer imageScorer = new ImageSimilarityScorer(vectorCalc);
        CategoryScorer categoryScorer = new CategoryScorer();
        AttributeScorer attributeScorer = new AttributeScorer();
        TextSimilarityScorer textScorer = new TextSimilarityScorer();
        GeoProximityScorer geoScorer = new GeoProximityScorer(properties);
        TemporalProximityScorer temporalScorer = new TemporalProximityScorer();

        matchingEngine = new MatchingEngine(
                properties,
                imageScorer,
                categoryScorer,
                attributeScorer,
                textScorer,
                geoScorer,
                temporalScorer
        );
    }

    @Test
    void testMatchingPhoneYieldsHighScore() {
        LostItem lost = new LostItem();
        lost.setTitle("Black iPhone 15 Pro");
        lost.setDescription("Lost near campus library with blue silicone case");
        lost.setCategory(ItemCategory.ELECTRONICS);
        lost.setLostDate(LocalDate.now().minusDays(1));
        lost.setCity("Seattle");
        lost.setLatitude(47.6553);
        lost.setLongitude(-122.3035);

        ItemAttributes lostAttr = new ItemAttributes();
        lostAttr.setBrand("Apple");
        lostAttr.setModel("iPhone 15 Pro");
        lostAttr.setPrimaryColor("Black");
        lostAttr.setStickersOrAccessories("NASA sticker");
        lost.setAttributes(lostAttr);

        // Found item
        FoundItem found = new FoundItem();
        found.setTitle("Found Apple smartphone");
        found.setDescription("Discovered on study table in campus library");
        found.setCategory(ItemCategory.ELECTRONICS);
        found.setFoundDate(LocalDate.now());
        found.setCity("Seattle");
        found.setLatitude(47.6554);
        found.setLongitude(-122.3034);

        ItemAttributes foundAttr = new ItemAttributes();
        foundAttr.setBrand("Apple");
        foundAttr.setModel("iPhone");
        foundAttr.setPrimaryColor("Black");
        foundAttr.setStickersOrAccessories("NASA sticker on case");
        found.setAttributes(foundAttr);

        MatchingEngine.MatchResult result = matchingEngine.evaluate(lost, found);

        assertTrue(result.overallScore() >= 0.70, "Matching items must produce score >= 0.70, got: " + result.overallScore());
        assertEquals(1.0, result.categoryScore(), 0.001);
        assertTrue(result.attributesScore() > 0.8, "Attributes should match strongly");
        assertTrue(result.locationScore() > 0.9, "Location proximity should be very high");
        assertTrue(result.temporalScore() > 0.9, "Temporal proximity should be high");
    }

    @Test
    void testIncompatibleCategoriesYieldZeroScore() {
        LostItem lost = new LostItem();
        lost.setTitle("Golden Retriever dog");
        lost.setCategory(ItemCategory.PETS);
        lost.setLostDate(LocalDate.now());

        FoundItem found = new FoundItem();
        found.setTitle("Found Laptop Charger");
        found.setCategory(ItemCategory.ELECTRONICS);
        found.setFoundDate(LocalDate.now());

        MatchingEngine.MatchResult result = matchingEngine.evaluate(lost, found);

        assertEquals(0.0, result.overallScore(), "Incompatible categories must yield 0.0 overall score");
        assertEquals(0.0, result.categoryScore());
    }

    @Test
    void testPoorImageOrNoImageGracefullyRebalancesWeights() {
        LostItem lost = new LostItem();
        lost.setTitle("Silver Macbook Pro");
        lost.setDescription("14 inch laptop with sticker");
        lost.setCategory(ItemCategory.ELECTRONICS);
        lost.setLostDate(LocalDate.now().minusDays(1));
        lost.setCity("Boston");

        ItemAttributes lostAttr = new ItemAttributes();
        lostAttr.setBrand("Apple");
        lostAttr.setModel("Macbook Pro 14");
        lostAttr.setPrimaryColor("Silver");
        lost.setAttributes(lostAttr);

        FoundItem found = new FoundItem();
        found.setTitle("Macbook Pro laptop");
        found.setDescription("Found in lecture room");
        found.setCategory(ItemCategory.ELECTRONICS);
        found.setFoundDate(LocalDate.now());
        found.setCity("Boston");

        ItemAttributes foundAttr = new ItemAttributes();
        foundAttr.setBrand("Apple");
        foundAttr.setModel("Macbook Pro");
        foundAttr.setPrimaryColor("Silver");
        found.setAttributes(foundAttr);

        // Neither item has images:
        MatchingEngine.MatchResult result = matchingEngine.evaluate(lost, found);

        assertNull(result.visualScore(), "Visual score must be null when no images are present");
        assertTrue(result.overallScore() >= 0.70, "Even without images, strong metadata match should yield high score: " + result.overallScore());
    }
}
