package com.examapp.repository;

import com.examapp.model.BarcodeScan;
import com.examapp.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * BarcodeScanRepository - Database operations for barcode scan audit logs
 */
@Repository
public interface BarcodeScanRepository extends JpaRepository<BarcodeScan, Long> {

    /**
     * Find all scans by a specific invigilator
     */
    List<BarcodeScan> findByScannedBy(String scannedBy);

    /**
     * Find all scans for a specific student
     */
    List<BarcodeScan> findByStudent(Student student);

    /**
     * Find all failed scan attempts (for security monitoring)
     */
    List<BarcodeScan> findByValidationStatusNot(String validationStatus);

    /**
     * Count scans by invigilator within time range (for rate limiting)
     */
    @Query("SELECT COUNT(bs) FROM BarcodeScan bs WHERE bs.scannedBy = :username AND bs.scanTimestamp >= :since")
    long countRecentScansByUser(@Param("username") String username, @Param("since") LocalDateTime since);

    /**
     * Find all scans for a specific exam
     */
    @Query("SELECT bs FROM BarcodeScan bs WHERE bs.exam.id = :examId ORDER BY bs.scanTimestamp DESC")
    List<BarcodeScan> findByExamId(@Param("examId") Long examId);

    /**
     * Find suspicious scan patterns (multiple failed attempts)
     */
    @Query("SELECT bs FROM BarcodeScan bs WHERE bs.validationStatus != 'SUCCESS' AND bs.scanTimestamp >= :since ORDER BY bs.scanTimestamp DESC")
    List<BarcodeScan> findFailedScans(@Param("since") LocalDateTime since);
}
