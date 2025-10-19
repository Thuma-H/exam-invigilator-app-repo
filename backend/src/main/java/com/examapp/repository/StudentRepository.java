package com.examapp.repository;

import com.examapp.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

/**
 * StudentRepository handles database operations for Student entity.
 * Provides queries to search students by ID or program.
 */
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    /**
     * Find student by their unique student ID (e.g., "BCS25165336")
     * Used for ID scanning and manual search
     * @param studentId - the student ID to search for
     * @return Optional<Student> - student if found, empty otherwise
     */
    Optional<Student> findByStudentId(String studentId);

    /**
     * Find all students in a specific program
     * @param program - the program name (e.g., "Computer Science")
     * @return List of students in that program
     */
    List<Student> findByProgram(String program);

    /**
     * Check if a student ID already exists
     * @param studentId - the student ID to check
     * @return boolean - true if exists, false otherwise
     */
    boolean existsByStudentId(String studentId);

    /**
     * Search students by name (case-insensitive, partial match)
     * @param fullName - name or partial name to search
     * @return List of matching students
     */
    List<Student> findByFullNameContainingIgnoreCase(String fullName);
}