package com.examapp.repository;

import com.examapp.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

/**
 * CourseRepository handles database operations for Course entity.
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    /**
     * Find course by course code
     */
    Optional<Course> findByCourseCode(String courseCode);

    /**
     * Find courses by department
     */
    List<Course> findByDepartment(String department);

    /**
     * Check if course code exists
     */
    boolean existsByCourseCode(String courseCode);

    /**
     * Search courses by name (case-insensitive, partial match)
     */
    List<Course> findByCourseNameContainingIgnoreCase(String courseName);
}

