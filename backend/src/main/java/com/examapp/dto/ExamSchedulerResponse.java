package com.examapp.dto;

import com.examapp.model.Exam;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * ExamSchedulerResponse — flattened DTO returned to the frontend.
 *
 * The frontend expects a flat JSON with invigilatorId (number) and venue (string)
 * rather than nested Room/User objects. This DTO bridges that gap.
 *
 * The endTime is calculated from startTime + duration (minutes) so the
 * frontend calendar can render event blocks without computing it client-side.
 */
public class ExamSchedulerResponse {

    private Long id;
    private String courseCode;
    private String courseName;
    private LocalDate examDate;
    private LocalTime startTime;
    private LocalTime endTime;      // Calculated: startTime + duration
    private Integer duration;
    private String venue;           // Room name string for display
    private Long invigilatorId;     // Flat FK — not nested object
    private String invigilatorName; // Display name for convenience
    private Long roomId;            // Room FK for edit forms
    private String status;
    private Integer maxStudents;

    // ── Factory method from Exam entity ────────────────────────────────
    public static ExamSchedulerResponse fromExam(Exam exam) {
        ExamSchedulerResponse r = new ExamSchedulerResponse();
        r.id              = exam.getId();
        r.courseCode       = exam.getCourseCode();
        r.courseName       = exam.getCourseName();
        r.examDate         = exam.getExamDate();
        r.startTime        = exam.getStartTime();
        r.endTime          = exam.getStartTime().plusMinutes(exam.getDuration());
        r.duration         = exam.getDuration();
        r.venue            = exam.getVenue() != null ? exam.getVenue()
                             : (exam.getRoom() != null ? exam.getRoom().getRoomName() : null);
        r.roomId           = exam.getRoom() != null ? exam.getRoom().getId() : null;
        r.invigilatorId    = exam.getInvigilator() != null ? exam.getInvigilator().getId() : null;
        r.invigilatorName  = exam.getInvigilator() != null ? exam.getInvigilator().getFullName() : null;
        r.status           = exam.getStatus();
        r.maxStudents      = exam.getMaxStudents();
        return r;
    }

    // ── Getters and Setters ────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public LocalDate getExamDate() { return examDate; }
    public void setExamDate(LocalDate examDate) { this.examDate = examDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public Long getInvigilatorId() { return invigilatorId; }
    public void setInvigilatorId(Long invigilatorId) { this.invigilatorId = invigilatorId; }

    public String getInvigilatorName() { return invigilatorName; }
    public void setInvigilatorName(String invigilatorName) { this.invigilatorName = invigilatorName; }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getMaxStudents() { return maxStudents; }
    public void setMaxStudents(Integer maxStudents) { this.maxStudents = maxStudents; }
}

