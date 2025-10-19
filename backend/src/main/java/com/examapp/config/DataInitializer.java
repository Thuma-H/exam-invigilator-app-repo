package com.examapp.config;

import com.examapp.model.Exam;
import com.examapp.model.Student;
import com.examapp.model.User;
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
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Only initialize if database is empty
        if (userRepository.count() == 0) {
            System.out.println("\n📦 Initializing sample data...\n");

            // Create default users
            createUsers();

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
     * Create default users (invigilators)
     */
    private void createUsers() {
        if (!userRepository.existsByUsername("invigilator1")) {
            User invigilator1 = new User();
            invigilator1.setUsername("invigilator1");
            invigilator1.setPassword(passwordEncoder.encode("password123"));
            invigilator1.setFullName("John Doe");
            invigilator1.setRole("INVIGILATOR");
            userRepository.save(invigilator1);
        }

        if (!userRepository.existsByUsername("invigilator2")) {
            User invigilator2 = new User();
            invigilator2.setUsername("invigilator2");
            invigilator2.setPassword(passwordEncoder.encode("password123"));
            invigilator2.setFullName("Jane Smith");
            invigilator2.setRole("INVIGILATOR");
            userRepository.save(invigilator2);
        }

        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("Admin User");
            admin.setRole("ADMIN");
            userRepository.save(admin);
        }

        System.out.println("✓ Created 3 users (2 invigilators, 1 admin)");
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

        // Exam 1: Software Engineering (today's date for easy testing)
        Exam exam1 = new Exam(
                "BSC121",
                "Software Engineering",
                "Hall A",
                LocalDate.now(), // Today
                LocalTime.of(9, 0),
                180, // 3 hours
                invigilator1
        );
        exam1.setStudents(Arrays.asList(s1, s2, s3, s4, s5));
        examRepository.save(exam1);

        // Exam 2: Database Systems (tomorrow)
        Exam exam2 = new Exam(
                "BSC122",
                "Database Systems",
                "Hall B",
                LocalDate.now().plusDays(1),
                LocalTime.of(14, 0),
                120, // 2 hours
                invigilator1
        );
        exam2.setStudents(Arrays.asList(s1, s3, s5, s6, s7));
        examRepository.save(exam2);

        // Exam 3: Data Structures (in 3 days)
        Exam exam3 = new Exam(
                "BSC123",
                "Data Structures and Algorithms",
                "Lab C",
                LocalDate.now().plusDays(3),
                LocalTime.of(10, 0),
                150,
                invigilator2
        );
        exam3.setStudents(Arrays.asList(s2, s4, s6, s8));
        examRepository.save(exam3);

        // Exam 4: Computer Networks (in 5 days)
        Exam exam4 = new Exam(
                "BSC124",
                "Computer Networks",
                "Hall A",
                LocalDate.now().plusDays(5),
                LocalTime.of(9, 0),
                180,
                invigilator1
        );
        exam4.setStudents(Arrays.asList(s1, s2, s3, s4, s5, s6, s7, s8));
        examRepository.save(exam4);

        System.out.println("✓ Created 4 exams with enrolled students");
    }
}