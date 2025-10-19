package com.examapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ExamInvigilatorApplication - Main entry point for the Spring Boot application.
 * This class starts the embedded Tomcat server and initializes all components.
 *
 * To run: Right-click this file in IntelliJ and select "Run"
 * Server will start on http://localhost:8080
 */
@SpringBootApplication
public class ExamInvigilatorApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExamInvigilatorApplication.class, args);
        System.out.println("\n===========================================");
        System.out.println("✅ Exam Invigilator API is running!");
        System.out.println("📍 Server: http://localhost:8080");
        System.out.println("📚 API Base: http://localhost:8080/api");
        System.out.println("===========================================\n");
    }
}