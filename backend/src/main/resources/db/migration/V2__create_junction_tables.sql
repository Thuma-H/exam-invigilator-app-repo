-- =============================================================================
-- V2__create_junction_tables.sql
-- Creates many-to-many relationship tables:
--   • exam_invigilators — assigns multiple invigilators to a single exam
--   • exam_students     — enrolls students into exams
-- =============================================================================

-- ─── EXAM ↔ INVIGILATORS (many-to-many) ────────────────────────────────────
-- An exam can have several invigilators (lead + assistants), and one
-- invigilator can supervise multiple exams (on different dates / times).
-- The composite PK prevents duplicate assignments.
CREATE TABLE IF NOT EXISTS exam_invigilators (
    exam_id        INTEGER NOT NULL,
    invigilator_id INTEGER NOT NULL,
    PRIMARY KEY (exam_id, invigilator_id),
    FOREIGN KEY (exam_id)        REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (invigilator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Fast lookup: "which exams is invigilator X assigned to?"
CREATE INDEX IF NOT EXISTS idx_exam_invigilators_user ON exam_invigilators(invigilator_id);

-- ─── EXAM ↔ STUDENTS (many-to-many) ────────────────────────────────────────
-- Tracks which students are enrolled in which exams.
-- Used by the attendance / barcode-scanning subsystem.
CREATE TABLE IF NOT EXISTS exam_students (
    exam_id    INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    PRIMARY KEY (exam_id, student_id),
    FOREIGN KEY (exam_id)    REFERENCES exams(id)    ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Fast lookup: "which exams is student Y enrolled in?"
CREATE INDEX IF NOT EXISTS idx_exam_students_student ON exam_students(student_id);

