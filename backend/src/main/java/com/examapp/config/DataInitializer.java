package com.examapp.config;

import com.examapp.model.Course;
import com.examapp.model.Exam;
import com.examapp.model.Student;
import com.examapp.model.User;
import com.examapp.repository.CourseRepository;
import com.examapp.repository.ExamRepository;
import com.examapp.repository.StudentRepository;
import com.examapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;

/**
 * DataInitializer - Automatically creates sample data when application starts.
 * Creates default users, exams, and students for testing.
 * Only runs if database is empty.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Only initialize if database is empty
        if (userRepository.count() == 0) {
            System.out.println("\n📦 Initializing sample data...\n");

            // Create default users
            createUsers();

            // Create sample courses
            createCourses();

            // Create sample students
            createStudents();

            // Create sample exams
            createExams();

            System.out.println("✅ Sample data created successfully!\n");
            System.out.println("🔑 Default Login Credentials:");
            System.out.println("   Username: invigilator1");
            System.out.println("   Password: password123\n");
        }
    }

    /**
     * Create default users (invigilators and librarians)
     */
    private void createUsers() {
        // Invigilators
        User invigilator1 = new User();
        invigilator1.setUsername("invigilator1");
        invigilator1.setPassword(passwordEncoder.encode("password123"));
        invigilator1.setFullName("John Doe");
        invigilator1.setRole("INVIGILATOR");
        userRepository.save(invigilator1);

        User invigilator2 = new User();
        invigilator2.setUsername("invigilator2");
        invigilator2.setPassword(passwordEncoder.encode("password123"));
        invigilator2.setFullName("Jane Smith");
        invigilator2.setRole("INVIGILATOR");
        userRepository.save(invigilator2);

        // Librarians
        User librarian1 = new User();
        librarian1.setUsername("librarian1");
        librarian1.setPassword(passwordEncoder.encode("password123"));
        librarian1.setFullName("Librarian One");
        librarian1.setRole("LIBRARIAN");
        userRepository.save(librarian1);

        User librarian2 = new User();
        librarian2.setUsername("librarian2");
        librarian2.setPassword(passwordEncoder.encode("password321"));
        librarian2.setFullName("Librarian Two");
        librarian2.setRole("LIBRARIAN");
        userRepository.save(librarian2);

        // Admin
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFullName("Admin User");
        admin.setRole("ADMIN");
        userRepository.save(admin);

        System.out.println("✓ Created 5 users (2 invigilators, 2 librarians, 1 admin)");
    }

    /**
     * Create sample courses
     */
    private void createCourses() {
        Course c1 = new Course("BSC121", "Software Engineering", "Computer Science", 3, "Dr. John Smith");
        Course c2 = new Course("BSC122", "Database Systems", "Computer Science", 3, "Dr. Jane Doe");
        Course c3 = new Course("BSC123", "Data Structures and Algorithms", "Computer Science", 4, "Dr. Robert Johnson");
        Course c4 = new Course("BSC124", "Computer Networks", "Information Technology", 3, "Dr. Emily Brown");
        Course c5 = new Course("BSC125", "Web Development", "Software Engineering", 3, "Dr. Michael Davis");

        courseRepository.saveAll(Arrays.asList(c1, c2, c3, c4, c5));

        System.out.println("✓ Created 5 courses");
    }


    /**
     * Create sample students
     */
    private void createStudents() {
        Student s1 = new Student("BCS25165336", "Alice Smith", "Computer Science");
        Student s2 = new Student("BCS25165337", "Bob Johnson", "Computer Science");
        Student s3 = new Student("BCS25165338", "Carol Williams", "Information Technology");
        Student s4 = new Student("BCS25165339", "David Brown", "Software Engineering");
        Student s5 = new Student("BCS25165340", "Eve Davis", "Computer Science");
        Student s6 = new Student("BCS25165341", "Frank Miller", "Computer Science");
        Student s7 = new Student("BCS25165342", "Grace Lee", "Information Technology");
        Student s8 = new Student("BCS25165343", "Henry Wilson", "Software Engineering");

        studentRepository.saveAll(Arrays.asList(s1, s2, s3, s4, s5, s6, s7, s8));

        System.out.println("✓ Created 8 students");
    }

    /**
     * Create sample exams with enrolled students
     */
    private void createExams() {
        User invigilator1 = userRepository.findByUsername("invigilator1").orElseThrow();
        User invigilator2 = userRepository.findByUsername("invigilator2").orElseThrow();

        // Get all students
        Student s1 = studentRepository.findByStudentId("BCS25165336").orElseThrow();
        Student s2 = studentRepository.findByStudentId("BCS25165337").orElseThrow();
        Student s3 = studentRepository.findByStudentId("BCS25165338").orElseThrow();
        Student s4 = studentRepository.findByStudentId("BCS25165339").orElseThrow();
        Student s5 = studentRepository.findByStudentId("BCS25165340").orElseThrow();
        Student s6 = studentRepository.findByStudentId("BCS25165341").orElseThrow();
        Student s7 = studentRepository.findByStudentId("BCS25165342").orElseThrow();
        Student s8 = studentRepository.findByStudentId("BCS25165343").orElseThrow();

        // Single active exam: Software Engineering (today, starting NOW for easy testing)
        Exam exam1 = new Exam(
                "BSC121",
                "Software Engineering",
                "Hall A",
                LocalDate.now(), // Today
                LocalTime.now().minusMinutes(5), // Started 5 mins ago → ONGOING
                180, // 3 hours
                invigilator1
        );
        exam1.setStudents(Arrays.asList(s1, s2, s3, s4, s5, s6, s7, s8));
        examRepository.save(exam1);

        System.out.println("✓ Created 1 active exam (Software Engineering) with 8 enrolled students");
    }
}