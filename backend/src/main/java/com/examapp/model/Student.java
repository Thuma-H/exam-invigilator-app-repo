package com.examapp.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Student entity represents students enrolled in exams.
 * Stores student identification and academic program details.
 */
@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", unique = true, nullable = false)
    private String studentId; // e.g., "BCS25165336"

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String program; // e.g., "Computer Science"

    // Many-to-Many relationship with exams (a student can take multiple exams)
    @ManyToMany(mappedBy = "students")
    private List<Exam> exams = new ArrayList<>();

    // Constructors
    public Student() {}

    public Student(String studentId, String fullName, String program) {
        this.studentId = studentId;
        this.fullName = fullName;
        this.program = program;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getProgram() {
        return program;
    }

    public void setProgram(String program) {
        this.program = program;
    }

    public List<Exam> getExams() {
        return exams;
    }

    public void setExams(List<Exam> exams) {
        this.exams = exams;
    }
}