package com.examapp.dto;

/**
 * StudentIdCardDTO - Data Transfer Object for student ID card printing
 * Contains all information needed to print a complete ID card with barcode
 */
public class StudentIdCardDTO {
    private Long id;
    private String studentId;    // e.g., "BCS25165336"
    private String fullName;
    private String program;
    private String barcodeBase64; // Base64 encoded PNG image of barcode

    // Constructors
    public StudentIdCardDTO() {}

    public StudentIdCardDTO(Long id, String studentId, String fullName, String program, String barcodeBase64) {
        this.id = id;
        this.studentId = studentId;
        this.fullName = fullName;
        this.program = program;
        this.barcodeBase64 = barcodeBase64;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getProgram() {
        return program;
    }

    public void setProgram(String program) {
        this.program = program;
    }

    public String getBarcodeBase64() {
        return barcodeBase64;
    }

    public void setBarcodeBase64(String barcodeBase64) {
        this.barcodeBase64 = barcodeBase64;
    }
}

