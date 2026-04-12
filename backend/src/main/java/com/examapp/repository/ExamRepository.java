package com.examapp.repository;

import com.examapp.model.Exam;
import com.examapp.model.Room;
import com.examapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * ExamRepository handles database operations for Exam entity.
 * Provides queries to find exams by various criteria and conflict detection.
 */
@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    /**
     * Find all exams assigned to a specific invigilator
     * @param invigilator - the invigilator user
     * @return List of exams assigned to this invigilator
     */
    List<Exam> findByInvigilator(User invigilator);
    List<Exam> findByInvigilatorsContaining(User invigilator);

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

    /**
     * Find all exams in a specific room on a specific date
     * @param room - the room
     * @param examDate - the exam date
     * @return List of exams in that room on that date
     */
    List<Exam> findByRoomAndExamDate(Room room, LocalDate examDate);

    // ── Conflict-detection queries ─────────────────────────────────────────
    //
    // Overlap rule:  existingStart < proposedEnd  AND  proposedStart < existingEnd
    //
    // JPQL cannot compute existingEnd (startTime + duration), so we filter
    // the first half here and let the service layer post-filter the second.
    // This keeps queries portable across SQLite / H2 / PostgreSQL.

    /**
     * Find exams in the same room & date whose start is before the proposed end.
     * Caller must post-filter: proposedStart < (existing.startTime + existing.duration)
     */
    @Query("SELECT e FROM Exam e " +
           "WHERE e.room = :room " +
           "  AND e.examDate = :examDate " +
           "  AND e.startTime < :proposedEnd")
    List<Exam> findPotentialRoomConflicts(
            @Param("room")        Room room,
            @Param("examDate")    LocalDate examDate,
            @Param("proposedEnd") LocalTime proposedEnd
    );

    /**
     * Find exams for the same invigilator & date whose start is before
     * the proposed end.  Caller must post-filter the second half.
     */
    @Query("SELECT e FROM Exam e " +
           "WHERE e.invigilator = :invigilator " +
           "  AND e.examDate = :examDate " +
           "  AND e.startTime < :proposedEnd")
    List<Exam> findPotentialInvigilatorConflicts(
            @Param("invigilator") User invigilator,
            @Param("examDate")    LocalDate examDate,
            @Param("proposedEnd") LocalTime proposedEnd
    );
}