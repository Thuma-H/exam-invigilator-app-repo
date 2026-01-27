package com.examapp.service;

import com.examapp.dto.AttendanceRequest;
import com.examapp.dto.AttendanceSummary;
import com.examapp.model.Attendance;
import com.examapp.model.Exam;
import com.examapp.model.Student;
import com.examapp.repository.AttendanceRepository;
import com.examapp.repository.ExamRepository;
import com.examapp.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * AttendanceService - handles attendance tracking and reporting.
 * Manages marking attendance and generating summaries.
 *
 * NEW: Sends notification emails when attendance is marked
 */
@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Mark student attendance for an exam
     * @param request - attendance details (examId, studentId, status, method)
     * @param markedBy - username of invigilator marking attendance
     * @return saved attendance record
     */
    public Attendance markAttendance(AttendanceRequest request, String markedBy) {
        // Get exam and student from database
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Check if attendance already marked
        if (attendanceRepository.existsByExamAndStudent(exam, student)) {
            throw new RuntimeException("Attendance already marked for this student");
        }

        // Create and save attendance record
        Attendance attendance = new Attendance(
                exam,
                student,
                request.getStatus(),
                LocalDateTime.now(),
                markedBy,
                request.getMethod()
        );

        Attendance savedAttendance = attendanceRepository.save(attendance);

        // NEW: Send notification email to student (if they have email)
        if (student.getEmail() != null && !student.getEmail().isEmpty()) {
            emailService.notifyAttendanceMarked(student.getEmail(), exam.getId());
        }

        return savedAttendance;
    }

    /**
     * Get all attendance records for an exam
     * @param examId - exam ID
     * @return list of attendance records
     */
    public List<Attendance> getAttendanceForExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        return attendanceRepository.findByExam(exam);
    }

    /**
     * Generate attendance summary for an exam
     * @param examId - exam ID
     * @return attendance summary with statistics
     */
    public AttendanceSummary getAttendanceSummary(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        // Count students by status
        long presentCount = attendanceRepository.countByExamAndStatus(exam, "PRESENT");
        long absentCount = attendanceRepository.countByExamAndStatus(exam, "ABSENT");
        long lateCount = attendanceRepository.countByExamAndStatus(exam, "LATE");

        int totalStudents = exam.getStudents().size();

        return new AttendanceSummary(
                exam.getId(),
                exam.getCourseCode(),
                exam.getCourseName(),
                totalStudents,
                (int) presentCount,
                (int) absentCount,
                (int) lateCount
        );
    }

    /**
     * Update attendance status (if marking was wrong)
     * @param attendanceId - attendance record ID
     * @param newStatus - new status (PRESENT/ABSENT/LATE)
     * @return updated attendance record
     */
    public Attendance updateAttendanceStatus(Long attendanceId, String newStatus) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));

        attendance.setStatus(newStatus);
        return attendanceRepository.save(attendance);
    }

    /**
     * Get all attendance records marked by a specific invigilator
     * @param username - invigilator's username
     * @return list of attendance records
     */
    public List<Attendance> getAttendanceByInvigilator(String username) {
        return attendanceRepository.findByMarkedBy(username);
    }
}