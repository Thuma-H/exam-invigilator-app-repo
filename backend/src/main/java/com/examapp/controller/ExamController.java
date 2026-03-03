package com.examapp.controller;

import com.examapp.model.Exam;
import com.examapp.model.Student;
import com.examapp.service.ExamService;
import com.examapp.util.JwtUtil;
import com.examapp.repository.ExamRepository;
import com.examapp.repository.StudentRepository;
import com.examapp.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ExamController - REST API endpoints for exam management.
 * Handles retrieving exam schedules and student lists.
 */
@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*") // Allow all origins for network testing
public class ExamController {

    @Autowired
    private ExamService examService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    /**
     * Get all exams assigned to the logged-in invigilator
     * GET /api/exams
     * Header: Authorization: Bearer <token>
     */
    @GetMapping
    public ResponseEntity<?> getMyExams(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // For now, return all exams if no auth (testing mode)
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                // Return all exams for testing
                List<Exam> exams = examService.getAllExams();
                return ResponseEntity.ok(exams);
            }

            String username = extractUsername(authHeader);
            List<Exam> exams = examService.getExamsForInvigilator(username);
            return ResponseEntity.ok(exams);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching exams: " + e.getMessage());
        }
    }

    /**
     * Get exams for a specific date
     * GET /api/exams/date/2025-11-15
     * Header: Authorization: Bearer <token>
     */
    @GetMapping("/date/{date}")
    public ResponseEntity<?> getExamsByDate(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String date) {
        try {
            String username = extractUsername(authHeader);
            LocalDate examDate = LocalDate.parse(date);
            List<Exam> exams = examService.getExamsForInvigilatorByDate(username, examDate);
            return ResponseEntity.ok(exams);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error fetching exams: " + e.getMessage());
        }
    }

    /**
     * Get specific exam details by ID
     * GET /api/exams/1
     * Header: Authorization: Bearer <token>
     */
    @GetMapping("/{examId}")
    public ResponseEntity<?> getExamById(@PathVariable Long examId) {
        try {
            return examService.getExamById(examId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching exam: " + e.getMessage());
        }
    }

    /**
     * Get all students enrolled in a specific exam
     * GET /api/exams/1/students
     * Header: Authorization: Bearer <token>
     */
    @GetMapping("/{examId}/students")
    public ResponseEntity<?> getStudentsForExam(@PathVariable Long examId) {
        try {
            List<Student> students = examService.getStudentsForExam(examId);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error fetching students: " + e.getMessage());
        }
    }

    /**
     * Get exams by course code
     * GET /api/exams/course/BSC121
     */
    @GetMapping("/course/{courseCode}")
    public ResponseEntity<?> getExamsByCourseCode(@PathVariable String courseCode) {
        try {
            List<Exam> exams = examService.getExamsByCourseCode(courseCode);
            return ResponseEntity.ok(exams);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching exams: " + e.getMessage());
        }
    }

    /**
     * Add a student to an exam
     * POST /api/exams/{examId}/students/{studentId}
     * studentId can be either database ID (Long) or student ID string (e.g., "BCS25165336")
     */
    @PostMapping("/{examId}/students/{studentId}")
    public ResponseEntity<?> addStudentToExam(
            @PathVariable Long examId,
            @PathVariable String studentId) {
        try {
            // Find exam
            Exam exam = examRepository.findById(examId)
                    .orElseThrow(() -> new RuntimeException("Exam not found with ID: " + examId));

            // Find student - try by database ID first, then by student ID string
            Student student = null;
            try {
                Long dbId = Long.parseLong(studentId);
                student = studentRepository.findById(dbId).orElse(null);
            } catch (NumberFormatException e) {
                // Not a number, try as student ID string
            }

            if (student == null) {
                student = studentRepository.findByStudentId(studentId)
                        .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
            }

            // Check if student is already enrolled
            if (exam.getStudents().contains(student)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Student already enrolled in this exam");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Add student to exam
            exam.getStudents().add(student);
            examRepository.save(exam);

            // Build success message
            String message = String.format("%s was successfully added to %s - %s",
                    student.getFullName(),
                    exam.getCourseCode(),
                    exam.getCourseName());

            Map<String, String> response = new HashMap<>();
            response.put("message", message);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error adding student to exam: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Remove a student from an exam
     * DELETE /api/exams/{examId}/students/{studentId}
     * studentId is the database ID (Long), not the student ID string
     */
    @DeleteMapping("/{examId}/students/{studentId}")
    public ResponseEntity<?> removeStudentFromExam(
            @PathVariable Long examId,
            @PathVariable Long studentId) {
        try {
            // Find exam
            Exam exam = examRepository.findById(examId)
                    .orElseThrow(() -> new RuntimeException("Exam not found with ID: " + examId));

            // Find student
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

            // Remove student from exam
            exam.getStudents().remove(student);
            examRepository.save(exam);

            // Delete any attendance records for this student in this exam
            try {
                attendanceRepository.findByExamAndStudent(exam, student)
                        .ifPresent(attendance -> attendanceRepository.delete(attendance));
            } catch (Exception e) {
                System.err.println("Warning: Could not delete attendance records: " + e.getMessage());
            }

            Map<String, String> response = new HashMap<>();
            response.put("message", "Student removed successfully");
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error removing student from exam: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Helper method to extract username from JWT token
     */
    private String extractUsername(String authHeader) {
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        return jwtUtil.extractUsername(token);
    }
}