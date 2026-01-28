# Backend Coordination Prompts

## 📋 Context
The frontend has been redesigned for better UX and consistency. **No backend changes are required**, but I want to ensure our APIs align perfectly. Here are the specific things to verify/check.

---

## ✅ Prompt 1: Verify Exam API Response

**Give this to backend developer:**

```
Hi! The frontend is now displaying full course names and separate date/time fields on the dashboard. 
Can you verify that the GET /api/exams/my endpoint returns these fields:

{
  "id": 1,
  "courseCode": "BSC121",
  "courseName": "Software Engineering",  ← Need this field
  "dateTime": "2025-01-19T09:00:00",    ← Need this in ISO format
  "venue": "Hall A",
  "status": "SCHEDULED",                 ← Should be SCHEDULED, ONGOING, or COMPLETED
  "studentCount": 45
}

If `courseName` doesn't exist, can you add it to the Course model and exam responses?
If `dateTime` is separate date/time fields, can you combine them into ISO 8601 format?
```

**Why:** Dashboard now shows course names alongside codes, and formats date/time separately.

---

## ✅ Prompt 2: Verify Student API Response

**Give this to backend developer:**

```
Hi! The attendance page now has a search feature that filters by name, ID, and program. 
Can you verify that GET /api/students/exam/{examId} returns these fields:

{
  "id": 1,
  "studentId": "BCS25165336",           ← Need this (barcode reference)
  "fullName": "John Doe",                ← Need this
  "program": "BSC Computer Science",     ← Need this field
  "email": "john@university.edu"
}

If `program` field doesn't exist, can you add it to the Student model?
This helps invigilators identify students by their program.
```

**Why:** Search functionality needs these fields to filter effectively.

---

## ✅ Prompt 3: Verify Attendance Marking Endpoint

**Give this to backend developer:**

```
Hi! The attendance page supports both barcode scanning and manual entry. 
Can you verify that POST /api/attendance/mark accepts this format:

Request Body:
{
  "examId": 1,
  "studentId": 1,                        ← This is the database ID
  "status": "PRESENT",                   ← Should accept: PRESENT, ABSENT, LATE
  "method": "SCAN"                       ← Should accept: SCAN, MANUAL
}

Also verify that:
1. When scanning a barcode, we use the `studentId` field (e.g., "BCS25165336") to look up the student
2. The response returns the updated attendance record
3. Duplicate marking is prevented (can't mark same student twice)
```

**Why:** Frontend needs to distinguish between scanned and manual attendance, and handle barcode lookups.

---

## ✅ Prompt 4: Verify Attendance Retrieval

**Give this to backend developer:**

```
Hi! The attendance page displays existing attendance records with color-coded status badges.
Can you verify that GET /api/attendance/exam/{examId} returns this format:

[
  {
    "id": 1,
    "student": {
      "id": 1,
      "studentId": "BCS25165336",
      "fullName": "John Doe"
    },
    "status": "PRESENT",                 ← Should be PRESENT, ABSENT, or LATE
    "markedAt": "2025-01-19T09:15:00",
    "method": "SCAN"
  }
]

This allows the frontend to:
1. Show which students are already marked
2. Display their status with color-coded badges
3. Disable buttons for already-marked students
```

**Why:** Frontend needs to show attendance status and prevent duplicate marking.

---

## ✅ Prompt 5: Barcode Scanning Flow

**Give this to backend developer:**

```
Hi! When an invigilator scans a barcode, here's what the frontend does:

1. Scanner reads barcode → gets string like "BCS25165336"
2. Frontend searches students array for matching `studentId` field
3. If found, frontend sends database ID to POST /api/attendance/mark
4. If not found, shows error "Student not found in this exam"

Can you confirm:
1. Barcodes contain only the `studentId` (e.g., "BCS25165336")
2. No sensitive data is stored in barcodes
3. GET /api/students/exam/{examId} returns all students enrolled in that exam
4. The `studentId` field is unique and consistent across the system

If barcodes contain different data (like a UUID), let me know the format so I can update the frontend parsing logic.
```

**Why:** Ensures barcode scanning works correctly and securely.

---

## ✅ Prompt 6: Incident Reporting Verification

**Give this to backend developer:**

```
Hi! The incident page allows reporting with optional student involvement.
Can you verify that POST /api/incidents/report accepts this format:

Request Body:
{
  "examId": 1,
  "studentId": 1,                        ← Can be null for general incidents
  "category": "CHEATING",                ← CHEATING, HEALTH_EMERGENCY, DISRUPTION, OTHER
  "severity": "MEDIUM",                  ← LOW, MEDIUM, HIGH
  "description": "Student caught with notes"
}

Also verify that GET /api/incidents/exam/{examId} returns incident history for display.
```

**Why:** Incident reporting needs to support both student-specific and general incidents.

---

## ✅ Prompt 7: Authentication & Role Management

**Give this to backend developer:**

```
Hi! The frontend now has role-based navigation (INVIGILATOR vs LIBRARIAN).
Can you verify that POST /api/auth/login returns:

{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "john.doe",
    "fullName": "John Doe",              ← Need this for navbar display
    "email": "john@university.edu",
    "role": "INVIGILATOR"                ← Should be INVIGILATOR or LIBRARIAN
  }
}

The frontend stores:
- sessionStorage.setItem('token', response.token)
- sessionStorage.setItem('user', JSON.stringify(response.user))
- sessionStorage.setItem('role', response.user.role)

Navigation logic:
- LIBRARIAN → Click logo → /librarian dashboard
- INVIGILATOR → Click logo → / dashboard (exam list)
```

**Why:** Navbar displays user name and role, navigates based on role.

---

## ✅ Prompt 8: Error Handling Standardization

**Give this to backend developer:**

```
Hi! To improve error messaging on the frontend, can you ensure all error responses follow this format:

Success (200/201):
{
  "data": { ... }
}

Error (400/404/500):
{
  "error": "User-friendly error message here"
}

Examples:
- "Student not found in this exam"
- "Attendance already marked for this student"
- "Invalid barcode format"
- "Exam has not started yet"

This allows the frontend to display meaningful error messages to users instead of generic "Request failed" messages.
```

**Why:** Better error messages improve user experience.

---

## ✅ Prompt 9: Offline Sync Support (Optional)

**Give this to backend developer:**

```
Hi! The frontend has offline support that saves attendance locally when internet is unavailable.
When connection is restored, it syncs using POST /api/attendance/mark.

Can you verify:
1. Multiple attendance records can be submitted in quick succession (no rate limiting issues)
2. If a student is already marked, the API returns a specific error like "ALREADY_MARKED" so we can skip it during sync
3. Timestamps from offline marking are preserved (we send them in the request)

Optional enhancement:
Add a batch endpoint POST /api/attendance/mark-batch that accepts an array:
[
  { "examId": 1, "studentId": 1, "status": "PRESENT", "method": "SCAN" },
  { "examId": 1, "studentId": 2, "status": "ABSENT", "method": "MANUAL" }
]

This would make offline sync more efficient.
```

**Why:** Offline sync needs to handle multiple records and conflicts gracefully.

---

## ✅ Prompt 10: CORS and Security Headers

**Give this to backend developer:**

```
Hi! When running frontend on localhost:3000 and backend on localhost:8080, ensure CORS is configured:

Spring Boot example:
@CrossOrigin(origins = "http://localhost:3000")

Or in application.properties:
spring.web.cors.allowed-origins=http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true

Also verify JWT tokens are accepted in Authorization header:
Authorization: Bearer <token>
```

**Why:** Frontend needs CORS enabled to make API calls during development.

---

## 🚫 What We DON'T Need from Backend

**No student registration endpoints** - We removed this feature from frontend
- DELETE any POST /api/students/register endpoints
- Or just leave them - we won't call them

**No barcode management endpoints** - Simplified this feature
- We don't need barcode CRUD operations in frontend
- Backend can generate barcodes as needed

**No complex librarian workflows** - Simplified to printing only
- Don't need student verification endpoints
- Don't need bulk email endpoints (yet)

---

## 🔄 Testing Together

**Once backend confirms all endpoints:**

1. **Test Login:**
   - Invigilator login → Should see exam list
   - Librarian login → Should see librarian dashboard

2. **Test Dashboard:**
   - Should see course names and times
   - Click "Mark Attendance" → Navigate to attendance page

3. **Test Attendance:**
   - Search for student → Filter works
   - Scan barcode → Student marked present
   - Manual mark → Status updates in table

4. **Test Incident:**
   - Report incident → Saved successfully
   - View incident list → Shows history

5. **Test Offline:**
   - Disconnect internet
   - Mark attendance → Saved locally
   - Reconnect → Syncs automatically

---

## 📝 Summary for Backend Team

**What Frontend Changed:**
- Visual design (colors, layout, styling)
- Navigation (consistent navbar)
- Search functionality (filters client-side)
- Scanner UI (collapsible, cleaner)

**What Frontend NEEDS from Backend:**
- Existing endpoints to return correct fields (courseName, program, fullName)
- Consistent error message format
- Role-based authentication (INVIGILATOR, LIBRARIAN)
- Barcode contains only studentId

**What Backend Should Test:**
- All endpoints return expected JSON structure
- CORS enabled for localhost:3000
- JWT authentication works
- Error messages are user-friendly

**Timeline:**
- Backend review: 1 hour
- Small fixes (if needed): 1-2 hours
- Integration testing: 1 hour
- **Total: 3-4 hours maximum**

---

**End of Backend Coordination Prompts**
Use these prompts to communicate exactly what the frontend needs from backend.
No major changes required - just verification and small enhancements.
