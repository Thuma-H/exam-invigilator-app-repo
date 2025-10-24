package com.examapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Attendance entity tracks student attendance for specific exams.
 * Records when and how attendance was marked (manual or scanned).
 */
@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private String status; // "PRESENT", "ABSENT", "LATE"

    @Column(name = "marked_at")
    private LocalDateTime markedAt; // When attendance was marked

    @Column(name = "marked_by")
    private String markedBy; // Username of invigilator who marked it

    @Column(name = "method")
    private String method; // "MANUAL" or "SCANNED"

    // Constructors
    public Attendance() {}

    public Attendance(Exam exam, Student student, String status,
                      LocalDateTime markedAt, String markedBy, String method) {
        this.exam = exam;
        this.student = student;
        this.status = status;
        this.markedAt = markedAt;
        this.markedBy = markedBy;
        this.method = method;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getMarkedAt() {
        return markedAt;
    }

    public void setMarkedAt(LocalDateTime markedAt) {
        this.markedAt = markedAt;
    }

    public String getMarkedBy() {
        return markedBy;
    }

    public void setMarkedBy(String markedBy) {
        this.markedBy = markedBy;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }
}