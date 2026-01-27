package com.examapp.service;

import com.examapp.model.NotificationLog;
import com.examapp.repository.NotificationLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * EmailService - Sends notification emails (NO SENSITIVE DATA)
 *
 * SECURITY PRINCIPLES:
 * 1. Emails are notifications only - tell user something happened
 * 2. NO student names, IDs, or personal data in email body
 * 3. User must check their account/portal for details
 * 4. All emails logged to notification_logs table
 * 5. Generic messages only - no specific exam/course details
 */
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Value("${librarian.email}")
    private String librarianEmail;

    /**
     * Notify student that their attendance was marked
     * EMAIL CONTAINS: Just a notification, no details
     */
    public void notifyAttendanceMarked(String studentEmail, Long examId) {
        String subject = "Exam Attendance Notification";
        String body =
                "Your exam attendance has been recorded.\n\n" +
                "Check your student portal for details.\n\n" +
                "Do not reply to this email.\n\n" +
                "University Exam System";

        sendEmail(studentEmail, subject, body, "ATTENDANCE_MARKED", examId);
    }

    /**
     * Notify admin/invigilator that an incident was reported
     * EMAIL CONTAINS: Just a notification, no details
     */
    public void notifyIncidentReported(String recipientEmail, Long examId) {
        String subject = "Exam Incident Reported";
        String body =
                "An incident has been reported during an exam.\n\n" +
                "Log in to the system to view details.\n\n" +
                "Do not reply to this email.\n\n" +
                "University Exam System";

        sendEmail(recipientEmail, subject, body, "INCIDENT_REPORTED", examId);
    }

    /**
     * Notify student that their ID card is ready for pickup
     * EMAIL CONTAINS: Just a notification, no details
     */
    public void notifyIdCardReady(String studentEmail) {
        String subject = "Student ID Card Ready";
        String body =
                "Your student ID card is ready for collection.\n\n" +
                "Visit the library during office hours to collect your card.\n" +
                "Bring your student documentation for verification.\n\n" +
                "Do not reply to this email.\n\n" +
                "Library Services";

        sendEmail(studentEmail, subject, body, "ID_CARD_READY", null);
    }

    /**
     * Notify librarian that new ID cards need to be printed
     * EMAIL CONTAINS: Just a count, no student data
     */
    public void notifyLibrarianNewIdCards(int count) {
        String subject = "New ID Cards Pending";
        String body =
                "There are " + count + " new student ID cards pending.\n\n" +
                "Log in to the librarian dashboard to print them.\n\n" +
                "Do not reply to this email.\n\n" +
                "University Exam System";

        sendEmail(librarianEmail, subject, body, "NEW_ID_CARDS_PENDING", null);
    }

    /**
     * Send exam reminder to invigilator
     * EMAIL CONTAINS: Just a reminder, no exam details
     */
    public void sendExamReminder(String invigilatorEmail, Long examId) {
        String subject = "Upcoming Exam Reminder";
        String body =
                "You have an upcoming exam invigilation assignment.\n\n" +
                "Log in to the system to view exam details.\n\n" +
                "Do not reply to this email.\n\n" +
                "University Exam System";

        sendEmail(invigilatorEmail, subject, body, "EXAM_REMINDER", examId);
    }

    /**
     * Core email sending method with logging
     * Logs all attempts (success or failure) to database
     */
    private void sendEmail(String recipientEmail, String subject, String body, String notificationType, Long relatedEntityId) {
        NotificationLog log = new NotificationLog();
        log.setRecipientEmail(recipientEmail);
        log.setSubject(subject);
        log.setNotificationType(notificationType);
        log.setRelatedEntityId(relatedEntityId);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recipientEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            log.setStatus("SUCCESS");
            System.out.println("✅ Email sent: " + notificationType + " to " + recipientEmail);

        } catch (Exception e) {
            log.setStatus("FAILED");
            log.setErrorMessage(e.getMessage());
            System.err.println("❌ Failed to send email: " + e.getMessage());
        } finally {
            // Always log the attempt
            notificationLogRepository.save(log);
        }
    }

    /**
     * Get notification statistics (for monitoring)
     */
    public long getNotificationCount24Hours() {
        return notificationLogRepository.countRecentNotifications(
            java.time.LocalDateTime.now().minusHours(24)
        );
    }
}