package com.examapp.service;

import com.examapp.dto.ConflictDetectionResponse;
import com.examapp.dto.ExamCreateRequest;
import com.examapp.dto.ExamSchedulerResponse;
import com.examapp.dto.ScheduleConflictResponse;
import com.examapp.model.Exam;
import com.examapp.model.Room;
import com.examapp.model.Student;
import com.examapp.model.User;
import com.examapp.repository.ExamRepository;
import com.examapp.repository.RoomRepository;
import com.examapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * ExamService — business logic for exam scheduling.
 *
 * Conflict detection uses a two-step approach:
 *   1. JPQL query fetches candidates where existingStart < proposedEnd
 *   2. Java post-filter keeps only rows where proposedStart < existingEnd
 * This correctly implements the interval-overlap formula and stays portable
 * across SQLite, H2, and PostgreSQL (no DB-specific time arithmetic).
 */
@Service
public class ExamService {

    @Autowired private ExamRepository examRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private RoomRepository roomRepository;

    // ── Helper: complete the overlap check in Java ──────────────────────────
    private List<Exam> filterActualOverlaps(List<Exam> candidates, LocalTime proposedStart) {
        return candidates.stream()
                .filter(e -> {
                    LocalTime existingEnd = e.getStartTime().plusMinutes(e.getDuration());
                    return proposedStart.isBefore(existingEnd);
                })
                .collect(Collectors.toList());
    }

    // ── Helper: resolve Room from roomId or venue name ─────────────────────
    /**
     * The frontend may send either a numeric roomId or a string venue name.
     * This helper resolves both to a Room entity. If only a venue string is
     * provided and no matching room exists, a new room is created automatically.
     */
    private Room resolveRoom(ExamCreateRequest request) {
        // Prefer explicit roomId when present
        if (request.getRoomId() != null) {
            return roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found with ID: " + request.getRoomId()));
        }

        // Fall back to venue name lookup
        if (request.getVenue() != null && !request.getVenue().isBlank()) {
            return roomRepository.findByRoomName(request.getVenue())
                    .orElseGet(() -> {
                        // Auto-create the room so the scheduler never fails on unknown venue
                        Room newRoom = new Room(request.getVenue(), 100, "Unassigned");
                        return roomRepository.save(newRoom);
                    });
        }

        throw new RuntimeException("Either roomId or venue is required");
    }

    // ── Read operations ────────────────────────────────────────────────────

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

    /**
     * Get all exams in a specific room on a specific date
     * @param roomId - room ID
     * @param examDate - exam date
     * @return list of exams
     */
    public List<Exam> getExamsInRoomByDate(Long roomId, LocalDate examDate) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found with ID: " + roomId));
        return examRepository.findByRoomAndExamDate(room, examDate);
    }

    // ── Simple create (used by DataInitializer) ────────────────────────────
    /**
     * Create a new exam (admin function)
     * @param exam - exam object to save
     * @return saved exam
     */
    public Exam createExam(Exam exam) {
        return examRepository.save(exam);
    }

    // ══════════════════════════════════════════════════════════════════════
    // SCHEDULER ENDPOINTS — return ExamSchedulerResponse for the frontend
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Create a new exam from the scheduler form.
     * Resolves room from roomId or venue name, validates for conflicts,
     * persists the exam, and returns a flat DTO the frontend can consume.
     */
    public ExamSchedulerResponse createScheduledExam(ExamCreateRequest request) {
        Room room = resolveRoom(request);

        User invigilator = userRepository.findById(request.getInvigilatorId())
                .orElseThrow(() -> new RuntimeException(
                        "Invigilator not found with ID: " + request.getInvigilatorId()));

        LocalTime proposedEnd = request.getStartTime().plusMinutes(request.getDuration());

        // ── Room conflicts ─────────────────────────────────────────────
        List<Exam> roomConflicts = filterActualOverlaps(
                examRepository.findPotentialRoomConflicts(room, request.getExamDate(), proposedEnd),
                request.getStartTime());
        if (!roomConflicts.isEmpty()) {
            Exam c = roomConflicts.get(0);
            throw new ConflictException(String.format(
                    "Room %s already has '%s' on %s from %s to %s",
                    room.getRoomName(), c.getCourseName(), c.getExamDate(),
                    c.getStartTime(), c.getStartTime().plusMinutes(c.getDuration())));
        }

        // ── Invigilator conflicts ──────────────────────────────────────
        List<Exam> invConflicts = filterActualOverlaps(
                examRepository.findPotentialInvigilatorConflicts(invigilator, request.getExamDate(), proposedEnd),
                request.getStartTime());
        if (!invConflicts.isEmpty()) {
            Exam c = invConflicts.get(0);
            throw new ConflictException(String.format(
                    "Invigilator %s is already assigned to '%s' on %s from %s to %s",
                    invigilator.getFullName(), c.getCourseName(), c.getExamDate(),
                    c.getStartTime(), c.getStartTime().plusMinutes(c.getDuration())));
        }

        // ── Persist ────────────────────────────────────────────────────
        Exam exam = new Exam();
        exam.setCourseCode(request.getCourseCode());
        exam.setCourseName(request.getCourseName());
        exam.setRoom(room);
        exam.setVenue(room.getRoomName());
        exam.setExamDate(request.getExamDate());
        exam.setStartTime(request.getStartTime());
        exam.setDuration(request.getDuration());
        exam.setInvigilator(invigilator);
        exam.setStatus("SCHEDULED");

        Exam saved = examRepository.save(exam);
        return ExamSchedulerResponse.fromExam(saved);
    }

    /**
     * Update an existing exam from the scheduler form.
     * Excludes the exam being updated from the conflict check.
     */
    public ExamSchedulerResponse updateScheduledExam(Long examId, ExamCreateRequest request) {
        Exam existing = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found with ID: " + examId));

        Room room = resolveRoom(request);
        User invigilator = userRepository.findById(request.getInvigilatorId())
                .orElseThrow(() -> new RuntimeException(
                        "Invigilator not found with ID: " + request.getInvigilatorId()));

        LocalTime proposedEnd = request.getStartTime().plusMinutes(request.getDuration());

        // Room conflicts (exclude self)
        List<Exam> roomConflicts = filterActualOverlaps(
                examRepository.findPotentialRoomConflicts(room, request.getExamDate(), proposedEnd),
                request.getStartTime());
        roomConflicts.removeIf(e -> e.getId().equals(examId));
        if (!roomConflicts.isEmpty()) {
            Exam c = roomConflicts.get(0);
            throw new ConflictException(String.format(
                    "Room %s already has '%s' on %s from %s to %s",
                    room.getRoomName(), c.getCourseName(), c.getExamDate(),
                    c.getStartTime(), c.getStartTime().plusMinutes(c.getDuration())));
        }

        // Invigilator conflicts (exclude self)
        List<Exam> invConflicts = filterActualOverlaps(
                examRepository.findPotentialInvigilatorConflicts(invigilator, request.getExamDate(), proposedEnd),
                request.getStartTime());
        invConflicts.removeIf(e -> e.getId().equals(examId));
        if (!invConflicts.isEmpty()) {
            Exam c = invConflicts.get(0);
            throw new ConflictException(String.format(
                    "Invigilator %s is already assigned to '%s' on %s from %s to %s",
                    invigilator.getFullName(), c.getCourseName(), c.getExamDate(),
                    c.getStartTime(), c.getStartTime().plusMinutes(c.getDuration())));
        }

        // Apply updates
        existing.setCourseCode(request.getCourseCode());
        existing.setCourseName(request.getCourseName());
        existing.setRoom(room);
        existing.setVenue(room.getRoomName());
        existing.setExamDate(request.getExamDate());
        existing.setStartTime(request.getStartTime());
        existing.setDuration(request.getDuration());
        existing.setInvigilator(invigilator);

        Exam updated = examRepository.save(existing);
        return ExamSchedulerResponse.fromExam(updated);
    }

    /**
     * Delete an exam by ID.
     */
    public void deleteExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found with ID: " + examId));
        examRepository.delete(exam);
    }

    // ══════════════════════════════════════════════════════════════════════
    // GLOBAL CONFLICT DETECTION — scans all exams pair-wise
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Detect all scheduling conflicts across every exam in the system.
     *
     * Algorithm:
     *   For each pair (i, j) where i < j:
     *     1. Check if time windows overlap: start_i < end_j AND start_j < end_i
     *     2. If overlap AND same invigilator → SAME_INVIGILATOR conflict
     *     3. If overlap AND same venue/room  → SAME_VENUE conflict
     *
     * Returns a response the frontend can consume directly.
     */
    public ScheduleConflictResponse detectAllConflicts() {
        ScheduleConflictResponse response = new ScheduleConflictResponse();
        List<Exam> allExams = examRepository.findAll();

        for (int i = 0; i < allExams.size(); i++) {
            for (int j = i + 1; j < allExams.size(); j++) {
                Exam a = allExams.get(i);
                Exam b = allExams.get(j);

                // Both must be on the same date to conflict
                if (!a.getExamDate().equals(b.getExamDate())) continue;

                // Check time overlap: startA < endB AND startB < endA
                LocalTime endA = a.getStartTime().plusMinutes(a.getDuration());
                LocalTime endB = b.getStartTime().plusMinutes(b.getDuration());
                boolean overlaps = a.getStartTime().isBefore(endB) && b.getStartTime().isBefore(endA);
                if (!overlaps) continue;

                // Same invigilator?
                if (a.getInvigilator() != null && b.getInvigilator() != null
                        && a.getInvigilator().getId().equals(b.getInvigilator().getId())) {
                    response.addConflict(a.getId(), b.getId(), "SAME_INVIGILATOR",
                            String.format("Invigilator %s assigned to overlapping exams '%s' and '%s'",
                                    a.getInvigilator().getFullName(),
                                    a.getCourseName(), b.getCourseName()));
                }

                // Same venue / room?
                if (a.getRoom() != null && b.getRoom() != null
                        && a.getRoom().getId().equals(b.getRoom().getId())) {
                    response.addConflict(a.getId(), b.getId(), "SAME_VENUE",
                            String.format("Room %s used by overlapping exams '%s' and '%s'",
                                    a.getRoom().getRoomName(),
                                    a.getCourseName(), b.getCourseName()));
                }
            }
        }

        return response;
    }

    // ══════════════════════════════════════════════════════════════════════
    // LEGACY — kept for backward compatibility with existing callers
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Create a new exam from request DTO with conflict detection
     * @param request - exam creation request
     * @return ConflictDetectionResponse with result
     * @throws RuntimeException if room or invigilator not found
     */
    public ConflictDetectionResponse createExamWithConflictDetection(ExamCreateRequest request) {
        ConflictDetectionResponse response = new ConflictDetectionResponse();

        Room room = resolveRoom(request);
        User invigilator = userRepository.findById(request.getInvigilatorId())
                .orElseThrow(() -> new RuntimeException("Invigilator not found with ID: " + request.getInvigilatorId()));

        LocalTime proposedEnd = request.getStartTime().plusMinutes(request.getDuration());

        List<Exam> roomConflicts = filterActualOverlaps(
                examRepository.findPotentialRoomConflicts(room, request.getExamDate(), proposedEnd),
                request.getStartTime());
        for (Exam exam : roomConflicts) {
            response.addRoomConflict(String.format(
                    "Room %s already has %s (%s) from %s to %s",
                    room.getRoomName(), exam.getCourseName(), exam.getCourseCode(),
                    exam.getStartTime(), exam.getStartTime().plusMinutes(exam.getDuration())));
        }

        List<Exam> invConflicts = filterActualOverlaps(
                examRepository.findPotentialInvigilatorConflicts(invigilator, request.getExamDate(), proposedEnd),
                request.getStartTime());
        for (Exam exam : invConflicts) {
            response.addInvigilatorConflict(String.format(
                    "%s is already assigned to %s (%s) from %s to %s",
                    invigilator.getUsername(), exam.getCourseName(), exam.getCourseCode(),
                    exam.getStartTime(), exam.getStartTime().plusMinutes(exam.getDuration())));
        }

        if (response.hasConflict()) {
            response.setMessage("Scheduling conflict detected. Please resolve conflicts before creating exam.");
            return response;
        }

        Exam newExam = new Exam();
        newExam.setCourseCode(request.getCourseCode());
        newExam.setCourseName(request.getCourseName());
        newExam.setRoom(room);
        newExam.setVenue(room.getRoomName());
        newExam.setExamDate(request.getExamDate());
        newExam.setStartTime(request.getStartTime());
        newExam.setDuration(request.getDuration());
        newExam.setInvigilator(invigilator);

        Exam saved = examRepository.save(newExam);
        response.setHasConflict(false);
        response.setMessage("Exam created successfully with ID: " + saved.getId());
        return response;
    }

    /**
     * Update an existing exam with conflict detection
     * @param examId - exam ID to update
     * @param request - exam creation request with new values
     * @return ConflictDetectionResponse with result
     * @throws RuntimeException if exam, room, or invigilator not found
     */
    public ConflictDetectionResponse updateExamWithConflictDetection(Long examId, ExamCreateRequest request) {
        ConflictDetectionResponse response = new ConflictDetectionResponse();

        Exam existingExam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found with ID: " + examId));
        Room room = resolveRoom(request);
        User invigilator = userRepository.findById(request.getInvigilatorId())
                .orElseThrow(() -> new RuntimeException("Invigilator not found with ID: " + request.getInvigilatorId()));

        LocalTime proposedEnd = request.getStartTime().plusMinutes(request.getDuration());

        List<Exam> roomConflicts = filterActualOverlaps(
                examRepository.findPotentialRoomConflicts(room, request.getExamDate(), proposedEnd),
                request.getStartTime());
        roomConflicts.removeIf(e -> e.getId().equals(examId));
        for (Exam exam : roomConflicts) {
            response.addRoomConflict(String.format(
                    "Room %s already has %s (%s) from %s to %s",
                    room.getRoomName(), exam.getCourseName(), exam.getCourseCode(),
                    exam.getStartTime(), exam.getStartTime().plusMinutes(exam.getDuration())));
        }

        List<Exam> invConflicts = filterActualOverlaps(
                examRepository.findPotentialInvigilatorConflicts(invigilator, request.getExamDate(), proposedEnd),
                request.getStartTime());
        invConflicts.removeIf(e -> e.getId().equals(examId));
        for (Exam exam : invConflicts) {
            response.addInvigilatorConflict(String.format(
                    "%s is already assigned to %s (%s) from %s to %s",
                    invigilator.getUsername(), exam.getCourseName(), exam.getCourseCode(),
                    exam.getStartTime(), exam.getStartTime().plusMinutes(exam.getDuration())));
        }

        if (response.hasConflict()) {
            response.setMessage("Scheduling conflict detected. Please resolve conflicts before updating exam.");
            return response;
        }

        existingExam.setCourseCode(request.getCourseCode());
        existingExam.setCourseName(request.getCourseName());
        existingExam.setRoom(room);
        existingExam.setVenue(room.getRoomName());
        existingExam.setExamDate(request.getExamDate());
        existingExam.setStartTime(request.getStartTime());
        existingExam.setDuration(request.getDuration());
        existingExam.setInvigilator(invigilator);

        Exam updated = examRepository.save(existingExam);
        response.setHasConflict(false);
        response.setMessage("Exam updated successfully with ID: " + updated.getId());
        return response;
    }

    // ── Custom exception for scheduling conflicts ──────────────────────
    public static class ConflictException extends RuntimeException {
        public ConflictException(String message) { super(message); }
    }
}

