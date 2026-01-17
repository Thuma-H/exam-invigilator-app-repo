package com.examapp.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
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
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "student_id", unique = true, nullable = false)
    private String studentId; // e.g., "BCS25165336"

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String program; // e.g., "Computer Science"

    @Column(nullable = true)
    private String email;

    @Column(name = "verified", nullable = false)
    private Boolean verified = false;

    @Column(name = "registration_date")
    private java.time.LocalDateTime registrationDate;

//    // Many-to-Many relationship with exams (a student can take multiple exams)
//    @ManyToMany(mappedBy = "students")
//    @JsonBackReference
//    private List<Exam> exams = new ArrayList<>();

    // Constructors
    public Student() {
        this.registrationDate = java.time.LocalDateTime.now();
    }

    public Student(String studentId, String fullName, String program) {
        this.studentId = studentId;
        this.fullName = fullName;
        this.program = program;
        this.registrationDate = java.time.LocalDateTime.now();
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getVerified() {
        return verified;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    public java.time.LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(java.time.LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

//    public List<Exam> getExams() {
//        return exams;
//    }

//    public void setExams(List<Exam> exams) {
//        this.exams = exams;
//    }
}