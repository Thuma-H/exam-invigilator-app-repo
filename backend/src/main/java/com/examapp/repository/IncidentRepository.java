package com.examapp.repository;

import com.examapp.model.Incident;
import com.examapp.model.Exam;
import com.examapp.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * IncidentRepository handles database operations for Incident entity.
 * Provides queries to retrieve and filter incident reports.
 */
@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    /**
     * Find all incidents for a specific exam
     * @param exam - the exam to get incidents for
     * @return List of incidents
     */
    List<Incident> findByExam(Exam exam);

    /**
     * Find all incidents involving a specific student
     * @param student - the student
     * @return List of incidents
     */
    List<Incident> findByStudent(Student student);

    /**
     * Find incidents by category (e.g., "CHEATING", "HEALTH_EMERGENCY")
     * @param category - the incident category
     * @return List of incidents in that category
     */
    List<Incident> findByCategory(String category);

    /**
     * Find incidents by severity level
     * @param severity - the severity level ("LOW", "MEDIUM", "HIGH")
     * @return List of incidents with that severity
     */
    List<Incident> findBySeverity(String severity);

    /**
     * Find incidents reported by a specific invigilator
     * @param reportedBy - username of invigilator
     * @return List of incidents reported by them
     */
    List<Incident> findByReportedBy(String reportedBy);

    /**
     * Count incidents for a specific exam
     * @param exam - the exam
     * @return number of incidents
     */
    long countByExam(Exam exam);

    /**
     * Find incidents by exam and severity (for filtering)
     * @param exam - the exam
     * @param severity - the severity level
     * @return List of matching incidents
     */
    List<Incident> findByExamAndSeverity(Exam exam, String severity);
}