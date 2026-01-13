package com.examapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${librarian.email}")
    private String librarianEmail;

    /**
     * Send new student registration notification to librarian
     */
    public void notifyNewStudent(String studentId, String fullName, String program) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(librarianEmail);
            message.setSubject("New Student ID Card Request - " + studentId);
            message.setText(
                    "A new student has been registered:\n\n" +
                            "Student ID: " + studentId + "\n" +
                            "Name: " + fullName + "\n" +
                            "Program: " + program + "\n\n" +
                            "Please print their ID card with barcode.\n" +
                            "Barcode can be downloaded from: http://localhost:8080/api/barcode/download/" + studentId
            );

            mailSender.send(message);
            System.out.println("✅ Email sent to librarian for student: " + studentId);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email: " + e.getMessage());
        }
    }
}