package com.examapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Course entity represents academic courses in the system.
 * Used for course registration and management.
 */
@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "course_code", unique = true, nullable = false)
    private String courseCode; // e.g., "BSC121"

    @Column(name = "course_name", nullable = false)
    private String courseName; // e.g., "Introduction to Computer Science"

    @Column(nullable = false)
    private String department;

    @Column(name = "credit_hours")
    private Integer creditHours;

    @Column(nullable = true)
    private String instructor;

    @Column(name = "registration_date")
    private LocalDateTime registrationDate;

    // Constructors
    public Course() {
        this.registrationDate = LocalDateTime.now();
    }

    public Course(String courseCode, String courseName, String department, Integer creditHours, String instructor) {
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.department = department;
        this.creditHours = creditHours;
        this.instructor = instructor;
        this.registrationDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getCreditHours() {
        return creditHours;
    }

    public void setCreditHours(Integer creditHours) {
        this.creditHours = creditHours;
    }

    public String getInstructor() {
        return instructor;
    }

    public void setInstructor(String instructor) {
        this.instructor = instructor;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }
}

