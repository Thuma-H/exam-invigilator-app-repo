package com.examapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * BarcodeScan - Audit log for all barcode scan attempts
 *
 * Security & Monitoring:
 * - Logs EVERY barcode scan attempt (success or failure)
 * - Tracks who scanned, when, and for which exam
 * - Helps detect fraudulent ID cards or scanning patterns
 * - Used for rate limiting and security analysis
 */
@Entity
@Table(name = "barcode_scans")
public class BarcodeScan {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "scanned_barcode", nullable = false)
    private String scannedBarcode; // The barcode value that was scanned

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = true) // Null if student not found
    private Student student;

    @ManyToOne
    @JoinColumn(name = "exam_id", nullable = true)
    private Exam exam;

    @Column(name = "scanned_by", nullable = false)
    private String scannedBy; // Username of invigilator

    @Column(name = "scan_timestamp", nullable = false)
    private LocalDateTime scanTimestamp;

    @Column(name = "validation_status", nullable = false)
    private String validationStatus; // SUCCESS, STUDENT_NOT_FOUND, NOT_ENROLLED, DUPLICATE, RATE_LIMITED

    @Column(name = "error_message")
    private String errorMessage; // Details if validation failed

    @Column(name = "ip_address")
    private String ipAddress; // IP address of scanner device

    // Constructors
    public BarcodeScan() {
        this.scanTimestamp = LocalDateTime.now();
    }

    public BarcodeScan(String scannedBarcode, Student student, Exam exam, String scannedBy,
                       String validationStatus, String errorMessage) {
        this.scannedBarcode = scannedBarcode;
        this.student = student;
        this.exam = exam;
        this.scannedBy = scannedBy;
        this.validationStatus = validationStatus;
        this.errorMessage = errorMessage;
        this.scanTimestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getScannedBarcode() {
        return scannedBarcode;
    }

    public void setScannedBarcode(String scannedBarcode) {
        this.scannedBarcode = scannedBarcode;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Exam getExam() {
        return exam;
    }

    public void setExam(Exam exam) {
        this.exam = exam;
    }

    public String getScannedBy() {
        return scannedBy;
    }

    public void setScannedBy(String scannedBy) {
        this.scannedBy = scannedBy;
    }

    public LocalDateTime getScanTimestamp() {
        return scanTimestamp;
    }

    public void setScanTimestamp(LocalDateTime scanTimestamp) {
        this.scanTimestamp = scanTimestamp;
    }

    public String getValidationStatus() {
        return validationStatus;
    }

    public void setValidationStatus(String validationStatus) {
        this.validationStatus = validationStatus;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
}

