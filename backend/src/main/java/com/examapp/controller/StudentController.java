package com.examapp.controller;

import com.examapp.model.Student;
import com.examapp.repository.StudentRepository;
import com.examapp.service.BarcodeService;
import com.examapp.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private BarcodeService barcodeService;

    @Autowired
    private EmailService emailService;

    /**
     * Register a new student or return existing
     * POST /api/students
     * Body: {"studentId": "BCS25165344", "fullName": "John Doe", "program": "Computer Science", "email": "john@example.com"}
     */
    @PostMapping
    public ResponseEntity registerStudent(@RequestBody Student student) {
        try {
            // Check if student ID already exists - return existing student
            java.util.Optional<Student> existingStudent = studentRepository.findByStudentId(student.getStudentId());
            if (existingStudent.isPresent()) {
                // Return existing student with 200 OK
                return ResponseEntity.ok(existingStudent.get());
            }

            // Set default values for new student
            if (student.getVerified() == null) {
                student.setVerified(false);
            }
            if (student.getRegistrationDate() == null) {
                student.setRegistrationDate(java.time.LocalDateTime.now());
            }

            // Save student
            Student savedStudent = studentRepository.save(student);

            // Generate barcode (non-blocking)
            try {
                barcodeService.generateBarcode(student.getStudentId());
            } catch (Exception e) {
                System.err.println("Warning: Could not generate barcode: " + e.getMessage());
            }

            // Send email to librarian (non-blocking)
            try {
                emailService.notifyNewStudent(
                        student.getStudentId(),
                        student.getFullName(),
                        student.getProgram()
                );
            } catch (Exception e) {
                System.err.println("Warning: Could not send email: " + e.getMessage());
            }

            // Return new student with 201 CREATED
            return ResponseEntity.status(HttpStatus.CREATED).body(savedStudent);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error registering student: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get all students
     * GET /api/students
     */
    @GetMapping
    public ResponseEntity<List> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    /**
     * Search student by ID
     * GET /api/students/search?studentId=BCS25165336
     */
    @GetMapping("/search")
    public ResponseEntity searchStudent(@RequestParam String studentId) {
        return studentRepository.findByStudentId(studentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get pending (unverified) students
     * GET /api/students/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<List<Student>> getPendingStudents() {
        List<Student> pendingStudents = studentRepository.findByVerified(false);
        return ResponseEntity.ok(pendingStudents);
    }

    /**
     * Verify a student
     * PUT /api/students/{id}/verify
     */
    @PutMapping("/{id}/verify")
    public ResponseEntity verifyStudent(@PathVariable Long id) {
        try {
            return studentRepository.findById(id)
                    .map(student -> {
                        student.setVerified(true);
                        Student updated = studentRepository.save(student);

                        Map<String, Object> response = new HashMap<>();
                        response.put("success", true);
                        response.put("student", updated);
                        response.put("message", "Student verified successfully");

                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error verifying student: " + e.getMessage());
        }
    }

    /**
     * Send barcode email to student
     * POST /api/students/{id}/send-barcode-email
     */
    @PostMapping("/{id}/send-barcode-email")
    public ResponseEntity sendBarcodeEmail(@PathVariable Long id) {
        try {
            return studentRepository.findById(id)
                    .map(student -> {
                        if (student.getEmail() == null || student.getEmail().isEmpty()) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body("Student does not have an email address");
                        }

                        emailService.sendBarcodeInfoToStudent(
                                student.getEmail(),
                                student.getStudentId(),
                                student.getFullName()
                        );

                        Map<String, Object> response = new HashMap<>();
                        response.put("success", true);
                        response.put("message", "Barcode email sent to " + student.getEmail());

                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error sending barcode email: " + e.getMessage());
        }
    }
}