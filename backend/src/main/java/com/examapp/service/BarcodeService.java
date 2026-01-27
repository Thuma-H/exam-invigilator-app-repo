package com.examapp.service;

import com.examapp.model.BarcodeScan;
import com.examapp.model.Exam;
import com.examapp.model.Student;
import com.examapp.repository.BarcodeScanRepository;
import com.examapp.repository.ExamRepository;
import com.examapp.repository.StudentRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.oned.Code128Writer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * BarcodeService - Generates and validates barcodes for student IDs
 *
 * SECURITY ARCHITECTURE:
 * 1. Barcode contains ONLY student ID (e.g., "BCS25165336")
 * 2. When scanned, student data is fetched from database
 * 3. All scan attempts are logged for audit trail
 * 4. Rate limiting: Max 100 scans per minute per invigilator
 * 5. Validation: Student must exist AND be enrolled in exam
 */
@Service
public class BarcodeService {

    private static final String BARCODE_DIR = "barcodes/";
    private static final int BARCODE_WIDTH = 300;
    private static final int BARCODE_HEIGHT = 100;
    private static final int MAX_SCANS_PER_MINUTE = 100;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private BarcodeScanRepository barcodeScanRepository;

    public BarcodeService() {
        // Create barcodes directory if it doesn't exist
        try {
            Path path = Paths.get(BARCODE_DIR);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
                System.out.println("✅ Barcode directory created: " + BARCODE_DIR);
            }
        } catch (IOException e) {
            System.err.println("❌ Error creating barcode directory: " + e.getMessage());
        }
    }

    /**
     * Generate a barcode for a student ID and save it to disk
     * @param studentId The student ID (e.g., BCS25165336)
     * @return Path to the saved barcode image
     */
    public String generateBarcode(String studentId) throws WriterException, IOException {
        // Configure barcode encoding
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.MARGIN, 1);

        // Generate barcode matrix
        Code128Writer writer = new Code128Writer();
        BitMatrix bitMatrix = writer.encode(
                studentId,
                BarcodeFormat.CODE_128,
                BARCODE_WIDTH,
                BARCODE_HEIGHT,
                hints
        );

        // Convert to image
        BufferedImage barcodeImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

        // Save to file
        String filename = studentId + ".png";
        Path filePath = Paths.get(BARCODE_DIR + filename);
        ImageIO.write(barcodeImage, "PNG", filePath.toFile());

        System.out.println("✅ Barcode generated: " + filePath);
        return filePath.toString();
    }

    /**
     * Generate barcode as byte array (for API responses)
     * @param studentId The student ID
     * @return PNG image as byte array
     */
    public byte[] generateBarcodeBytes(String studentId) throws WriterException, IOException {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.MARGIN, 1);

        Code128Writer writer = new Code128Writer();
        BitMatrix bitMatrix = writer.encode(
                studentId,
                BarcodeFormat.CODE_128,
                BARCODE_WIDTH,
                BARCODE_HEIGHT,
                hints
        );

        BufferedImage barcodeImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

        // Convert to byte array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(barcodeImage, "PNG", baos);
        return baos.toByteArray();
    }

    /**
     * Get existing barcode file path
     * @param studentId The student ID
     * @return Path to barcode file or null if not found
     */
    public Path getBarcodeFile(String studentId) {
        Path filePath = Paths.get(BARCODE_DIR + studentId + ".png");
        return Files.exists(filePath) ? filePath : null;
    }

    /**
     * Check if barcode exists for a student
     * @param studentId The student ID
     * @return true if barcode exists
     */
    public boolean barcodeExists(String studentId) {
        return Files.exists(Paths.get(BARCODE_DIR + studentId + ".png"));
    }

    /**
     * Generate barcodes for multiple students
     * @param studentIds Array of student IDs
     * @return Number of barcodes successfully generated
     */
    public int generateBulkBarcodes(String[] studentIds) {
        int successCount = 0;
        for (String studentId : studentIds) {
            try {
                if (!barcodeExists(studentId)) {
                    generateBarcode(studentId);
                    successCount++;
                }
            } catch (Exception e) {
                System.err.println("❌ Failed to generate barcode for " + studentId + ": " + e.getMessage());
            }
        }
        return successCount;
    }

    /**
     * Validate a scanned barcode and return student data
     *
     * Security Checks:
     * 1. Rate limiting - prevent scan flooding
     * 2. Student exists in database
     * 3. Student is enrolled in the exam
     * 4. Log all attempts (success or failure)
     *
     * @param scannedBarcode - the barcode value (student ID)
     * @param examId - the exam being scanned for
     * @param scannedBy - username of invigilator
     * @return Validation result with student data or error
     */
    public BarcodeValidationResult validateBarcodeScan(String scannedBarcode, Long examId, String scannedBy) {
        BarcodeValidationResult result = new BarcodeValidationResult();
        result.setScannedBarcode(scannedBarcode);
        result.setTimestamp(LocalDateTime.now());

        // 1. RATE LIMITING CHECK
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        long recentScans = barcodeScanRepository.countRecentScansByUser(scannedBy, oneMinuteAgo);

        if (recentScans >= MAX_SCANS_PER_MINUTE) {
            result.setValid(false);
            result.setErrorMessage("Rate limit exceeded. Maximum " + MAX_SCANS_PER_MINUTE + " scans per minute.");
            logBarcodeScan(scannedBarcode, null, examId, scannedBy, "RATE_LIMITED", result.getErrorMessage());
            return result;
        }

        // 2. CHECK IF STUDENT EXISTS IN DATABASE
        Optional<Student> studentOpt = studentRepository.findByStudentId(scannedBarcode);
        if (studentOpt.isEmpty()) {
            result.setValid(false);
            result.setErrorMessage("Student not found: " + scannedBarcode);
            logBarcodeScan(scannedBarcode, null, examId, scannedBy, "STUDENT_NOT_FOUND", result.getErrorMessage());
            return result;
        }

        Student student = studentOpt.get();

        // 3. CHECK IF STUDENT IS ENROLLED IN THIS EXAM
        Optional<Exam> examOpt = examRepository.findById(examId);
        if (examOpt.isEmpty()) {
            result.setValid(false);
            result.setErrorMessage("Exam not found");
            logBarcodeScan(scannedBarcode, student, examId, scannedBy, "EXAM_NOT_FOUND", result.getErrorMessage());
            return result;
        }

        Exam exam = examOpt.get();
        boolean isEnrolled = exam.getStudents().stream()
                .anyMatch(s -> s.getStudentId().equals(scannedBarcode));

        if (!isEnrolled) {
            result.setValid(false);
            result.setErrorMessage("Student " + student.getFullName() + " is not enrolled in this exam");
            logBarcodeScan(scannedBarcode, student, examId, scannedBy, "NOT_ENROLLED", result.getErrorMessage());
            return result;
        }

        // 4. ALL CHECKS PASSED - VALIDATION SUCCESS
        result.setValid(true);
        result.setStudent(student);
        result.setExam(exam);
        logBarcodeScan(scannedBarcode, student, examId, scannedBy, "SUCCESS", null);

        return result;
    }

    /**
     * Log barcode scan attempt to database (audit trail)
     */
    private void logBarcodeScan(String scannedBarcode, Student student, Long examId,
                                String scannedBy, String status, String errorMessage) {
        BarcodeScan scanLog = new BarcodeScan();
        scanLog.setScannedBarcode(scannedBarcode);
        scanLog.setStudent(student);
        scanLog.setScannedBy(scannedBy);
        scanLog.setValidationStatus(status);
        scanLog.setErrorMessage(errorMessage);

        if (examId != null) {
            examRepository.findById(examId).ifPresent(scanLog::setExam);
        }

        barcodeScanRepository.save(scanLog);
    }

    /**
     * Get scan history for security monitoring
     */
    public Map<String, Object> getScanStatistics(String username) {
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        long totalScans = barcodeScanRepository.countRecentScansByUser(username, last24Hours);

        Map<String, Object> stats = new HashMap<>();
        stats.put("username", username);
        stats.put("totalScans24h", totalScans);
        stats.put("scansPerMinuteLimit", MAX_SCANS_PER_MINUTE);

        return stats;
    }

    /**
     * Inner class for barcode validation results
     */
    public static class BarcodeValidationResult {
        private String scannedBarcode;
        private boolean valid;
        private Student student;
        private Exam exam;
        private String errorMessage;
        private LocalDateTime timestamp;

        // Getters and setters
        public String getScannedBarcode() { return scannedBarcode; }
        public void setScannedBarcode(String scannedBarcode) { this.scannedBarcode = scannedBarcode; }

        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }

        public Student getStudent() { return student; }
        public void setStudent(Student student) { this.student = student; }

        public Exam getExam() { return exam; }
        public void setExam(Exam exam) { this.exam = exam; }

        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }
}

