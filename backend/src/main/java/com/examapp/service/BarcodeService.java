package com.examapp.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.oned.Code128Writer;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * BarcodeService - Generates and manages barcodes for student IDs
 * Uses Code128 format for alphanumeric student numbers like BCS25165336
 */
@Service
public class BarcodeService {

    private static final String BARCODE_DIR = "barcodes/";
    private static final int BARCODE_WIDTH = 300;
    private static final int BARCODE_HEIGHT = 100;

    public BarcodeService() {
        // Create barcodes directory if it doesn't exist
        try {
            Path path = Paths.get(BARCODE_DIR);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
                System.out.println("✅ Barcode directory created: " + BARCODE_DIR);
            }
        } catch (IOException e) {
            System.err.println("❌ Error creating barcode directory: " + e.getMessage());
        }
    }

    /**
     * Generate a barcode for a student ID and save it to disk
     * @param studentId The student ID (e.g., BCS25165336)
     * @return Path to the saved barcode image
     */
    public String generateBarcode(String studentId) throws WriterException, IOException {
        // Configure barcode encoding
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.MARGIN, 1); // Minimal white border

        // Generate barcode matrix
        Code128Writer writer = new Code128Writer();
        BitMatrix bitMatrix = writer.encode(
                studentId,
                BarcodeFormat.CODE_128,
                BARCODE_WIDTH,
                BARCODE_HEIGHT,
                hints
        );

        // Convert to image
        BufferedImage barcodeImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

        // Save to file
        String filename = studentId + ".png";
        Path filePath = Paths.get(BARCODE_DIR + filename);
        ImageIO.write(barcodeImage, "PNG", filePath.toFile());

        System.out.println("✅ Barcode generated: " + filePath);
        return filePath.toString();
    }

    /**
     * Generate barcode as byte array (for API responses)
     * @param studentId The student ID
     * @return PNG image as byte array
     */
    public byte[] generateBarcodeBytes(String studentId) throws WriterException, IOException {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.MARGIN, 1);

        Code128Writer writer = new Code128Writer();
        BitMatrix bitMatrix = writer.encode(
                studentId,
                BarcodeFormat.CODE_128,
                BARCODE_WIDTH,
                BARCODE_HEIGHT,
                hints
        );

        BufferedImage barcodeImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

        // Convert to byte array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(barcodeImage, "PNG", baos);
        return baos.toByteArray();
    }

    /**
     * Get existing barcode file path
     * @param studentId The student ID
     * @return Path to barcode file or null if not found
     */
    public Path getBarcodeFile(String studentId) {
        Path filePath = Paths.get(BARCODE_DIR + studentId + ".png");
        return Files.exists(filePath) ? filePath : null;
    }

    /**
     * Check if barcode exists for a student
     * @param studentId The student ID
     * @return true if barcode exists
     */
    public boolean barcodeExists(String studentId) {
        return Files.exists(Paths.get(BARCODE_DIR + studentId + ".png"));
    }

    /**
     * Generate barcodes for multiple students
     * @param studentIds Array of student IDs
     * @return Number of barcodes successfully generated
     */
    public int generateBulkBarcodes(String[] studentIds) {
        int successCount = 0;
        for (String studentId : studentIds) {
            try {
                if (!barcodeExists(studentId)) {
                    generateBarcode(studentId);
                    successCount++;
                }
            } catch (Exception e) {
                System.err.println("❌ Failed to generate barcode for " + studentId + ": " + e.getMessage());
            }
        }
        return successCount;
    }
}