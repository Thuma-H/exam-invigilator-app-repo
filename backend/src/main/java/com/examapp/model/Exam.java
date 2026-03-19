package com.examapp.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Exam entity — the central scheduling object.
 *
 * Key relationships:
 *   • ManyToOne  → Room  (every exam happens in exactly one room)
 *   • ManyToOne  → User  (primary / legacy single-invigilator FK)
 *   • ManyToMany → User  (exam_invigilators junction — multi-invigilator support)
 *   • ManyToMany → Student (exam_students junction — enrollment)
 *
 * @Table indexes mirror the SQL migration indexes so that queries on
 * date, room_id, and start_time are fast (conflict detection depends on these).
 */
@Entity
@Table(
    name = "exams",
    indexes = {
        @Index(name = "idx_exams_date",            columnList = "exam_date"),
        @Index(name = "idx_exams_room_id",         columnList = "room_id"),
        @Index(name = "idx_exams_start_time",      columnList = "start_time"),
        @Index(name = "idx_exams_date_start_time", columnList = "exam_date, start_time")
    }
)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_code", nullable = false)
    private String courseCode;

    @Column(name = "course_name", nullable = false)
    private String courseName;

    // Legacy string venue — kept for backward compatibility
    @Column(nullable = true)
    private String venue;

    @Column(name = "exam_date", nullable = false)
    private LocalDate examDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private Integer duration; // Duration in minutes

    // Exam lifecycle: SCHEDULED → ACTIVE → COMPLETED | CANCELLED
    @Column(nullable = false)
    private String status = "SCHEDULED";

    // Optional enrolment cap; when NULL the room's capacity is the limit
    @Column(name = "max_students")
    private Integer maxStudents;

    // ── Room (ManyToOne) — every exam is held in exactly one room ───────
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Room room;

    // ── Primary invigilator (legacy single-assign FK) ───────────────────
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "invigilator_id", nullable = false)
    @JsonIgnoreProperties({"password", "authorities"})
    private User invigilator;

    // ── Multi-invigilator support (exam_invigilators junction table) ────
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "exam_invigilators",
            joinColumns        = @JoinColumn(name = "exam_id"),
            inverseJoinColumns = @JoinColumn(name = "invigilator_id")
    )
    @JsonIgnoreProperties({"password", "authorities"})
    private List<User> invigilators = new ArrayList<>();

    // ── Student enrollment (exam_students junction table) ───────────────
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "exam_students",
            joinColumns        = @JoinColumn(name = "exam_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    @JsonIgnore
    private List<Student> students = new ArrayList<>();

    // Constructors
    public Exam() {}

    public Exam(String courseCode, String courseName, String venue,
                LocalDate examDate, LocalTime startTime, Integer duration, User invigilator) {
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.venue = venue;
        this.examDate = examDate;
        this.startTime = startTime;
        this.duration = duration;
        this.invigilator = invigilator;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public LocalDate getExamDate() { return examDate; }
    public void setExamDate(LocalDate examDate) { this.examDate = examDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getMaxStudents() { return maxStudents; }
    public void setMaxStudents(Integer maxStudents) { this.maxStudents = maxStudents; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public User getInvigilator() { return invigilator; }
    public void setInvigilator(User invigilator) { this.invigilator = invigilator; }

    public List<User> getInvigilators() { return invigilators; }
    public void setInvigilators(List<User> invigilators) { this.invigilators = invigilators; }

    public List<Student> getStudents() { return students; }
    public void setStudents(List<Student> students) { this.students = students; }
}