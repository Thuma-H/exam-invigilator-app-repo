package com.examapp.dto;

/**
 * AttendanceSummary DTO - summary statistics for exam attendance.
 * Returned when generating attendance reports.
 */
public class AttendanceSummary {

    private Long examId;
    private String courseCode;
    private String courseName;
    private int totalStudents;
    private int presentCount;
    private int absentCount;
    private int lateCount;
    private double attendancePercentage;

    // Constructors
    public AttendanceSummary() {}

    public AttendanceSummary(Long examId, String courseCode, String courseName,
                             int totalStudents, int presentCount, int absentCount, int lateCount) {
        this.examId = examId;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.totalStudents = totalStudents;
        this.presentCount = presentCount;
        this.absentCount = absentCount;
        this.lateCount = lateCount;
        // Calculate percentage (present + late = attended)
        this.attendancePercentage = totalStudents > 0
                ? ((double)(presentCount + lateCount) / totalStudents) * 100
                : 0.0;
    }

    // Getters and Setters
    public Long getExamId() {
        return examId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
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

    public int getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(int totalStudents) {
        this.totalStudents = totalStudents;
    }

    public int getPresentCount() {
        return presentCount;
    }

    public void setPresentCount(int presentCount) {
        this.presentCount = presentCount;
    }

    public int getAbsentCount() {
        return absentCount;
    }

    public void setAbsentCount(int absentCount) {
        this.absentCount = absentCount;
    }

    public int getLateCount() {
        return lateCount;
    }

    public void setLateCount(int lateCount) {
        this.lateCount = lateCount;
    }

    public double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }
}