package com.lostfound.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Random;

@Service
public class ImageEmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(ImageEmbeddingService.class);
    public static final int EMBEDDING_DIMENSION = 512;

    @Value("${lostfound.embedding.mode:local}")
    private String embeddingMode;

    @Value("${lostfound.embedding.remote-url:}")
    private String remoteUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Generates a 512-dimensional normalized unit vector representing the image.
     */
    public float[] generateEmbedding(byte[] imageBytes, String mimeType) {
        if (imageBytes == null || imageBytes.length == 0) {
            return new float[0];
        }

        if ("remote".equalsIgnoreCase(embeddingMode) && remoteUrl != null && !remoteUrl.trim().isEmpty()) {
            try {
                return callRemoteEmbeddingService(imageBytes, mimeType);
            } catch (Exception ex) {
                log.warn("Remote embedding service failed at {}, falling back to local deterministic generator: {}", remoteUrl, ex.getMessage());
            }
        }

        return generateLocalFeatureVector(imageBytes);
    }

    private float[] callRemoteEmbeddingService(byte[] imageBytes, String mimeType) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(mimeType != null ? mimeType : MediaType.APPLICATION_OCTET_STREAM_VALUE));
        HttpEntity<byte[]> requestEntity = new HttpEntity<>(imageBytes, headers);

        float[] response = restTemplate.postForObject(remoteUrl, requestEntity, float[].class);
        if (response != null && response.length > 0) {
            return normalize(response);
        }
        return generateLocalFeatureVector(imageBytes);
    }

    /**
     * Generates a deterministic normalized feature vector from the image bytes.
     * Samples byte content, chunk variations, and SHA-256 seed to construct
     * a stable, high-entropy 512-dim embedding suitable for local development and testing.
     */
    private float[] generateLocalFeatureVector(byte[] imageBytes) {
        float[] vector = new float[EMBEDDING_DIMENSION];

        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(imageBytes);
            long seed = 0;
            for (int i = 0; i < Math.min(8, hash.length); i++) {
                seed = (seed << 8) | (hash[i] & 0xFF);
            }

            Random random = new Random(seed);
            int chunkSize = Math.max(1, imageBytes.length / EMBEDDING_DIMENSION);

            for (int i = 0; i < EMBEDDING_DIMENSION; i++) {
                int start = Math.min(i * chunkSize, imageBytes.length - 1);
                int byteVal = imageBytes[start] & 0xFF;
                double gaussian = random.nextGaussian();
                vector[i] = (float) (gaussian + (byteVal / 255.0f));
            }
        } catch (NoSuchAlgorithmException e) {
            Random random = new Random(imageBytes.length);
            for (int i = 0; i < EMBEDDING_DIMENSION; i++) {
                vector[i] = (float) random.nextGaussian();
            }
        }

        return normalize(vector);
    }

    private float[] normalize(float[] vector) {
        double sumSquares = 0.0;
        for (float v : vector) {
            sumSquares += v * v;
        }
        double norm = Math.sqrt(sumSquares);
        if (norm > 0) {
            for (int i = 0; i < vector.length; i++) {
                vector[i] = (float) (vector[i] / norm);
            }
        }
        return vector;
    }
}
