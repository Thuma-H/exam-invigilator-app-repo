package com.examapp.controller;

import com.examapp.model.Student;
import com.examapp.repository.StudentRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 *
 * This app only READS student data for attendance tracking.
/**
 * StudentController - READ-ONLY endpoints for student data
 *
 * ⚠️ IMPORTANT: Students are managed by the university system.
 * This app only READS student data for attendance tracking.
 *
 * CREATE/UPDATE/DELETE operations have been removed.
 * Students must be added to the database via DataInitializer or direct DB import.
 */
 *
 * CREATE/UPDATE/DELETE operations have been removed.
 * Students must be added to the database via DataInitializer or direct DB import.
 */
@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {
     * Get all students (READ-ONLY)
=======
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
>>>>>>> Simon's-frontend
     * GET /api/students
    public ResponseEntity<List<Student>> getAllStudents() {
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }
     * Search student by ID (READ-ONLY)
    /**
     * Search student by ID (READ-ONLY)
     * GET /api/students/search?studentId=BCS25165336
    public ResponseEntity<?> searchStudent(@RequestParam String studentId) {
    @GetMapping("/search")
    public ResponseEntity<?> searchStudent(@RequestParam String studentId) {
        return studentRepository.findByStudentId(studentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
     * Get student by database ID (READ-ONLY)
     * GET /api/students/{id}

    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable Long id) {
        return studentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Search students by name (READ-ONLY)
     * GET /api/students/search-by-name?name=Alice
     */
    @GetMapping("/search-by-name")
    public ResponseEntity<List<Student>> searchByName(@RequestParam String name) {
        List<Student> students = studentRepository.findByFullNameContainingIgnoreCase(name);
        return ResponseEntity.ok(students);


    /**
     * Get students by program (READ-ONLY)
     * GET /api/students/program?program=Computer Science
     */
    @GetMapping("/program")
    public ResponseEntity<List<Student>> getByProgram(@RequestParam String program) {
        List<Student> students = studentRepository.findByProgram(program);
        return ResponseEntity.ok(students);
    }
