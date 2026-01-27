package com.examapp.repository;

import com.examapp.model.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * NotificationLogRepository - Database operations for notification audit logs
 */
@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {

    /**
     * Find all notifications sent to a specific email
     */
    List<NotificationLog> findByRecipientEmail(String recipientEmail);

    /**
     * Find notifications by type
     */
    List<NotificationLog> findByNotificationType(String notificationType);

    /**
     * Find failed notifications
     */
    List<NotificationLog> findByStatus(String status);

    /**
     * Count notifications sent in last N hours
     */
    @Query("SELECT COUNT(n) FROM NotificationLog n WHERE n.sentAt >= :since")
    long countRecentNotifications(@Param("since") LocalDateTime since);

    /**
     * Get recent notification logs (for monitoring)
     */
    @Query("SELECT n FROM NotificationLog n WHERE n.sentAt >= :since ORDER BY n.sentAt DESC")
    List<NotificationLog> findRecentNotifications(@Param("since") LocalDateTime since);
}

