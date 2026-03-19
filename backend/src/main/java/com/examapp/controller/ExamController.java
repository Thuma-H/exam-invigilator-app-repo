package com.examapp.controller;

import com.examapp.dto.ExamCreateRequest;
import com.examapp.dto.ExamSchedulerResponse;
import com.examapp.dto.ScheduleConflictResponse;
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
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * ExamController — REST API endpoints for exam management.
 *
 * Endpoints:
 *   GET    /api/exams                    — list all exams (flat DTO)
 *   GET    /api/exams/{id}               — single exam (flat DTO)
 *   POST   /api/exams                    — create exam with conflict check
 *   PUT    /api/exams/{id}               — update exam with conflict check
 *   DELETE /api/exams/{id}               — delete exam
 *   GET    /api/exams/conflict-detection — detect all scheduling conflicts
 *   GET    /api/exams/date/{date}        — exams for invigilator on date
 *   GET    /api/exams/course/{code}      — exams by course code
 *   POST   /api/exams/{id}/students/{sid}— enrol student
 *   DELETE /api/exams/{id}/students/{sid}— remove student
 */
@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*")
public class ExamController {

    @Autowired private ExamService examService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private ExamRepository examRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private AttendanceRepository attendanceRepository;

    // ════════════════════════════════════════════════════════════════════
    //  GET /api/exams — list all exams as flat DTOs for the frontend
    // ════════════════════════════════════════════════════════════════════

    /**
     * Returns all exams. When an Authorization header is present the list is
     * scoped to the logged-in invigilator; otherwise all exams are returned
     * (useful for librarian / scheduler views and testing).
     *
     * Response uses ExamSchedulerResponse so the frontend gets:
     *   { id, courseCode, courseName, examDate, startTime, endTime,
     *     duration, venue, invigilatorId, invigilatorName, roomId, status }
     */
    @GetMapping
    public ResponseEntity<?> getMyExams(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            List<Exam> exams;

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                exams = examService.getAllExams();
            } else {
                String username = extractUsername(authHeader);
                exams = examService.getExamsForInvigilator(username);
            }

            // Convert to flat DTOs the frontend expects
            List<ExamSchedulerResponse> dtos = exams.stream()
                    .map(ExamSchedulerResponse::fromExam)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error fetching exams: " + e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════
    //  GET /api/exams/conflict-detection — global conflict scan
    // ════════════════════════════════════════════════════════════════════

    /**
     * Scans all exams pair-wise for scheduling conflicts.
     * Returns { hasConflicts, conflicts: [{ examId1, examId2, conflictType, message }] }
     */
    @GetMapping("/conflict-detection")
    public ResponseEntity<?> detectConflicts() {
        try {
            ScheduleConflictResponse response = examService.detectAllConflicts();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error detecting conflicts: " + e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════
    //  GET /api/exams/date/{date} — exams for invigilator by date
    // ════════════════════════════════════════════════════════════════════

    @GetMapping("/date/{date}")
    public ResponseEntity<?> getExamsByDate(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String date) {
        try {
            String username = extractUsername(authHeader);
            LocalDate examDate = LocalDate.parse(date);
            List<Exam> exams = examService.getExamsForInvigilatorByDate(username, examDate);

            List<ExamSchedulerResponse> dtos = exams.stream()
                    .map(ExamSchedulerResponse::fromExam)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return errorResponse(HttpStatus.BAD_REQUEST,
                    "Error fetching exams: " + e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════
    //  GET /api/exams/{examId} — single exam detail
    // ════════════════════════════════════════════════════════════════════

    @GetMapping("/{examId}")
    public ResponseEntity<?> getExamById(@PathVariable Long examId) {
        try {
            return examService.getExamById(examId)
                    .map(exam -> ResponseEntity.ok((Object) ExamSchedulerResponse.fromExam(exam)))
                    .orElseGet(() -> errorResponse(HttpStatus.NOT_FOUND,
                            "Exam not found with ID: " + examId));
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error fetching exam: " + e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════
    //  GET /api/exams/{examId}/students — students enrolled in exam
    // ════════════════════════════════════════════════════════════════════

    @GetMapping("/{examId}/students")
    public ResponseEntity<?> getStudentsForExam(@PathVariable Long examId) {
        try {
            List<Student> students = examService.getStudentsForExam(examId);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return errorResponse(HttpStatus.NOT_FOUND,
                    "Error fetching students: " + e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════
    //  GET /api/exams/course/{courseCode} — exams by course code
    // ════════════════════════════════════════════════════════════════════

    @GetMapping("/course/{courseCode}")
    public ResponseEntity<?> getExamsByCourseCode(@PathVariable String courseCode) {
        try {
            List<Exam> exams = examService.getExamsByCourseCode(courseCode);
            List<ExamSchedulerResponse> dtos = exams.stream()
                    .map(ExamSchedulerResponse::fromExam)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error fetching exams: " + e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════
    //  POST /api/exams — create a new exam
    // ════════════════════════════════════════════════════════════════════

    /**
     * Create a new exam. Accepts either roomId (numeric FK) or venue (room name string).
     * Validates all required fields, checks for room/invigilator conflicts, and
     * returns the created exam as a flat ExamSchedulerResponse (201 Created).
     *
     * Frontend sends:
     *   { courseCode, courseName, examDate, startTime, duration, venue, invigilatorId }
     */
    @PostMapping
    public ResponseEntity<?> createExam(@RequestBody ExamCreateRequest request) {
        try {
            // ── Validate required fields ───────────────────────────────
            String validationError = validateExamRequest(request);
            if (validationError != null) {
                return errorResponse(HttpStatus.BAD_REQUEST, validationError);
            }

            // ── Create with conflict detection ─────────────────────────
            ExamSchedulerResponse response = examService.createScheduledExam(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (ExamService.ConflictException e) {
            // 409 Conflict — scheduling overlap detected
            return errorResponse(HttpStatus.CONFLICT, e.getMessage());
        } catch (RuntimeException e) {
            return errorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error creating exam: " + e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════
    //  PUT /api/exams/{examId} — update an existing exam
    // ════════════════════════════════════════════════════════════════════

    /**
     * Update an existing exam. Same field rules as POST.
     * Returns the updated exam as a flat ExamSchedulerResponse (200 OK).
     */
    @PutMapping("/{examId}")
    public ResponseEntity<?> updateExam(
            @PathVariable Long examId,
            @RequestBody ExamCreateRequest request) {
        try {
            String validationError = validateExamRequest(request);
            if (validationError != null) {
                return errorResponse(HttpStatus.BAD_REQUEST, validationError);
            }

            ExamSchedulerResponse response = examService.updateScheduledExam(examId, request);
            return ResponseEntity.ok(response);

        } catch (ExamService.ConflictException e) {
            return errorResponse(HttpStatus.CONFLICT, e.getMessage());
        } catch (RuntimeException e) {
            return errorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error updating exam: " + e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════
    //  DELETE /api/exams/{examId} — delete an exam
    // ════════════════════════════════════════════════════════════════════

    @DeleteMapping("/{examId}")
    public ResponseEntity<?> deleteExam(@PathVariable Long examId) {
        try {
            examService.deleteExam(examId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Exam deleted successfully");
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return errorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error deleting exam: " + e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════
    //  POST /api/exams/{examId}/students/{studentId} — enrol student
    // ════════════════════════════════════════════════════════════════════

    @PostMapping("/{examId}/students/{studentId}")
    public ResponseEntity<?> addStudentToExam(
            @PathVariable Long examId,
            @PathVariable String studentId) {
        try {
            Exam exam = examRepository.findById(examId)
                    .orElseThrow(() -> new RuntimeException("Exam not found with ID: " + examId));

            // Find student — try numeric DB id first, then student ID string
            Student student = null;
            try {
                Long dbId = Long.parseLong(studentId);
                student = studentRepository.findById(dbId).orElse(null);
            } catch (NumberFormatException ignored) {}

            if (student == null) {
                student = studentRepository.findByStudentId(studentId)
                        .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
            }

            if (exam.getStudents().contains(student)) {
                return errorResponse(HttpStatus.BAD_REQUEST, "Student already enrolled in this exam");
            }

            exam.getStudents().add(student);
            examRepository.save(exam);

            Map<String, String> response = new HashMap<>();
            response.put("message", String.format("%s was successfully added to %s - %s",
                    student.getFullName(), exam.getCourseCode(), exam.getCourseName()));
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return errorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error adding student to exam: " + e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════
    //  DELETE /api/exams/{examId}/students/{studentId} — remove student
    // ════════════════════════════════════════════════════════════════════

    @DeleteMapping("/{examId}/students/{studentId}")
    public ResponseEntity<?> removeStudentFromExam(
            @PathVariable Long examId,
            @PathVariable Long studentId) {
        try {
            Exam exam = examRepository.findById(examId)
                    .orElseThrow(() -> new RuntimeException("Exam not found with ID: " + examId));
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

            exam.getStudents().remove(student);
            examRepository.save(exam);

            // Clean up attendance records
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
            return errorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error removing student from exam: " + e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ════════════════════════════════════════════════════════════════════

    /**
     * Validate the incoming ExamCreateRequest.
     * Returns null if valid, or an error message string if invalid.
     *
     * Rules:
     *   - courseCode: required, non-empty
     *   - courseName: required, non-empty
     *   - roomId OR venue: at least one must be provided
     *   - examDate: required
     *   - startTime: required
     *   - duration: required, 30–480 minutes
     *   - invigilatorId: required
     */
    private String validateExamRequest(ExamCreateRequest request) {
        if (request.getCourseCode() == null || request.getCourseCode().isBlank())
            return "Missing required field: courseCode";
        if (request.getCourseName() == null || request.getCourseName().isBlank())
            return "Missing required field: courseName";
        if (request.getRoomId() == null
                && (request.getVenue() == null || request.getVenue().isBlank()))
            return "Missing required field: roomId or venue";
        if (request.getExamDate() == null)
            return "Missing required field: examDate";
        if (request.getStartTime() == null)
            return "Missing required field: startTime";
        if (request.getDuration() == null || request.getDuration() < 30 || request.getDuration() > 480)
            return "Duration must be between 30 and 480 minutes";
        if (request.getInvigilatorId() == null)
            return "Missing required field: invigilatorId";
        return null; // valid
    }

    /** Build a consistent JSON error response: { "error": "...", "timestamp": "..." } */
    private ResponseEntity<Object> errorResponse(HttpStatus status, String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        error.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.status(status).body(error);
    }

    /** Extract username from "Bearer <token>" header */
    private String extractUsername(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.extractUsername(token);
    }
}