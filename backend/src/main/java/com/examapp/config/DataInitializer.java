package com.examapp.config;

import com.examapp.model.*;
import com.examapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

/**
 * DataInitializer — seeds the database on first run.
 *
 * Only executes when the users table is empty (fresh database).
 * Creates:
 *   • 10 invigilators + 2 librarians + 1 admin  (users table)
 *   • 5 exam rooms                               (rooms table)
 *   • 5 courses                                   (courses table)
 *   • 8 students                                  (students table)
 *   • 3 sample exams with enrolled students        (exams + junction tables)
 *
 * The migration V3 also inserts rooms and invigilators via SQL.
 * INSERT OR IGNORE ensures no duplicates if both migration and this runner execute.
 */
@Component
@Order(2) // Run after DatabaseMigrationRunner (@Order(1))
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private ExamRepository examRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // ── Always ensure required users exist with correct passwords ───
        // V3 migration may have inserted users with an incorrect BCrypt hash.
        // This method guarantees the right credentials regardless of V3 state.
        ensureUsersExist();

        // Only seed rooms, courses, students, exams on first run
        if (examRepository.count() == 0) {
            System.out.println("\n Initializing sample data...\n");

            if (roomRepository.count() == 0) {
                createRooms();
            } else {
                System.out.println("  Rooms already seeded by migration V3");
            }

            createCourses();
            createStudents();
            createExams();

            System.out.println("\n Sample data created successfully!");
            System.out.println(" Default Login: invigilator1 / password123\n");
        }
    }

    // ─── 5 SAMPLE ROOMS ────────────────────────────────────────────────────
    // These mirror the V3 migration seed but are created via JPA so the
    // in-memory IDs are available for wiring exams below.
    private void createRooms() {
        if (roomRepository.count() > 0) return; // Flyway may have seeded already

        roomRepository.saveAll(Arrays.asList(
            new Room("LT-001",    120, "Science Block",       1),
            new Room("LT-002",     80, "Science Block",       2),
            new Room("LAB-A",      40, "Engineering Block",   1),
            new Room("LAB-B",      40, "Engineering Block",   1),
            new Room("MAIN-HALL", 300, "Administration",      0)
        ));
        System.out.println("✓ Created 5 rooms");
    }

    // ─── ENSURE ALL REQUIRED USERS EXIST WITH CORRECT PASSWORDS ──────────
    /**
     * Creates missing users and re-hashes passwords for existing users.
     *
     * The V3 migration inserts users via raw SQL with a hardcoded BCrypt hash.
     * That hash may not match "password123" depending on how it was generated.
     * This method is the single source of truth for test credentials — it
     * runs on EVERY startup and guarantees login will work.
     */
    private void ensureUsersExist() {
        System.out.println("\n  Ensuring all users have correct credentials...");
        int created = 0;
        int fixed = 0;

        String hash123 = passwordEncoder.encode("password123");

        // 10 Invigilators — different departments across the university
        String[][] invigilators = {
            {"jdoe",     "Dr. John Doe",         "john.doe@university.ac.zm",      "Computer Science"},
            {"jsmith",   "Dr. Jane Smith",       "jane.smith@university.ac.zm",    "Computer Science"},
            {"rwilson",  "Prof. Robert Wilson",  "robert.wilson@university.ac.zm", "Mathematics"},
            {"ebrown",   "Dr. Emily Brown",      "emily.brown@university.ac.zm",   "Information Technology"},
            {"mdavis",   "Dr. Michael Davis",    "michael.davis@university.ac.zm", "Software Engineering"},
            {"achen",    "Dr. Alice Chen",       "alice.chen@university.ac.zm",    "Physics"},
            {"kpatel",   "Dr. Kumar Patel",      "kumar.patel@university.ac.zm",   "Electrical Engineering"},
            {"sgarcia",  "Prof. Sofia Garcia",   "sofia.garcia@university.ac.zm",  "Chemistry"},
            {"tmoyo",    "Dr. Thabo Moyo",       "thabo.moyo@university.ac.zm",    "Civil Engineering"},
            {"nmulenga", "Dr. Natasha Mulenga",  "natasha.mulenga@university.ac.zm","Biology"}
        };

        for (String[] inv : invigilators) {
            var result = ensureUser(inv[0], hash123, inv[1], "INVIGILATOR", inv[2], inv[3]);
            if ("created".equals(result)) created++;
            else if ("fixed".equals(result)) fixed++;
        }

        // Legacy usernames so existing login instructions still work
        var r1 = ensureUser("invigilator1", hash123, "John Doe (Legacy)", "INVIGILATOR", null, "Computer Science");
        if ("created".equals(r1)) created++; else if ("fixed".equals(r1)) fixed++;

        var r2 = ensureUser("invigilator2", hash123, "Jane Smith (Legacy)", "INVIGILATOR", null, "Computer Science");
        if ("created".equals(r2)) created++; else if ("fixed".equals(r2)) fixed++;

        // 2 Librarians
        var r3 = ensureUser("librarian1", hash123, "Librarian One", "LIBRARIAN", null, null);
        if ("created".equals(r3)) created++; else if ("fixed".equals(r3)) fixed++;

        String hash321 = passwordEncoder.encode("password321");
        var r4 = ensureUser("librarian2", hash321, "Librarian Two", "LIBRARIAN", null, null);
        if ("created".equals(r4)) created++; else if ("fixed".equals(r4)) fixed++;

        // 1 Admin
        String hashAdmin = passwordEncoder.encode("admin123");
        var r5 = ensureUser("admin", hashAdmin, "Admin User", "ADMIN", null, null);
        if ("created".equals(r5)) created++; else if ("fixed".equals(r5)) fixed++;

        System.out.println("  ✓ Users: " + created + " created, " + fixed + " password(s) fixed, "
                + userRepository.count() + " total");
    }

    /**
     * Ensure a single user exists with the correct password hash.
     * @return "created" if new, "fixed" if password was re-hashed, "ok" if no change needed
     */
    private String ensureUser(String username, String hashedPassword, String fullName,
                              String role, String email, String department) {
        var existing = userRepository.findByUsername(username);
        if (existing.isPresent()) {
            User user = existing.get();
            // Re-hash: if the stored password doesn't validate, overwrite it
            // This fixes the V3 migration bad-hash problem
            if (!passwordEncoder.matches("password123", user.getPassword())
                    && !"librarian2".equals(username) && !"admin".equals(username)) {
                user.setPassword(hashedPassword);
                userRepository.save(user);
                return "fixed";
            }
            // For librarian2 (password321) and admin (admin123), check their specific passwords
            if ("librarian2".equals(username) && !passwordEncoder.matches("password321", user.getPassword())) {
                user.setPassword(hashedPassword);
                userRepository.save(user);
                return "fixed";
            }
            if ("admin".equals(username) && !passwordEncoder.matches("admin123", user.getPassword())) {
                user.setPassword(hashedPassword);
                userRepository.save(user);
                return "fixed";
            }
            return "ok";
        }

        // User doesn't exist — create it
        User u = new User(username, hashedPassword, fullName, role);
        if (email != null) u.setEmail(email);
        if (department != null) u.setDepartment(department);
        userRepository.save(u);
        return "created";
    }

    // ─── 5 COURSES ─────────────────────────────────────────────────────────
    private void createCourses() {
        courseRepository.saveAll(Arrays.asList(
            new Course("BSC121", "Software Engineering",            "Computer Science",        3, "Dr. John Smith"),
            new Course("BSC122", "Database Systems",                "Computer Science",        3, "Dr. Jane Doe"),
            new Course("BSC123", "Data Structures and Algorithms",  "Computer Science",        4, "Dr. Robert Johnson"),
            new Course("BSC124", "Computer Networks",               "Information Technology",   3, "Dr. Emily Brown"),
            new Course("BSC125", "Web Development",                 "Software Engineering",     3, "Dr. Michael Davis")
        ));
        System.out.println("✓ Created 5 courses");
    }

    // ─── 8 STUDENTS ────────────────────────────────────────────────────────
    private void createStudents() {
        studentRepository.saveAll(Arrays.asList(
            new Student("BCS25165336", "Alice Smith",      "Computer Science"),
            new Student("BCS25165337", "Bob Johnson",      "Computer Science"),
            new Student("BCS25165338", "Carol Williams",   "Information Technology"),
            new Student("BCS25165339", "David Brown",      "Software Engineering"),
            new Student("BCS25165340", "Eve Davis",        "Computer Science"),
            new Student("BCS25165341", "Frank Miller",     "Computer Science"),
            new Student("BCS25165342", "Grace Lee",        "Information Technology"),
            new Student("BCS25165343", "Henry Wilson",     "Software Engineering")
        ));
        System.out.println("✓ Created 8 students");
    }

    // ─── 3 SAMPLE EXAMS ───────────────────────────────────────────────────
    // Wires exams to rooms via the Room FK and assigns invigilators both
    // via the legacy single-invigilator column AND the junction table.
    private void createExams() {
        // Fetch entities we need to reference
        User jdoe   = userRepository.findByUsername("jdoe").orElseThrow();
        User jsmith = userRepository.findByUsername("jsmith").orElseThrow();
        User rwilson = userRepository.findByUsername("rwilson").orElseThrow();

        Room lt001    = roomRepository.findByRoomName("LT-001").orElseThrow();
        Room lt002    = roomRepository.findByRoomName("LT-002").orElseThrow();
        Room mainHall = roomRepository.findByRoomName("MAIN-HALL").orElseThrow();

        List<Student> allStudents = studentRepository.findAll();

        // Exam 1 — Software Engineering, today, ongoing
        Exam exam1 = new Exam();
        exam1.setCourseCode("BSC121");
        exam1.setCourseName("Software Engineering");
        exam1.setRoom(lt001);
        exam1.setVenue(lt001.getRoomName());
        exam1.setExamDate(LocalDate.now());
        exam1.setStartTime(LocalTime.now().minusMinutes(5)); // started 5 min ago
        exam1.setDuration(180);
        exam1.setStatus("ACTIVE");
        exam1.setInvigilator(jdoe);                           // primary (legacy)
        exam1.setInvigilators(Arrays.asList(jdoe, jsmith));   // junction table
        exam1.setStudents(allStudents);
        examRepository.save(exam1);

        // Exam 2 — Database Systems, tomorrow morning
        Exam exam2 = new Exam();
        exam2.setCourseCode("BSC122");
        exam2.setCourseName("Database Systems");
        exam2.setRoom(lt002);
        exam2.setVenue(lt002.getRoomName());
        exam2.setExamDate(LocalDate.now().plusDays(1));
        exam2.setStartTime(LocalTime.of(9, 0));
        exam2.setDuration(120);
        exam2.setStatus("SCHEDULED");
        exam2.setInvigilator(jsmith);
        exam2.setInvigilators(Arrays.asList(jsmith));
        exam2.setStudents(allStudents.subList(0, 5));
        examRepository.save(exam2);

        // Exam 3 — Data Structures, tomorrow afternoon in the main hall
        Exam exam3 = new Exam();
        exam3.setCourseCode("BSC123");
        exam3.setCourseName("Data Structures and Algorithms");
        exam3.setRoom(mainHall);
        exam3.setVenue(mainHall.getRoomName());
        exam3.setExamDate(LocalDate.now().plusDays(1));
        exam3.setStartTime(LocalTime.of(14, 0));
        exam3.setDuration(150);
        exam3.setStatus("SCHEDULED");
        exam3.setInvigilator(rwilson);
        exam3.setInvigilators(Arrays.asList(rwilson, jdoe));
        exam3.setStudents(allStudents.subList(3, 8));
        examRepository.save(exam3);

        System.out.println("✓ Created 3 exams with enrolled students and assigned invigilators");
    }
}