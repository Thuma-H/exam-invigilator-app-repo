package com.examapp.controller;

import com.examapp.dto.AttendanceRequest;
import com.examapp.dto.AttendanceSummary;
import com.examapp.model.Attendance;
import com.examapp.service.AttendanceService;
import com.examapp.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AttendanceController - REST API endpoints for attendance management.
 * Handles marking attendance and generating reports.
 */
@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:3000")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Mark student attendance
     * POST /api/attendance
     * Header: Authorization: Bearer <token>
     * Body: {"examId": 1, "studentId": 3, "status": "PRESENT", "method": "MANUAL"}
     */
    @PostMapping
    public ResponseEntity<?> markAttendance(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody AttendanceRequest request) {
        try {
            String username = extractUsername(authHeader);
            Attendance attendance = attendanceService.markAttendance(request, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(attendance);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error marking attendance: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }
    }

    /**
     * Get all attendance records for an exam
     * GET /api/attendance/exam/1
     * Header: Authorization: Bearer <token>
     */
    @GetMapping("/exam/{examId}")
    public ResponseEntity<?> getAttendanceForExam(@PathVariable Long examId) {
        try {
            List<Attendance> attendanceList = attendanceService.getAttendanceForExam(examId);
            return ResponseEntity.ok(attendanceList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error fetching attendance: " + e.getMessage());
        }
    }

    /**
     * Get attendance summary for an exam (statistics)
     * GET /api/attendance/exam/1/summary
     * Header: Authorization: Bearer <token>
     */
    @GetMapping("/exam/{examId}/summary")
    public ResponseEntity<?> getAttendanceSummary(@PathVariable Long examId) {
        try {
            AttendanceSummary summary = attendanceService.getAttendanceSummary(examId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error generating summary: " + e.getMessage());
        }
    }

    /**
     * Update attendance status (if marking was incorrect)
     * PUT /api/attendance/5
     * Body: {"status": "LATE"}
     */
    @PutMapping("/{attendanceId}")
    public ResponseEntity<?> updateAttendance(
            @PathVariable Long attendanceId,
            @RequestBody AttendanceRequest request) {
        try {
            Attendance updated = attendanceService.updateAttendanceStatus(
                    attendanceId,
                    request.getStatus()
            );
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error updating attendance: " + e.getMessage());
        }
    }

    /**
     * Get all attendance records marked by logged-in invigilator
     * GET /api/attendance/my-records
     * Header: Authorization: Bearer <token>
     */
    @GetMapping("/my-records")
    public ResponseEntity<?> getMyAttendanceRecords(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String username = extractUsername(authHeader);
            List<Attendance> records = attendanceService.getAttendanceByInvigilator(username);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching records: " + e.getMessage());
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