package com.examapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * NotificationLog - Audit trail for all email notifications sent
 *
 * Security: Tracks WHAT notification was sent WHEN, but NOT the content
 * Used for debugging and ensuring notifications were delivered
 */
@Entity
@Table(name = "notification_logs")
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "recipient_email", nullable = false)
    private String recipientEmail;

    @Column(name = "notification_type", nullable = false)
    private String notificationType; // ATTENDANCE_MARKED, INCIDENT_REPORTED, ID_CARD_READY

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @Column(name = "status", nullable = false)
    private String status; // SUCCESS, FAILED

    @Column(name = "error_message")
    private String errorMessage; // If failed, why?

    @Column(name = "related_entity_id")
    private Long relatedEntityId; // e.g., examId, studentId, incidentId

    // Constructors
    public NotificationLog() {
        this.sentAt = LocalDateTime.now();
    }

    public NotificationLog(String recipientEmail, String notificationType, String subject, String status) {
        this.recipientEmail = recipientEmail;
        this.notificationType = notificationType;
        this.subject = subject;
        this.status = status;
        this.sentAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public String getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Long getRelatedEntityId() {
        return relatedEntityId;
    }

    public void setRelatedEntityId(Long relatedEntityId) {
        this.relatedEntityId = relatedEntityId;
    }
}

