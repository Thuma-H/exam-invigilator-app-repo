# COPY-PASTE THIS INTO INTELLIJ COPILOT CHAT

Copy everything below and paste into IntelliJ's GitHub Copilot chat to generate the backend code.

---

## PROMPT TO PASTE INTO INTELLIJ COPILOT

I need to implement the ExamScheduler REST API backend to work with my React frontend calendar application.

**Frontend Requirements:**
The React frontend is trying to create, read, update, and delete exams using these API calls:
- POST /api/exams - Create new exam
- GET /api/exams - Get all exams
- PUT /api/exams/{id} - Update exam
- DELETE /api/exams/{id} - Delete exam

**Expected Request Format (for POST and PUT):**
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

**Expected Response Format:**
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

**What I Need You To Create/Modify:**

1. **Create Two DTOs in the dto package:**

   a) `ExamSchedulerRequest.java` - For receiving requests
   - Fields: courseCode, courseName, examDate, startTime, duration, venue, invigilatorId
   - All fields should be String or Long as appropriate
   - Add @Data, @NoArgsConstructor, @AllArgsConstructor annotations

   b) `ExamSchedulerResponse.java` - For sending responses
   - Fields: id, courseCode, courseName, examDate, startTime, endTime, duration, venue, invigilatorId, status
   - endTime should be calculated as startTime + duration minutes
   - Add @Data, @NoArgsConstructor, @AllArgsConstructor annotations

2. **Add four methods to ExamController class:**

   a) `createExam(POST)` at /api/exams
   - Accept ExamSchedulerRequest
   - Validate: courseCode not null/empty
   - Validate: courseName not null/empty
   - Validate: examDate not null/empty and not in past
   - Validate: startTime not null/empty in HH:MM format
   - Validate: duration not null and > 0
   - Validate: venue not null/empty
   - Validate: invigilatorId not null
   - Call ExamService.createExamSchedule(request)
   - Return 201 Created with ExamSchedulerResponse
   - Return 400 Bad Request if validation fails

   b) `updateExam(PUT)` at /api/exams/{id}
   - Accept PathVariable id and ExamSchedulerRequest
   - Check if exam exists by id, return 404 if not
   - Validate same fields as createExam
   - Call ExamService.updateExamSchedule(id, request)
   - Return 200 OK with updated ExamSchedulerResponse
   - Return 404 if exam not found
   - Return 400 if validation fails

   c) `deleteExam(DELETE)` at /api/exams/{id}
   - Accept PathVariable id
   - Check if exam exists by id, return 404 if not
   - Call ExamService.deleteExamSchedule(id)
   - Return 204 No Content
   - Return 404 if exam not found

   d) Update existing `getMyExams(GET)` at /api/exams
   - Should return all exams (for librarian calendar view)
   - Return List<Exam> with 200 OK

3. **Add three methods to ExamService class:**

   a) `createExamSchedule(ExamSchedulerRequest request)` returns ExamSchedulerResponse
   - Parse examDate as LocalDate from "YYYY-MM-DD" format
   - Parse startTime as LocalTime from "HH:MM" format
   - Create new Exam object
   - Set courseCode, courseName, examDate, startTime, duration, venue
   - Set status to "SCHEDULED"
   - Find user by invigilatorId and set as invigilator
   - Save exam to examRepository
   - Convert saved exam to ExamSchedulerResponse using helper method
   - Return response

   b) `updateExamSchedule(Long id, ExamSchedulerRequest request)` returns ExamSchedulerResponse
   - Find exam by id using examRepository
   - Throw exception if not found
   - Update all fields: courseCode, courseName, examDate, startTime, duration, venue
   - Update invigilator by finding user with invigilatorId
   - Save changes to examRepository
   - Convert to ExamSchedulerResponse
   - Return response

   c) `deleteExamSchedule(Long id)` returns void
   - Find exam by id
   - Delete from examRepository
   - Throw exception if not found

   d) Helper method `examToResponse(Exam exam)` returns ExamSchedulerResponse
   - Create ExamSchedulerResponse
   - Map all fields from Exam
   - Calculate endTime = startTime + duration minutes
   - Convert dates/times to String (ISO format for dates, HH:MM for times)
   - Set invigilatorId from exam.getInvigilator().getId()
   - Return response

**Additional Requirements:**
- Use existing Exam entity - no changes needed
- Use existing User, ExamRepository, UserRepository
- Follow existing code patterns in the project
- Handle all exceptions gracefully with try-catch
- Return proper HTTP status codes: 201 Created, 200 OK, 204 No Content, 400 Bad Request, 404 Not Found, 500 Server Error
- All date formats should use LocalDate/LocalTime Java classes
- Exam dates in requests come as "YYYY-MM-DD" strings
- Times in requests come as "HH:MM" strings in 24-hour format

**Important Notes:**
- The frontend expects endTime to be calculated and returned (not stored in DB)
- CORS is already configured, so cross-origin requests will work
- Authorization header may be present but is not required for this endpoint
- Follow the existing code style and patterns in ExamController and ExamService

Generate the complete, production-ready code for all of the above.

---

## HOW TO USE THIS:

1. Open IntelliJ IDEA
2. Right-click on ExamController.java → AI Actions → Generate Code with AI
3. Or open Copilot Chat panel (Cmd+Shift+C on Mac, Ctrl+Shift+C on Windows)
4. Paste the above prompt
5. Review the generated code
6. Accept and test with curl/Postman

---

## AFTER IMPLEMENTATION:

Test with these curl commands:

```bash
# Create
curl -X POST http://localhost:8080/api/exams \
  -H "Content-Type: application/json" \
  -d '{"courseCode":"CS101","courseName":"Intro","examDate":"2026-03-15","startTime":"09:00","duration":120,"venue":"Room101","invigilatorId":1}'

# Get All
curl -X GET http://localhost:8080/api/exams

# Update (use real ID)
curl -X PUT http://localhost:8080/api/exams/1 \
  -H "Content-Type: application/json" \
  -d '{"courseCode":"CS101","courseName":"Updated","examDate":"2026-03-15","startTime":"10:00","duration":120,"venue":"Room102","invigilatorId":1}'

# Delete
curl -X DELETE http://localhost:8080/api/exams/1
```

If all endpoints return proper responses, the frontend will work!

