package com.examapp.controller;

import com.examapp.model.Exam;
import com.examapp.model.Student;
import com.examapp.service.ExamService;
import com.examapp.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

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
     * Helper method to extract username from JWT token
     */
    private String extractUsername(String authHeader) {
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        return jwtUtil.extractUsername(token);
    }
}