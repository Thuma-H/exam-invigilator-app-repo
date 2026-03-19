-- =============================================================================
-- V1__create_core_tables.sql
-- Creates the foundational tables: rooms, users (invigilators), and exams
-- These are the three pillars of the scheduling system
-- =============================================================================

-- ─── ROOMS ──────────────────────────────────────────────────────────────────
-- Represents physical exam venues with capacity constraints.
-- Every exam must be assigned to exactly one room.
CREATE TABLE IF NOT EXISTS rooms (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    room_name   TEXT    NOT NULL UNIQUE,          -- e.g. "LT-001", "Main Hall"
    capacity    INTEGER NOT NULL CHECK (capacity > 0),
    building    TEXT    NOT NULL,                  -- e.g. "Science Block"
    floor       INTEGER                           -- nullable, ground floor = 0
);

-- ─── USERS (INVIGILATORS / ADMINS / LIBRARIANS) ────────────────────────────
-- Stores all system users. The 'role' column distinguishes invigilators
-- from admins and librarians. Passwords are BCrypt-hashed by the app layer.
CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,                  -- BCrypt hash
    full_name   TEXT    NOT NULL,
    email       TEXT,                              -- contact email
    department  TEXT,                              -- academic department
    role        TEXT    NOT NULL DEFAULT 'INVIGILATOR'
                        CHECK (role IN ('INVIGILATOR','ADMIN','LIBRARIAN'))
);

-- ─── EXAMS ──────────────────────────────────────────────────────────────────
-- Central scheduling table. Links a course to a room, date, and time window.
-- 'status' tracks the exam lifecycle (SCHEDULED → ACTIVE → COMPLETED/CANCELLED).
-- 'max_students' caps enrollment; if NULL the room capacity is the limit.
-- 'invigilator_id' is the PRIMARY invigilator (legacy single-assign column).
CREATE TABLE IF NOT EXISTS exams (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    course_code     TEXT    NOT NULL,              -- e.g. "BSC121"
    course_name     TEXT    NOT NULL,
    venue           TEXT,                          -- kept for backward compat
    exam_date       TEXT    NOT NULL,              -- ISO-8601 date "2026-06-15"
    start_time      TEXT    NOT NULL,              -- ISO-8601 time "09:00:00"
    duration        INTEGER NOT NULL CHECK (duration > 0), -- minutes
    status          TEXT    NOT NULL DEFAULT 'SCHEDULED'
                            CHECK (status IN ('SCHEDULED','ACTIVE','COMPLETED','CANCELLED')),
    max_students    INTEGER,                       -- NULL = use room capacity
    room_id         INTEGER NOT NULL,
    invigilator_id  INTEGER NOT NULL,              -- primary invigilator (legacy FK)
    FOREIGN KEY (room_id)        REFERENCES rooms(id) ON DELETE RESTRICT,
    FOREIGN KEY (invigilator_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- ─── PERFORMANCE INDEXES ────────────────────────────────────────────────────
-- These cover the three most common query patterns:
--   1. "What exams are on this date?"           → idx_exams_date
--   2. "What exams are in this room?"           → idx_exams_room_id
--   3. "What exams start at this time on date?" → idx_exams_date_start_time
-- The composite index (date + start_time) is critical for the overlap /
-- conflict-detection query that must run on every create & update.
CREATE INDEX IF NOT EXISTS idx_exams_date            ON exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_exams_room_id         ON exams(room_id);
CREATE INDEX IF NOT EXISTS idx_exams_start_time      ON exams(start_time);
CREATE INDEX IF NOT EXISTS idx_exams_date_start_time ON exams(exam_date, start_time);
CREATE INDEX IF NOT EXISTS idx_exams_invigilator     ON exams(invigilator_id);

