package com.lostfound.dto.ai;

import jakarta.validation.constraints.NotBlank;

public class NaturalLanguageReportRequest {

    @NotBlank(message = "Report description text cannot be blank")
    private String text;

    private String preferredType; // "LOST" or "FOUND" (optional hint)

    public NaturalLanguageReportRequest() {
    }

    public NaturalLanguageReportRequest(String text) {
        this.text = text;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getPreferredType() {
        return preferredType;
    }

    public void setPreferredType(String preferredType) {
        this.preferredType = preferredType;
    }
}
