package com.examapp.repository;

import com.examapp.model.Exam;
import com.examapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

/**
 * ExamRepository handles database operations for Exam entity.
 * Provides queries to find exams by various criteria.
 */
@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    /**
     * Find all exams assigned to a specific invigilator
     * @param invigilator - the invigilator user
     * @return List of exams assigned to this invigilator
     */
    List<Exam> findByInvigilator(User invigilator);

    /**
     * Find exams by date (useful for daily schedules)
     * @param examDate - the date to search for
     * @return List of exams on that date
     */
    List<Exam> findByExamDate(LocalDate examDate);

    /**
     * Find exams for specific invigilator on a specific date
     * @param invigilator - the invigilator user
     * @param examDate - the exam date
     * @return List of exams matching both criteria
     */
    List<Exam> findByInvigilatorAndExamDate(User invigilator, LocalDate examDate);

    /**
     * Find exams by course code (useful for reports)
     * @param courseCode - the course code (e.g., "BSC121")
     * @return List of exams for that course
     */
    List<Exam> findByCourseCode(String courseCode);
}