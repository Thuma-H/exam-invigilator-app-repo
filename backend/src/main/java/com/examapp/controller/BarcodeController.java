package com.examapp.controller;

import com.examapp.dto.StudentIdCardDTO;
import com.examapp.model.Student;
import com.examapp.repository.StudentRepository;
import com.examapp.service.BarcodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

/**
 * BarcodeController - REST API endpoints for barcode generation and validation
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

    /**
     * ⚠️ NEW ENDPOINT: Validate a scanned barcode
     * POST /api/barcode/validate
     *
     * Request Body:
     * {
     * "scannedBarcode": "BCS25165336",
     * "examId": 1
     * }
     *
     * Response (Success):
     * {
     * "valid": true,
     * "student": { ... student data ... },
     * "exam": { ... exam data ... },
     * "timestamp": "2025-01-26T10:30:00"
     * }
     *
     * Response (Failure):
     * {
     * "valid": false,
     * "errorMessage": "Student not enrolled in this exam",
     * "scannedBarcode": "BCS25165336",
     * "timestamp": "2025-01-26T10:30:00"
     * }
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validateBarcode(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        try {
            String scannedBarcode = (String) request.get("scannedBarcode");
            Long examId = Long.valueOf(request.get("examId").toString());
            String username = authentication.getName();

            // Validate barcode using service
            BarcodeService.BarcodeValidationResult result =
                    barcodeService.validateBarcodeScan(scannedBarcode, examId, username);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("valid", result.isValid());
            response.put("scannedBarcode", result.getScannedBarcode());
            response.put("timestamp", result.getTimestamp());

            if (result.isValid()) {
                response.put("student", result.getStudent());
                response.put("exam", result.getExam());
                return ResponseEntity.ok(response);
            } else {
                response.put("errorMessage", result.getErrorMessage());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Validation failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get scan statistics for current user
     * GET /api/barcode/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getScanStats(Authentication authentication) {
        try {
            String username = authentication.getName();
            Map<String, Object> stats = barcodeService.getScanStatistics(username);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to retrieve statistics");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * ⭐ NEW LIBRARIAN ENDPOINT: Get all student ID cards (student info + barcode)
     * GET /api/barcode/id-cards
     *
     * Returns list of all students with their ID card data including:
     * - Student ID (e.g., "BCS25165336")
     * - Full Name
     * - Program
     * - Barcode (as Base64 PNG image)
     *
     * Librarian can use this to print physical ID cards
     */
    @GetMapping("/id-cards")
    public ResponseEntity<?> getAllIdCards() {
        try {
            List<Student> students = studentRepository.findAll();
            List<StudentIdCardDTO> idCards = new ArrayList<>();

            for (Student student : students) {
                try {
                    // Generate barcode as bytes
                    byte[] barcodeBytes = barcodeService.generateBarcodeBytes(student.getStudentId());

                    // Convert to Base64 for JSON transport
                    String barcodeBase64 = Base64.getEncoder().encodeToString(barcodeBytes);

                    // Create ID card DTO
                    StudentIdCardDTO idCard = new StudentIdCardDTO(
                            student.getId(),
                            student.getStudentId(),
                            student.getFullName(),
                            student.getProgram(),
                            barcodeBase64
                    );

                    idCards.add(idCard);
                } catch (Exception e) {
                    System.err.println("❌ Failed to generate ID card for " + student.getStudentId() + ": " + e.getMessage());
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("total", idCards.size());
            response.put("idCards", idCards);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to generate ID cards");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * ⭐ NEW LIBRARIAN ENDPOINT: Get ID cards for specific students (batch)
     * POST /api/barcode/id-cards/batch
     *
     * Request Body:
     * {
     *   "studentIds": ["BCS25165336", "BCS25165337", "BCS25165338"]
     * }
     *
     * Returns ID card data for the specified students
     */
    @PostMapping("/id-cards/batch")
    public ResponseEntity<?> getBatchIdCards(@RequestBody Map<String, List<String>> request) {
        try {
            List<String> studentIds = request.get("studentIds");

            if (studentIds == null || studentIds.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "studentIds list is required"));
            }

            List<StudentIdCardDTO> idCards = new ArrayList<>();

            for (String studentId : studentIds) {
                Optional<Student> studentOpt = studentRepository.findByStudentId(studentId);

                if (studentOpt.isPresent()) {
                    Student student = studentOpt.get();
                    try {
                        byte[] barcodeBytes = barcodeService.generateBarcodeBytes(student.getStudentId());
                        String barcodeBase64 = Base64.getEncoder().encodeToString(barcodeBytes);

                        StudentIdCardDTO idCard = new StudentIdCardDTO(
                                student.getId(),
                                student.getStudentId(),
                                student.getFullName(),
                                student.getProgram(),
                                barcodeBase64
                        );

                        idCards.add(idCard);
                    } catch (Exception e) {
                        System.err.println("❌ Failed to generate barcode for " + studentId);
                    }
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("requested", studentIds.size());
            response.put("generated", idCards.size());
            response.put("idCards", idCards);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to generate batch ID cards");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * ⭐ NEW LIBRARIAN ENDPOINT: Search students for ID card printing
     * GET /api/barcode/id-cards/search?query=Alice
     *
     * Search by name or student ID, returns matching ID cards
     */
    @GetMapping("/id-cards/search")
    public ResponseEntity<?> searchIdCards(@RequestParam String query) {
        try {
            List<Student> students = new ArrayList<>();

            // Search by student ID
            studentRepository.findByStudentId(query).ifPresent(students::add);

            // Search by name (if not found by ID)
            if (students.isEmpty()) {
                students.addAll(studentRepository.findByFullNameContainingIgnoreCase(query));
            }

            List<StudentIdCardDTO> idCards = students.stream()
                    .map(student -> {
                        try {
                            byte[] barcodeBytes = barcodeService.generateBarcodeBytes(student.getStudentId());
                            String barcodeBase64 = Base64.getEncoder().encodeToString(barcodeBytes);

                            return new StudentIdCardDTO(
                                    student.getId(),
                                    student.getStudentId(),
                                    student.getFullName(),
                                    student.getProgram(),
                                    barcodeBase64
                            );
                        } catch (Exception e) {
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("query", query);
            response.put("found", idCards.size());
            response.put("idCards", idCards);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to search ID cards");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}