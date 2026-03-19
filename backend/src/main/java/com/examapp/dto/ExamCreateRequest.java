package com.examapp.dto;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * ExamCreateRequest - DTO for creating a new exam
 * Includes validation for exam scheduling
 */
public class ExamCreateRequest {
    private String courseCode;
    private String courseName;
    private Long roomId;        // Room ID (used when caller knows the DB id)
    private String venue;       // Room name string (used by frontend scheduler)
    private LocalDate examDate;
    private LocalTime startTime;
    private Integer duration;   // Duration in minutes
    private Long invigilatorId; // Invigilator user ID

    // Constructors
    public ExamCreateRequest() {}

    public ExamCreateRequest(String courseCode, String courseName, Long roomId,
                            LocalDate examDate, LocalTime startTime, Integer duration, Long invigilatorId) {
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.roomId = roomId;
        this.examDate = examDate;
        this.startTime = startTime;
        this.duration = duration;
        this.invigilatorId = invigilatorId;
    }

    // Getters and Setters
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

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public LocalDate getExamDate() {
        return examDate;
    }

    public void setExamDate(LocalDate examDate) {
        this.examDate = examDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Long getInvigilatorId() {
        return invigilatorId;
    }

    public void setInvigilatorId(Long invigilatorId) {
        this.invigilatorId = invigilatorId;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }
}

