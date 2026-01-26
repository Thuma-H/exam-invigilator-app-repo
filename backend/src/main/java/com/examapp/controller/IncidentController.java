package com.examapp.controller;

import com.examapp.dto.IncidentRequest;
import com.examapp.model.Incident;
import com.examapp.service.IncidentService;
import com.examapp.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * IncidentController - REST API endpoints for incident reporting.
 * Handles creating and retrieving incident reports.
 */
@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "*") // Allow all origins for network testing
public class IncidentController {

    @Autowired
    private IncidentService incidentService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Report a new incident
     * POST /api/incidents
     * Header: Authorization: Bearer <token>
     * Body: {"examId": 1, "studentId": 2, "category": "CHEATING",
     *        "severity": "HIGH", "description": "Student caught with notes"}
     */
    @PostMapping
    public ResponseEntity<?> reportIncident(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody IncidentRequest request) {
        try {
            String username = extractUsername(authHeader);
            Incident incident = incidentService.reportIncident(request, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(incident);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error reporting incident: " + e.getMessage());
        }
    }

    /**
     * Get all incidents for a specific exam
     * GET /api/incidents/exam/1
     * Header: Authorization: Bearer <token>
     */
    @GetMapping("/exam/{examId}")
    public ResponseEntity<?> getIncidentsForExam(@PathVariable Long examId) {
        try {
            List<Incident> incidents = incidentService.getIncidentsForExam(examId);
            return ResponseEntity.ok(incidents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error fetching incidents: " + e.getMessage());
        }
    }

    /**
     * Get incidents by category
     * GET /api/incidents/category/CHEATING
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<?> getIncidentsByCategory(@PathVariable String category) {
        try {
            List<Incident> incidents = incidentService.getIncidentsByCategory(category);
            return ResponseEntity.ok(incidents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching incidents: " + e.getMessage());
        }
    }

    /**
     * Get incidents by severity level
     * GET /api/incidents/severity/HIGH
     */
    @GetMapping("/severity/{severity}")
    public ResponseEntity<?> getIncidentsBySeverity(@PathVariable String severity) {
        try {
            List<Incident> incidents = incidentService.getIncidentsBySeverity(severity);
            return ResponseEntity.ok(incidents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching incidents: " + e.getMessage());
        }
    }

    /**
     * Get all incidents reported by logged-in invigilator
     * GET /api/incidents/my-reports
     * Header: Authorization: Bearer <token>
     */
    @GetMapping("/my-reports")
    public ResponseEntity<?> getMyIncidents(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String username = extractUsername(authHeader);
            List<Incident> incidents = incidentService.getIncidentsByReporter(username);
            return ResponseEntity.ok(incidents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching incidents: " + e.getMessage());
        }
    }

    /**
     * Get high severity incidents for an exam
     * GET /api/incidents/exam/1/high-severity
     */
    @GetMapping("/exam/{examId}/high-severity")
    public ResponseEntity<?> getHighSeverityIncidents(@PathVariable Long examId) {
        try {
            List<Incident> incidents = incidentService.getHighSeverityIncidents(examId);
            return ResponseEntity.ok(incidents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error fetching incidents: " + e.getMessage());
        }
    }

    /**
     * Get incident count for an exam
     * GET /api/incidents/exam/1/count
     */
    @GetMapping("/exam/{examId}/count")
    public ResponseEntity<?> getIncidentCount(@PathVariable Long examId) {
        try {
            long count = incidentService.countIncidentsForExam(examId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error counting incidents: " + e.getMessage());
        }
    }

    /**
     * Get incidents for a specific student
     * GET /api/incidents/student/3
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getIncidentsByStudent(@PathVariable Long studentId) {
        try {
            List<Incident> incidents = incidentService.getIncidentsByStudent(studentId);
            return ResponseEntity.ok(incidents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error fetching incidents: " + e.getMessage());
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