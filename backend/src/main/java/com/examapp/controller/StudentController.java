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
     * Register a new student
     * POST /api/students
     * Body: {"studentId": "BCS25165344", "fullName": "John Doe", "program": "Computer Science"}
     */
    @PostMapping
    public ResponseEntity registerStudent(@RequestBody Student student) {
        try {
            // Check if student ID already exists
            if (studentRepository.existsByStudentId(student.getStudentId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Student ID already exists");
            }

            // Save student
            Student savedStudent = studentRepository.save(student);

            // Generate barcode
            barcodeService.generateBarcode(student.getStudentId());

            // Send email to librarian
            emailService.notifyNewStudent(
                    student.getStudentId(),
                    student.getFullName(),
                    student.getProgram()
            );

            Map response = new HashMap<>();
            response.put("success", true);
            response.put("student", savedStudent);
            response.put("message", "Student registered successfully. Email sent to librarian.");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error registering student: " + e.getMessage());
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