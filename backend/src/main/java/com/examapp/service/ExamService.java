package com.examapp.service;

import com.examapp.model.Exam;
import com.examapp.model.Student;
import com.examapp.model.User;
import com.examapp.repository.ExamRepository;
import com.examapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * ExamService - handles exam-related business logic.
 * Manages exam schedules, assignments, and student lists.
 */
@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all exams assigned to a specific invigilator
     * @param username - invigilator's username
     * @return list of exams
     */
    public List<Exam> getExamsForInvigilator(String username) {
        User invigilator = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invigilator not found"));
        return examRepository.findByInvigilator(invigilator);
    }

    /**
     * Get exams for an invigilator on a specific date
     * @param username - invigilator's username
     * @param date - exam date
     * @return list of exams on that date
     */
    public List<Exam> getExamsForInvigilatorByDate(String username, LocalDate date) {
        User invigilator = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invigilator not found"));
        return examRepository.findByInvigilatorAndExamDate(invigilator, date);
    }

    /**
     * Get exam by ID
     * @param examId - exam ID
     * @return exam if found
     */
    public Optional<Exam> getExamById(Long examId) {
        return examRepository.findById(examId);
    }

    /**
     * Get all students enrolled in a specific exam
     * @param examId - exam ID
     * @return list of students
     */
    public List<Student> getStudentsForExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        return exam.getStudents();
    }

    /**
     * Create a new exam (admin function)
     * @param exam - exam object to save
     * @return saved exam
     */
    public Exam createExam(Exam exam) {
        return examRepository.save(exam);
    }

    /**
     * Get all exams (admin function)
     * @return list of all exams
     */
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    /**
     * Get exams by course code
     * @param courseCode - course code (e.g., "BSC121")
     * @return list of exams for that course
     */
    public List<Exam> getExamsByCourseCode(String courseCode) {
        return examRepository.findByCourseCode(courseCode);
    }
}