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

/**
 * StudentController - Endpoints for student data
 *
 * Students are managed by the university system.
 * This app READS student data for attendance tracking
 * and supports registering new students via POST.
 */
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
    public ResponseEntity<?> registerStudent(@RequestBody Student student) {
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

            // Send email notification (non-blocking)
            try {
                if (student.getEmail() != null && !student.getEmail().isEmpty()) {
                    emailService.notifyIdCardReady(student.getEmail());
                }
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
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    /**
     * Search student by ID
     * GET /api/students/search?studentId=BCS25165336
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchStudent(@RequestParam String studentId) {
        return studentRepository.findByStudentId(studentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get student by database ID
     * GET /api/students/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable Long id) {
        return studentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Search students by name
     * GET /api/students/search-by-name?name=Alice
     */
    @GetMapping("/search-by-name")
    public ResponseEntity<List<Student>> searchByName(@RequestParam String name) {
        List<Student> students = studentRepository.findByFullNameContainingIgnoreCase(name);
        return ResponseEntity.ok(students);
    }

    /**
     * Get students by program
     * GET /api/students/program?program=Computer Science
     */
    @GetMapping("/program")
    public ResponseEntity<List<Student>> getByProgram(@RequestParam String program) {
        List<Student> students = studentRepository.findByProgram(program);
        return ResponseEntity.ok(students);
    }
}
