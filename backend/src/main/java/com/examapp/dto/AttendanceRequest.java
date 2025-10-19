package com.examapp.dto;

/**
 * AttendanceRequest DTO - data sent when marking student attendance.
 * Specifies exam, student, status, and marking method.
 */
public class AttendanceRequest {

    private Long examId;
    private Long studentId;
    private String status; // "PRESENT", "ABSENT", "LATE"
    private String method; // "MANUAL" or "SCANNED"

    // Constructors
    public AttendanceRequest() {}

    public AttendanceRequest(Long examId, Long studentId, String status, String method) {
        this.examId = examId;
        this.studentId = studentId;
        this.status = status;
        this.method = method;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }
}