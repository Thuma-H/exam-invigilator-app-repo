package com.examapp.controller;

import com.examapp.model.Student;
import com.examapp.repository.StudentRepository;
import com.examapp.service.BarcodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * BarcodeController - REST API endpoints for barcode generation and retrieval
 * Base URL: /api/barcode
 */
@RestController
@RequestMapping("/api/barcode")
@CrossOrigin(origins = "*")
public class BarcodeController {

    @Autowired
    private BarcodeService barcodeService;

    @Autowired
    private StudentRepository studentRepository;

    /**
     * Generate barcode for a specific student
     * GET /api/barcode/generate/{studentId}
     *
     * @param studentId The student ID (e.g., BCS25165336)
     * @return PNG barcode image
     */
    @GetMapping("/generate/{studentId}")
    public ResponseEntity<?> generateBarcode(@PathVariable String studentId) {
        try {
            // Check if student exists
            Student student = studentRepository.findByStudentId(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

            // Generate barcode
            byte[] barcodeBytes = barcodeService.generateBarcodeBytes(studentId);

            // Return image
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setContentDispositionFormData("inline", studentId + ".png");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .body(barcodeBytes);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to generate barcode");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get existing barcode for a student
     * GET /api/barcode/{studentId}
     *
     * @param studentId The student ID
     * @return PNG barcode image or 404 if not found
     */
    @GetMapping("/{studentId}")
    public ResponseEntity<?> getBarcode(@PathVariable String studentId) {
        try {
            Path barcodePath = barcodeService.getBarcodeFile(studentId);

            if (barcodePath == null) {
                // Barcode doesn't exist, generate it
                byte[] barcodeBytes = barcodeService.generateBarcodeBytes(studentId);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.IMAGE_PNG);
                return ResponseEntity.ok().headers(headers).body(barcodeBytes);
            }

            // Return existing barcode
            byte[] barcodeBytes = Files.readAllBytes(barcodePath);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);

            return ResponseEntity.ok().headers(headers).body(barcodeBytes);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to retrieve barcode");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Generate barcodes for all students
     * POST /api/barcode/generate-all
     *
     * @return Summary of generation results
     */
    @PostMapping("/generate-all")
    public ResponseEntity<?> generateAllBarcodes() {
        try {
            List<Student> students = studentRepository.findAll();
            String[] studentIds = students.stream()
                    .map(Student::getStudentId)
                    .toArray(String[]::new);

            int successCount = barcodeService.generateBulkBarcodes(studentIds);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("total", students.size());
            response.put("generated", successCount);
            response.put("message", "Generated " + successCount + " barcodes");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to generate barcodes");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Check if barcode exists for a student
     * GET /api/barcode/check/{studentId}
     *
     * @param studentId The student ID
     * @return JSON with exists status
     */
    @GetMapping("/check/{studentId}")
    public ResponseEntity<?> checkBarcode(@PathVariable String studentId) {
        boolean exists = barcodeService.barcodeExists(studentId);

        Map<String, Object> response = new HashMap<>();
        response.put("studentId", studentId);
        response.put("exists", exists);

        return ResponseEntity.ok(response);
    }

    /**
     * Download barcode as file
     * GET /api/barcode/download/{studentId}
     *
     * @param studentId The student ID
     * @return PNG file download
     */
    @GetMapping("/download/{studentId}")
    public ResponseEntity<?> downloadBarcode(@PathVariable String studentId) {
        try {
            byte[] barcodeBytes = barcodeService.generateBarcodeBytes(studentId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setContentDispositionFormData("attachment", studentId + "_barcode.png");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .body(barcodeBytes);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to download barcode");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}