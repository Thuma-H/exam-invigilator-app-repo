# 🔄 Backend Prompt: Convert Barcodes to QR Codes

## Context
You are working on the **Exam Invigilator App** backend — a Spring Boot 3.5 / Java 25 application using SQLite, ZXing, and JWT auth. The backend currently generates **Code128 linear barcodes** for student IDs. We need to convert these to **QR codes** instead, so the frontend Student ID Card can display a scannable QR code that blends better with the glass-themed UI.

---

## Current Architecture

### Files to Modify:
1. **`backend/src/main/java/com/examapp/service/BarcodeService.java`**
   - Currently uses `Code128Writer` with `BarcodeFormat.CODE_128`
   - Generates 300x100px linear barcodes
   - Saves to `barcodes/` directory as PNG
   - Has methods: `generateBarcode()`, `generateBarcodeBytes()`, `getBarcodeFile()`, `barcodeExists()`, `generateBulkBarcodes()`

2. **`backend/src/main/java/com/examapp/controller/BarcodeController.java`**
   - REST endpoints at `/api/barcode`
   - Endpoints: `GET /generate/{studentId}`, `GET /{studentId}`, `POST /generate-all`, `GET /check/{studentId}`, `GET /download/{studentId}`
   - All return PNG images — no endpoint changes needed, just the generated image format

### Dependencies (already in pom.xml):
```xml
<!-- ZXing Barcode Library — already supports QR codes -->
<dependency>
    <groupId>com.google.zxing</groupId>
    <artifactId>core</artifactId>
    <version>3.5.3</version>
</dependency>
<dependency>
    <groupId>com.google.zxing</groupId>
    <artifactId>javase</artifactId>
    <version>3.5.3</version>
</dependency>
```
**No new dependencies needed** — ZXing already supports QR code generation.

---

## What to Change in `BarcodeService.java`:

### 1. Change the import
```java
// REMOVE:
import com.google.zxing.oned.Code128Writer;

// ADD:
import com.google.zxing.qrcode.QRCodeWriter;
```

### 2. Update dimensions (QR codes are square)
```java
// CHANGE FROM:
private static final int BARCODE_WIDTH = 300;
private static final int BARCODE_HEIGHT = 100;

// CHANGE TO:
private static final int BARCODE_WIDTH = 300;
private static final int BARCODE_HEIGHT = 300;  // Square for QR
```

### 3. Update `generateBarcode()` method
```java
// CHANGE FROM:
Code128Writer writer = new Code128Writer();
BitMatrix bitMatrix = writer.encode(
    studentId,
    BarcodeFormat.CODE_128,
    BARCODE_WIDTH,
    BARCODE_HEIGHT,
    hints
);

// CHANGE TO:
QRCodeWriter writer = new QRCodeWriter();
BitMatrix bitMatrix = writer.encode(
    studentId,
    BarcodeFormat.QR_CODE,
    BARCODE_WIDTH,
    BARCODE_HEIGHT,
    hints
);
```

### 4. Update `generateBarcodeBytes()` method — same change
```java
// CHANGE FROM:
Code128Writer writer = new Code128Writer();
BitMatrix bitMatrix = writer.encode(
    studentId,
    BarcodeFormat.CODE_128,
    BARCODE_WIDTH,
    BARCODE_HEIGHT,
    hints
);

// CHANGE TO:
QRCodeWriter writer = new QRCodeWriter();
BitMatrix bitMatrix = writer.encode(
    studentId,
    BarcodeFormat.QR_CODE,
    BARCODE_WIDTH,
    BARCODE_HEIGHT,
    hints
);
```

### 5. (Optional) Add error correction for better scanning
```java
Map<EncodeHintType, Object> hints = new HashMap<>();
hints.put(EncodeHintType.MARGIN, 1);
hints.put(EncodeHintType.ERROR_CORRECTION, com.google.zxing.qrcode.decoder.ErrorCorrectionLevel.H);
hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
```

---

## What to Change in `BarcodeController.java`:
**Nothing!** All the endpoints stay the same — they just return PNG bytes. The only thing that changes is the image content (QR instead of linear barcode). The API contract is unchanged.

---

## After Backend Changes — Delete Old Barcodes:
Delete all old linear barcode PNGs so they get regenerated as QR codes:
```
Delete all files in: backend/barcodes/
Delete all files in: barcodes/  (root level)
```

Then hit `POST /api/barcode/generate-all` to regenerate them all as QR codes, or they'll auto-generate on first request.

---

## Frontend Scanner Note (for later):
The frontend `BarcodeScanner.js` currently uses Quagga2 with `code_128_reader`. After the backend switch, the scanner will need to be updated to read QR codes instead (e.g., using `jsQR` or `html5-qrcode` library). But that's a separate task — for now just change the backend generation.

---

## Summary of Changes:
| File | Change |
|------|--------|
| `BarcodeService.java` | `Code128Writer` → `QRCodeWriter`, `CODE_128` → `QR_CODE`, height 100→300 |
| `BarcodeController.java` | No changes needed |
| `pom.xml` | No changes needed (ZXing already supports QR) |
| `barcodes/` folders | Delete old PNGs, regenerate |

## Build & Test:
```bash
cd backend
mvnw.cmd clean package -DskipTests
java -jar target/exam-invigilator-1.0.0.jar
```
Then test: `GET http://localhost:8080/api/barcode/generate/BCS25165336` — should return a QR code PNG.

