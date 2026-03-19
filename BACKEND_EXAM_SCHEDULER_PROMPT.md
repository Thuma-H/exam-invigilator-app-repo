# BACKEND EXAM SCHEDULER IMPLEMENTATION PROMPT FOR INTELLIJ

## CONTEXT
The frontend ExamScheduler feature requires specific backend endpoints and functionality. The frontend is expecting REST API endpoints for full CRUD operations on exams with conflict detection, filtering, and validation.

## REQUIRED ENDPOINTS

The frontend needs these endpoints to work:

```
GET  /api/exams                     - Get all exams (for librarians to see all)
POST /api/exams                     - Create new exam
PUT  /api/exams/{id}                - Update existing exam
DELETE /api/exams/{id}              - Delete exam
GET  /api/exams/conflict-detection  - Detect scheduling conflicts
```

## FRONTEND REQUIREMENTS

The frontend sends and expects:

### CREATE/UPDATE REQUEST BODY:
```json
{
  "courseCode": "CS101",
  "courseName": "Introduction to Computer Science",
  "examDate": "2026-03-15",
  "startTime": "09:00",
  "duration": 120,
  "venue": "Room 101",
  "invigilatorId": 1
}
```

### RESPONSE (with ID):
```json
{
  "id": 1,
  "courseCode": "CS101",
  "courseName": "Introduction to Computer Science",
  "examDate": "2026-03-15",
  "startTime": "09:00",
  "endTime": "11:00",
  "duration": 120,
  "venue": "Room 101",
  "invigilatorId": 1,
  "status": "SCHEDULED"
}
```

### CONFLICT DETECTION RESPONSE:
```json
{
  "hasConflicts": true,
  "conflicts": [
    {
      "examId1": 1,
      "examId2": 2,
      "conflictType": "SAME_INVIGILATOR",
      "message": "Invigilator 1 assigned to overlapping exams"
    }
  ]
}
```

## IMPLEMENTATION INSTRUCTIONS

### Step 1: Create/Update DTOs (Data Transfer Objects)

Create or update the following DTOs in `src/main/java/com/examapp/dto/`:

1. **ExamSchedulerRequest.java**
   - Fields: courseCode, courseName, examDate, startTime, duration, venue, invigilatorId
   - Validation: All fields required, startTime format must be HH:MM
   - DateTime handling: Use LocalDate for date, LocalTime for time

2. **ExamSchedulerResponse.java**
   - Fields: id, courseCode, courseName, examDate, startTime, endTime, duration, venue, invigilatorId, status
   - Add calculated field: endTime (startTime + duration minutes)

3. **ConflictResponse.java** (if not exists)
   - Fields: examId1, examId2, conflictType (SAME_INVIGILATOR, SAME_VENUE), message

### Step 2: Update ExamController

Add these endpoints to ExamController:

1. **POST /api/exams** - Create Exam
   - Accept: ExamSchedulerRequest
   - Validate: All required fields present
   - Validate: End time > start time
   - Validate: Exam date not in past
   - Return: 201 Created with ExamSchedulerResponse

2. **PUT /api/exams/{id}** - Update Exam
   - Accept: ExamSchedulerRequest
   - Validate: Exam exists
   - Validate: All same validations as POST
   - Return: 200 OK with updated ExamSchedulerResponse
   - Handle: 404 Not Found if exam doesn't exist

3. **DELETE /api/exams/{id}** - Delete Exam
   - Validate: Exam exists
   - Check: No students registered (optional - your choice)
   - Return: 204 No Content or 200 OK with success message
   - Handle: 404 Not Found if exam doesn't exist

4. **GET /api/exams** - Get All Exams
   - Return: List of ExamSchedulerResponse
   - Filter: If auth header present, filter by invigilator
   - If no auth, return all exams (for scheduling view)

5. **GET /api/exams/conflict-detection** - Detect Conflicts
   - Query params: examId (optional for specific exam)
   - Algorithm:
     - Get all exams
     - For each pair of exams:
       - Check if time overlaps (start1 < end2 AND start2 < end1)
       - If overlap AND (same invigilator OR same venue):
         - Add to conflicts list
   - Return: ConflictResponse with all conflicts found

### Step 3: Update ExamService

Add these methods to ExamService:

1. **createExam(ExamSchedulerRequest request)**
   - Validate input
   - Create new Exam object
   - Set user from invigilatorId
   - Save to database
   - Return saved exam

2. **updateExam(Long id, ExamSchedulerRequest request)**
   - Find exam by ID
   - Update fields
   - Validate no conflicts
   - Save changes
   - Return updated exam

3. **deleteExam(Long id)**
   - Find exam by ID
   - Check if students enrolled (optional)
   - Delete exam
   - Return success

4. **detectConflicts()**
   - Get all exams
   - Compare each pair for overlaps
   - Return conflict list

### Step 4: Error Handling

Implement proper error responses:

```
400 Bad Request   - Invalid input (missing fields, bad format)
404 Not Found     - Exam doesn't exist
409 Conflict      - Scheduling conflict detected (optional)
500 Server Error  - Database or other errors
```

### Step 5: Validation Rules

Implement these validations:

1. **Required Fields**
   - courseCode (not null, not empty)
   - courseName (not null, not empty)
   - examDate (not null, not in past)
   - startTime (not null, valid HH:MM format)
   - duration (not null, >= 30 minutes, <= 480 minutes)
   - venue (not null, not empty)
   - invigilatorId (not null, user must exist)

2. **Time Logic**
   - startTime must be before endTime (calculated from startTime + duration)
   - Duration must be positive integer
   - Time format must be HH:MM (24-hour)

3. **Business Rules**
   - Exam date cannot be in the past
   - Invigilator must exist in database
   - Room/venue should exist (or create if doesn't)

## DATABASE CONSIDERATIONS

Existing Exam table structure:
- exam_date (DATE)
- start_time (TIME)
- duration (INTEGER - minutes)
- course_code (VARCHAR)
- course_name (VARCHAR)
- venue (VARCHAR - for room location)
- invigilator_id (FOREIGN KEY to users)
- status (VARCHAR - SCHEDULED, ACTIVE, COMPLETED, CANCELLED)

No migrations needed if using existing schema.

## CORS & SECURITY

Already configured:
- @CrossOrigin(origins = "*") allows frontend requests
- JWT validation via JwtUtil
- Authorization header required for user-specific operations

## RESPONSE FORMAT

All responses should use consistent format:

**Success (201 Created)**:
```json
{
  "id": 1,
  "courseCode": "CS101",
  "courseName": "Intro to CS",
  ...
}
```

**Error (400 Bad Request)**:
```json
{
  "error": "Missing required field: courseCode",
  "timestamp": "2026-03-08T10:30:00"
}
```

## TESTING THE ENDPOINTS

Once implemented, test with:

```bash
# Create Exam
curl -X POST http://localhost:8080/api/exams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "courseCode": "CS101",
    "courseName": "Intro to CS",
    "examDate": "2026-03-15",
    "startTime": "09:00",
    "duration": 120,
    "venue": "Room 101",
    "invigilatorId": 1
  }'

# Get All Exams
curl -X GET http://localhost:8080/api/exams \
  -H "Authorization: Bearer <token>"

# Update Exam
curl -X PUT http://localhost:8080/api/exams/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{ ... }'

# Delete Exam
curl -X DELETE http://localhost:8080/api/exams/1 \
  -H "Authorization: Bearer <token>"
```

## FRONTEND INTEGRATION POINTS

Frontend calls these methods from apiService.js:
- `createExam(examData)` → POST /api/exams
- `updateExam(id, examData)` → PUT /api/exams/{id}
- `deleteExam(id)` → DELETE /api/exams/{id}
- `getMyExams()` → GET /api/exams

Frontend expects:
- Success: 200/201 with exam object
- Error: 400/404/500 with error message
- All timestamps in ISO format (YYYY-MM-DD for dates)

## PRIORITY

1. **MUST HAVE** (blocking frontend):
   - POST /api/exams (create)
   - PUT /api/exams/{id} (update)
   - DELETE /api/exams/{id} (delete)
   - GET /api/exams (list)
   - Input validation
   - Error responses

2. **SHOULD HAVE** (enhances frontend):
   - GET /api/exams/conflict-detection
   - DateTime formatting
   - Conflict checking before save

3. **NICE TO HAVE** (future):
   - Bulk exam creation
   - Exam templates
   - Email notifications

## NOTES

- The existing ExamController already has GET /api/exams
- You need to add POST, PUT, DELETE methods
- Use the existing Exam entity (no changes needed)
- Follow existing code patterns in ExamService
- All timestamps should be in UTC
- Test in Postman/Insomnia before connecting frontend

---

## HOW TO USE THIS PROMPT IN INTELLIJ

1. Open IntelliJ IDEA
2. Open the backend project
3. Select ExamController.java
4. Right-click → AI Actions → Generate Code (or use Copilot)
5. Paste this entire prompt
6. Ask: "Implement the ExamScheduler backend endpoints according to this specification"
7. Review and adjust the generated code
8. Test endpoints with curl or Postman

Alternatively, you can use this prompt for individual components:
- "Update ExamController to add POST /api/exams endpoint"
- "Create ExamSchedulerRequest DTO with validation"
- "Add conflict detection algorithm to ExamService"

