package com.lostfound.ml;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Converts float[] embedding vectors to a comma-delimited string for relational persistence,
 * allowing portable storage across H2 and PostgreSQL while retaining vector mathematics.
 */
@Converter
public class EmbeddingVectorConverter implements AttributeConverter<float[], String> {

    private static final String DELIMITER = ",";

    @Override
    public String convertToDatabaseColumn(float[] attribute) {
        if (attribute == null || attribute.length == 0) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < attribute.length; i++) {
            if (i > 0) {
                sb.append(DELIMITER);
            }
            sb.append(attribute[i]);
        }
        return sb.toString();
    }

    @Override
    public float[] convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        String[] parts = dbData.split(DELIMITER);
        float[] vector = new float[parts.length];
        for (int i = 0; i < parts.length; i++) {
            vector[i] = Float.parseFloat(parts[i].trim());
        }
        return vector;
    }
}
