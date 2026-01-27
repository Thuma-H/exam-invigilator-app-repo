package com.examapp.controller;

import com.examapp.model.Student;
import com.examapp.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * StudentController - READ-ONLY endpoints for student data
 *
 * ⚠️ IMPORTANT: Students are managed by the university system.
 * This app only READS student data for attendance tracking.
 *
 * CREATE/UPDATE/DELETE operations have been removed.
 * Students must be added to the database via DataInitializer or direct DB import.
 */
@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    /**
     * Get all students (READ-ONLY)
     * GET /api/students
     */
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    /**
     * Search student by ID (READ-ONLY)
     * GET /api/students/search?studentId=BCS25165336
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchStudent(@RequestParam String studentId) {
        return studentRepository.findByStudentId(studentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get student by database ID (READ-ONLY)
     * GET /api/students/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable Long id) {
        return studentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Search students by name (READ-ONLY)
     * GET /api/students/search-by-name?name=Alice
     */
    @GetMapping("/search-by-name")
    public ResponseEntity<List<Student>> searchByName(@RequestParam String name) {
        List<Student> students = studentRepository.findByFullNameContainingIgnoreCase(name);
        return ResponseEntity.ok(students);
    }

    /**
     * Get students by program (READ-ONLY)
     * GET /api/students/program?program=Computer Science
     */
    @GetMapping("/program")
    public ResponseEntity<List<Student>> getByProgram(@RequestParam String program) {
        List<Student> students = studentRepository.findByProgram(program);
        return ResponseEntity.ok(students);
    }
}