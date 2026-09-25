package com.lostfound.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "lostfound.jwt")
public class JwtProperties {

    // Default 256-bit HMAC secret key for local development
    private String secret = "lost-and-found-super-secure-secret-key-that-is-at-least-256-bits-long-for-jwt-signing!";
    private long expirationMs = 86400000L; // 24 hours

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    public void setExpirationMs(long expirationMs) {
        this.expirationMs = expirationMs;
    }
}
