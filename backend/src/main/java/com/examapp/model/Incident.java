package com.examapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Incident entity records examination incidents/irregularities.
 * Stores details like cheating cases, health emergencies, or disruptions.
 */
@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student; // Optional: null if incident not student-specific

    @Column(nullable = false)
    private String category; // "CHEATING", "HEALTH_EMERGENCY", "DISRUPTION", "OTHER"

    @Column(nullable = false)
    private String severity; // "LOW", "MEDIUM", "HIGH"

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(name = "reported_at", nullable = false)
    private LocalDateTime reportedAt;

    @Column(name = "reported_by", nullable = false)
    private String reportedBy; // Username of invigilator who reported

    @Column(name = "evidence_file")
    private String evidenceFile; // Path to uploaded file (if any)

    // Constructors
    public Incident() {}

    public Incident(Exam exam, Student student, String category, String severity,
                    String description, LocalDateTime reportedAt, String reportedBy) {
        this.exam = exam;
        this.student = student;
        this.category = category;
        this.severity = severity;
        this.description = description;
        this.reportedAt = reportedAt;
        this.reportedBy = reportedBy;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Exam getExam() {
        return exam;
    }

    public void setExam(Exam exam) {
        this.exam = exam;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
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

    public LocalDateTime getReportedAt() {
        return reportedAt;
    }

    public void setReportedAt(LocalDateTime reportedAt) {
        this.reportedAt = reportedAt;
    }

    public String getReportedBy() {
        return reportedBy;
    }

    public void setReportedBy(String reportedBy) {
        this.reportedBy = reportedBy;
    }

    public String getEvidenceFile() {
        return evidenceFile;
    }

    public void setEvidenceFile(String evidenceFile) {
        this.evidenceFile = evidenceFile;
    }
}