package com.examapp.repository;

import com.examapp.model.Attendance;
import com.examapp.model.Exam;
import com.examapp.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * AttendanceRepository handles database operations for Attendance entity.
 * Provides queries to track and summarize attendance records.
 */
@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    /**
     * Find all attendance records for a specific exam
     * @param exam - the exam to get attendance for
     * @return List of attendance records
     */
    List<Attendance> findByExam(Exam exam);

    /**
     * Find attendance record for a specific student in a specific exam
     * @param exam - the exam
     * @param student - the student
     * @return Optional<Attendance> - attendance record if exists
     */
    Optional<Attendance> findByExamAndStudent(Exam exam, Student student);

    /**
     * Count how many students are present for an exam
     * @param exam - the exam
     * @param status - the status to count (e.g., "PRESENT")
     * @return number of students with that status
     */
    long countByExamAndStatus(Exam exam, String status);

    /**
     * Check if attendance already marked for this student in this exam
     * @param exam - the exam
     * @param student - the student
     * @return boolean - true if attendance exists, false otherwise
     */
    boolean existsByExamAndStudent(Exam exam, Student student);

    /**
     * Get all attendance records marked by a specific invigilator
     * @param markedBy - username of invigilator
     * @return List of attendance records
     */
    List<Attendance> findByMarkedBy(String markedBy);
}