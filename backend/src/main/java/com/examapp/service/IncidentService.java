package com.examapp.service;

import com.examapp.dto.IncidentRequest;
import com.examapp.model.Exam;
import com.examapp.model.Incident;
import com.examapp.model.Student;
import com.examapp.repository.ExamRepository;
import com.examapp.repository.IncidentRepository;
import com.examapp.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * IncidentService - handles incident reporting and retrieval.
 * Manages recording and filtering exam incidents.
 *
 * NEW: Sends notification emails when incidents are reported
 */
@Service
public class IncidentService {

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EmailService emailService;

    @Value("${librarian.email}")
    private String adminEmail; // Admin/coordinator email for incident notifications

    /**
     * Report a new incident during an exam
     * @param request - incident details (examId, studentId, category, severity, description)
     * @param reportedBy - username of invigilator reporting incident
     * @return saved incident record
     */
    public Incident reportIncident(IncidentRequest request, String reportedBy) {
        // Get exam from database
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        // Get student if specified (can be null for general incidents)
        Student student = null;
        if (request.getStudentId() != null) {
            student = studentRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
        }

        // Create and save incident
        Incident incident = new Incident(
                exam,
                student,
                request.getCategory(),
                request.getSeverity(),
                request.getDescription(),
                LocalDateTime.now(),
                reportedBy
        );

        Incident savedIncident = incidentRepository.save(incident);

        // NEW: Send notification to admin/coordinator (no details, just alert)
        emailService.notifyIncidentReported(adminEmail, exam.getId());

        return savedIncident;
    }

    /**
     * Get all incidents for a specific exam
     * @param examId - exam ID
     * @return list of incidents
     */
    public List<Incident> getIncidentsForExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        return incidentRepository.findByExam(exam);
    }

    /**
     * Get incidents by category (e.g., all CHEATING incidents)
     * @param category - incident category
     * @return list of incidents in that category
     */
    public List<Incident> getIncidentsByCategory(String category) {
        return incidentRepository.findByCategory(category);
    }

    /**
     * Get incidents by severity level
     * @param severity - severity level (LOW/MEDIUM/HIGH)
     * @return list of incidents with that severity
     */
    public List<Incident> getIncidentsBySeverity(String severity) {
        return incidentRepository.findBySeverity(severity);
    }

    /**
     * Get all incidents reported by a specific invigilator
     * @param username - invigilator's username
     * @return list of incidents
     */
    public List<Incident> getIncidentsByReporter(String username) {
        return incidentRepository.findByReportedBy(username);
    }

    /**
     * Get incidents for a specific student across all exams
     * @param studentId - student's database ID
     * @return list of incidents involving that student
     */
    public List<Incident> getIncidentsByStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return incidentRepository.findByStudent(student);
    }

    /**
     * Get high severity incidents for an exam (for urgent review)
     * @param examId - exam ID
     * @return list of high severity incidents
     */
    public List<Incident> getHighSeverityIncidents(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        return incidentRepository.findByExamAndSeverity(exam, "HIGH");
    }

    /**
     * Count total incidents for an exam
     * @param examId - exam ID
     * @return number of incidents
     */
    public long countIncidentsForExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        return incidentRepository.countByExam(exam);
    }

    /**
     * Update incident with evidence file path (after file upload)
     * @param incidentId - incident ID
     * @param filePath - path to uploaded file
     * @return updated incident
     */
    public Incident attachEvidence(Long incidentId, String filePath) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        incident.setEvidenceFile(filePath);
        return incidentRepository.save(incident);
    }
}