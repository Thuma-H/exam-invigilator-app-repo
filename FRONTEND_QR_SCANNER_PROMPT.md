# 🔄 Frontend Prompt: Convert Barcode Scanner to QR Code Scanner

## Context
You are working on the **Exam Invigilator App frontend** — a React 18 application using React Router, Axios, and html2canvas. The backend has been upgraded from Code128 linear barcodes to **QR codes** (300×300px PNGs via ZXing `QRCodeWriter`). The frontend currently uses **Quagga2** (`@ericblade/quagga2`) to scan Code128 linear barcodes. We need to replace Quagga2 with a **QR code scanning library** and update the Student ID Card to display the square QR image properly.

---

## Current Architecture

### Dependencies (`package.json`):
```json
{
  "dependencies": {
    "@ericblade/quagga2": "^1.12.1",
    "@react-buddy/ide-toolbox": "^2.4.0",
    "axios": "^1.5.1",
    "html2canvas": "^1.4.1",
    "react": "^18.2.0",
    "react-dev-utils": "^12.0.1",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0",
    "react-scripts": "5.0.1"
  }
}
```

### Files to Modify:

| File | Current State | Change Needed |
|------|--------------|---------------|
| `package.json` | Uses `@ericblade/quagga2` for Code128 | Replace with `html5-qrcode` for QR scanning |
| `src/components/BarcodeScanner.js` (96 lines) | Uses Quagga2 with `code_128_reader` | Rewrite to use `html5-qrcode` `Html5Qrcode` class |
| `src/components/BarcodeAttendendanceScanner.js` (331 lines) | Uses Quagga2 with `code_128_reader` for attendance scanning | Rewrite to use `html5-qrcode` `Html5Qrcode` class |
| `src/components/StudentIDCard.css` | Barcode strip styled for linear barcode (38px tall) | Update for square QR code display |

### Files that import the scanners (NO changes needed to these — the component API stays the same):
- `src/pages/StudentRegistrationPage.js` — imports `BarcodeScanner`
- `src/pages/AttendancePage.js` — imports `BarcodeScanner`
- Note: `BarcodeAttendendanceScanner.js` exports `BarcodeAttendanceScanner` but is NOT imported anywhere currently

---

## Step 1: Install New Dependency

```bash
cd frontend
npm uninstall @ericblade/quagga2
npm install html5-qrcode
```

**Why `html5-qrcode`?**
- Lightweight, actively maintained QR code scanner
- Uses camera access with HTML5
- Works on both desktop and mobile browsers
- Simple API: `Html5Qrcode.start()` / `.stop()`
- No need for canvas hacks or complex configuration

---

## Step 2: Rewrite `BarcodeScanner.js`

**Current file** (96 lines) uses Quagga2:
```javascript
import Quagga from '@ericblade/quagga2';
// ...
Quagga.init({
    inputStream: { type: 'LiveStream', target: scannerRef.current, ... },
    decoder: { readers: ['code_128_reader'] }
}, callback);
Quagga.onDetected((result) => { onScan(result.codeResult.code); });
```

**Replace the ENTIRE file with this approach:**

Keep the same component API: `<BarcodeScanner onScan={fn} onError={fn} />`

Key changes:
- Remove `import Quagga from '@ericblade/quagga2'`
- Add `import { Html5Qrcode } from 'html5-qrcode'`
- Use a unique `div` ID (e.g., `"qr-scanner-region"`) instead of a ref for `Html5Qrcode`
- `Html5Qrcode` needs a **string element ID**, not a React ref
- On start: `new Html5Qrcode("qr-scanner-region")` then `.start(cameraId, config, onSuccess, onError)`
- On stop: `html5QrCode.stop()`
- Use `Html5Qrcode.getCameras()` to get the back camera (prefer `facingMode: "environment"`)
- When QR detected, call `onScan(decodedText)` — the decoded text is the student ID string
- Keep the same button UI (Start/Stop scanning)
- Store the `Html5Qrcode` instance in a `useRef` so it persists across renders
- **Important:** Always call `.stop()` before unmounting to release the camera
- Add `fps: 10` and `qrbox: { width: 250, height: 250 }` to the scanner config for a nice scanning region

---

## Step 3: Rewrite `BarcodeAttendendanceScanner.js`

**Current file** (331 lines) — this is the full attendance scanner with cooldown, beep sounds, student matching, scan history UI.

Key changes (same pattern as BarcodeScanner.js):
- Remove `import Quagga from '@ericblade/quagga2'`
- Add `import { Html5Qrcode } from 'html5-qrcode'`
- Replace `scannerRef` usage — use a unique element ID `"qr-attendance-scanner"` (different from BarcodeScanner to avoid conflicts)
- Replace `Quagga.init(...)` / `Quagga.start()` / `Quagga.stop()` / `Quagga.onDetected()` / `Quagga.offDetected()` with `Html5Qrcode` equivalents
- Store `Html5Qrcode` instance in a `useRef`
- In `startScanner()`:
  ```javascript
  const html5QrCode = new Html5Qrcode("qr-attendance-scanner");
  html5QrCodeRef.current = html5QrCode;
  html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => { handleBarcodeScan(decodedText); },
      (errorMessage) => { /* ignore scan misses */ }
  );
  ```
- In `stopScanner()`:
  ```javascript
  if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(err => console.log('Scanner stop error:', err));
      html5QrCodeRef.current = null;
  }
  ```
- Update `handleBarcodeScan` — it currently receives a Quagga `result` object and extracts `result.codeResult.code`. With `html5-qrcode`, the callback receives the decoded text string directly. So change:
  ```javascript
  // OLD:
  const handleBarcodeScan = async (result) => {
      if (!result || !result.codeResult) return;
      const code = result.codeResult.code;
  
  // NEW:
  const handleBarcodeScan = async (decodedText) => {
      if (!decodedText) return;
      const code = decodedText;
  ```
- **Remove** the CSS scanning line animation overlay (the green line) — `html5-qrcode` draws its own QR scanning box
- **Remove** the manual "Position barcode in this area" overlay box — `html5-qrcode` has a built-in viewfinder
- Keep ALL other UI: the message banner, stats grid, last scanned card, scan history list, beep sounds, cooldown logic
- The `scannerRef` div becomes just: `<div id="qr-attendance-scanner" style={{ width: '100%' }} />`

---

## Step 4: Update Student ID Card CSS for QR Code Display

**Current CSS** (`StudentIDCard.css` lines 213–236):
```css
.id-card-barcode-strip {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px);
    border-top: 1px solid rgba(167, 139, 250, 0.15);
    margin: 0 12px 10px;
    border-radius: 8px;
    padding: 6px 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
}

.id-card-barcode-strip img {
    max-height: 38px;      /* <-- too small for QR code */
    width: auto;
    max-width: 100%;
    filter: invert(1) brightness(1.8) drop-shadow(0 0 3px rgba(167, 139, 250, 0.3));
    opacity: 0.85;
}
```

**Change to:**
```css
.id-card-barcode-strip {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-top: 1px solid rgba(167, 139, 250, 0.15);
    margin: 0 12px 10px;
    border-radius: 8px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
}

.id-card-barcode-strip img {
    width: 64px;            /* Square QR code */
    height: 64px;
    border-radius: 4px;
    filter: invert(1) brightness(1.8) drop-shadow(0 0 3px rgba(167, 139, 250, 0.3));
    opacity: 0.9;
}
```

Key change: `max-height: 38px` → `width: 64px; height: 64px` — QR codes are square and need to be big enough to scan but fit within the credit-card-sized ID layout (card is 240px tall).

---

## Step 5: Update `StudentBarcodeCard.js` Download Filename (Optional)

In `StudentBarcodeCard.js`, the download handler sets:
```javascript
link.setAttribute('download', `${student.studentId}_barcode.png`);
```

Optionally rename to:
```javascript
link.setAttribute('download', `${student.studentId}_qrcode.png`);
```

---

## Summary of All Changes

| File | Action |
|------|--------|
| `package.json` | Remove `@ericblade/quagga2`, add `html5-qrcode` |
| `BarcodeScanner.js` | Full rewrite: Quagga2 → `Html5Qrcode` (keep same `onScan`/`onError` props API) |
| `BarcodeAttendendanceScanner.js` | Full rewrite scanner parts: Quagga2 → `Html5Qrcode` (keep all attendance UI, beeps, cooldown) |
| `StudentIDCard.css` | `.id-card-barcode-strip img` — change from `max-height: 38px` to `width: 64px; height: 64px` for square QR |
| `StudentBarcodeCard.js` | (Optional) Rename download filename from `_barcode.png` to `_qrcode.png` |
| `StudentRegistrationPage.js` | **No changes** — same `<BarcodeScanner onScan={} />` API |
| `AttendancePage.js` | **No changes** — same `<BarcodeScanner onScan={} />` API |

## Important Notes
- **Both scanner components** (`BarcodeScanner.js` and `BarcodeAttendendanceScanner.js`) must use **different element IDs** for `Html5Qrcode` (e.g., `"qr-scanner-region"` vs `"qr-attendance-scanner"`) to avoid DOM conflicts if both are ever mounted.
- `html5-qrcode` handles its own camera permissions dialog — no extra code needed.
- The `html5-qrcode` library renders its own viewfinder UI inside the target div, so the manual green scanning line and overlay box from the Quagga2 version should be **removed**.
- The backend API is **unchanged** — all endpoints still return PNG images at the same URLs. The only difference is the PNG content is now a QR code instead of a linear barcode.

## Build & Test
```bash
cd frontend
npm install
npm start
```
Then test:
1. Open a Student ID Card — verify the QR code displays as a small square on the card
2. Go to Attendance page → Start Scanner → scan a QR code from the ID card → verify student ID is detected

