package com.examapp.controller;

import com.examapp.model.Course;
import com.examapp.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    /**
     * Get all courses
     * GET /api/courses
     */
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseRepository.findAll());
    }

    /**
     * Get course by ID
     * GET /api/courses/1
     */
    @GetMapping("/{id}")
    public ResponseEntity getCourseById(@PathVariable Long id) {
        return courseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new course
     * POST /api/courses
     */
    @PostMapping
    public ResponseEntity createCourse(@RequestBody Course course) {
        try {
            if (courseRepository.existsByCourseCode(course.getCourseCode())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Course code already exists");
            }
            Course saved = courseRepository.save(course);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating course: " + e.getMessage());
        }
    }

    /**
     * Update a course
     * PUT /api/courses/1
     */
    @PutMapping("/{id}")
    public ResponseEntity updateCourse(@PathVariable Long id, @RequestBody Course courseDetails) {
        try {
            return courseRepository.findById(id)
                    .map(course -> {
                        course.setCourseName(courseDetails.getCourseName());
                        course.setDepartment(courseDetails.getDepartment());
                        course.setCreditHours(courseDetails.getCreditHours());
                        course.setInstructor(courseDetails.getInstructor());
                        Course updated = courseRepository.save(course);
                        return ResponseEntity.ok(updated);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating course: " + e.getMessage());
        }
    }

    /**
     * Delete a course
     * DELETE /api/courses/1
     */
    @DeleteMapping("/{id}")
    public ResponseEntity deleteCourse(@PathVariable Long id) {
        try {
            if (courseRepository.existsById(id)) {
                courseRepository.deleteById(id);
                return ResponseEntity.ok("Course deleted successfully");
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting course: " + e.getMessage());
        }
    }

    /**
     * Search courses by department
     * GET /api/courses/department/Computer Science
     */
    @GetMapping("/department/{department}")
    public ResponseEntity<List<Course>> getCoursesByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(courseRepository.findByDepartment(department));
    }
}

