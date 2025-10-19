package com.examapp.dto;

/**
 * IncidentRequest DTO - data sent when reporting an exam incident.
 * Contains incident details, student involved (optional), and severity.
 */
public class IncidentRequest {

    private Long examId;
    private Long studentId; // Can be null if incident is general (not student-specific)
    private String category; // "CHEATING", "HEALTH_EMERGENCY", "DISRUPTION", "OTHER"
    private String severity; // "LOW", "MEDIUM", "HIGH"
    private String description;

    // Constructors
    public IncidentRequest() {}

    public IncidentRequest(Long examId, Long studentId, String category,
                           String severity, String description) {
        this.examId = examId;
        this.studentId = studentId;
        this.category = category;
        this.severity = severity;
        this.description = description;
    }

    // Getters and Setters
    public Long getExamId() {
        return examId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}