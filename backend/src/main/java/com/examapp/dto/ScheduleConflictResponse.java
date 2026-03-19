package com.examapp.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * ScheduleConflictResponse — returned by GET /api/exams/conflict-detection.
 *
 * The frontend reads:
 *   { hasConflicts: true, conflicts: [ { examId1, examId2, conflictType, message } ] }
 *
 * conflictType is either "SAME_INVIGILATOR" or "SAME_VENUE".
 */
public class ScheduleConflictResponse {

    private boolean hasConflicts;
    private List<ConflictItem> conflicts = new ArrayList<>();

    // ── Inner class for a single conflict pair ─────────────────────────
    public static class ConflictItem {
        private Long examId1;
        private Long examId2;
        private String conflictType; // "SAME_INVIGILATOR" or "SAME_VENUE"
        private String message;

        public ConflictItem() {}

        public ConflictItem(Long examId1, Long examId2, String conflictType, String message) {
            this.examId1 = examId1;
            this.examId2 = examId2;
            this.conflictType = conflictType;
            this.message = message;
        }

        public Long getExamId1() { return examId1; }
        public void setExamId1(Long examId1) { this.examId1 = examId1; }

        public Long getExamId2() { return examId2; }
        public void setExamId2(Long examId2) { this.examId2 = examId2; }

        public String getConflictType() { return conflictType; }
        public void setConflictType(String conflictType) { this.conflictType = conflictType; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    // ── Convenience adder ──────────────────────────────────────────────
    public void addConflict(Long examId1, Long examId2, String conflictType, String message) {
        conflicts.add(new ConflictItem(examId1, examId2, conflictType, message));
        hasConflicts = true;
    }

    // ── Getters / Setters ──────────────────────────────────────────────

    public boolean isHasConflicts() { return hasConflicts; }
    public void setHasConflicts(boolean hasConflicts) { this.hasConflicts = hasConflicts; }

    public List<ConflictItem> getConflicts() { return conflicts; }
    public void setConflicts(List<ConflictItem> conflicts) { this.conflicts = conflicts; }
}

