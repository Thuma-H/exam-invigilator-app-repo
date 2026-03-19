-- =============================================================================
-- V3__seed_rooms_and_invigilators.sql
-- Populates the database with 5 sample rooms and 10 sample invigilators.
--
-- Passwords: every invigilator uses BCrypt hash of "password123".
-- The hash below was generated with BCryptPasswordEncoder(10).
-- In production, passwords should be set via the registration API.
-- =============================================================================

-- ─── 5 SAMPLE ROOMS ────────────────────────────────────────────────────────
-- Covers a realistic spread: lecture theatres, labs, and a large hall
-- across two campus buildings and multiple floors.
INSERT OR IGNORE INTO rooms (room_name, capacity, building, floor) VALUES
    ('LT-001', 120, 'Science Block',       1),   -- large lecture theatre
    ('LT-002',  80, 'Science Block',       2),   -- medium lecture theatre
    ('LAB-A',   40, 'Engineering Block',    1),   -- computer / practical lab
    ('LAB-B',   40, 'Engineering Block',    1),   -- second lab, same floor
    ('MAIN-HALL', 300, 'Administration',    0);   -- exam hall for large cohorts

-- ─── 10 SAMPLE INVIGILATORS ────────────────────────────────────────────────
-- All get role = 'INVIGILATOR'. Usernames follow the pattern: first initial + surname.
-- BCrypt hash for "password123" (cost 10):
--   $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- Using a fixed hash so the seed file is deterministic and testable.

INSERT OR IGNORE INTO users (username, password, full_name, email, department, role) VALUES
    ('jdoe',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Dr. John Doe',
     'john.doe@university.ac.zm',
     'Computer Science',
     'INVIGILATOR'),

    ('jsmith',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Dr. Jane Smith',
     'jane.smith@university.ac.zm',
     'Computer Science',
     'INVIGILATOR'),

    ('rwilson',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Prof. Robert Wilson',
     'robert.wilson@university.ac.zm',
     'Mathematics',
     'INVIGILATOR'),

    ('ebrown',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Dr. Emily Brown',
     'emily.brown@university.ac.zm',
     'Information Technology',
     'INVIGILATOR'),

    ('mdavis',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Dr. Michael Davis',
     'michael.davis@university.ac.zm',
     'Software Engineering',
     'INVIGILATOR'),

    ('achen',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Dr. Alice Chen',
     'alice.chen@university.ac.zm',
     'Physics',
     'INVIGILATOR'),

    ('kpatel',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Dr. Kumar Patel',
     'kumar.patel@university.ac.zm',
     'Electrical Engineering',
     'INVIGILATOR'),

    ('sgarcia',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Prof. Sofia Garcia',
     'sofia.garcia@university.ac.zm',
     'Chemistry',
     'INVIGILATOR'),

    ('tmoyo',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Dr. Thabo Moyo',
     'thabo.moyo@university.ac.zm',
     'Civil Engineering',
     'INVIGILATOR'),

    ('nmulenga',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Dr. Natasha Mulenga',
     'natasha.mulenga@university.ac.zm',
     'Biology',
     'INVIGILATOR');

