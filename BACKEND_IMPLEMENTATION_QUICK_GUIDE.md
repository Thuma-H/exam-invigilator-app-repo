# 🚀 BACKEND EXAM SCHEDULER - QUICK IMPLEMENTATION GUIDE

## ⚡ WHAT YOU NEED TO DO IN INTELLIJ

### Option 1: Let AI Generate Everything (Fastest)

1. **Open IntelliJ → ExamController.java**
2. **Click on AI menu → GitHub Copilot → Open Copilot Chat**
3. **Copy-paste this prompt:**

```
I need you to implement the ExamScheduler REST API endpoints to match the frontend requirements.

The frontend expects these endpoints:
- GET /api/exams - Get all exams
- POST /api/exams - Create new exam
- PUT /api/exams/{id} - Update exam
- DELETE /api/exams/{id} - Delete exam

Request/Response format:
- Request: { courseCode, courseName, examDate, startTime, duration, venue, invigilatorId }
- Response: { id, courseCode, courseName, examDate, startTime, endTime, duration, venue, invigilatorId, status }

Requirements:
1. Validate all required fields
2. Validate endTime > startTime
3. Check exam date not in past
4. Handle 404 errors for missing exams
5. Return proper HTTP status codes

Add these methods to ExamController class:
- createExam(POST) - Returns 201 Created
- updateExam(PUT) - Returns 200 OK
- deleteExam(DELETE) - Returns 204 No Content
- getMyExams/getAllExams(GET) - Already exists, may need update

Also create:
1. ExamSchedulerRequest DTO (dto package)
2. ExamSchedulerResponse DTO (dto package)
3. Update ExamService with create/update/delete methods

Use existing Exam entity as-is. Follow existing code patterns.
```

4. **Click "Generate" and review the code**
5. **Accept and test with curl**

---

### Option 2: Manual Step-by-Step Implementation

#### Step 1: Create ExamSchedulerRequest DTO (5 minutes)

**File**: `backend/src/main/java/com/examapp/dto/ExamSchedulerRequest.java`

```java
package com.examapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamSchedulerRequest {
    private String courseCode;      // Required: CS101
    private String courseName;      // Required: Intro to CS
    private String examDate;        // Required: 2026-03-15 (YYYY-MM-DD)
    private String startTime;       // Required: 09:00 (HH:MM)
    private Integer duration;       // Required: 120 (minutes)
    private String venue;           // Required: Room 101
    private Long invigilatorId;     // Required: User ID
}
```

#### Step 2: Create ExamSchedulerResponse DTO (5 minutes)

**File**: `backend/src/main/java/com/examapp/dto/ExamSchedulerResponse.java`

```java
package com.examapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamSchedulerResponse {
    private Long id;
    private String courseCode;
    private String courseName;
    private String examDate;
    private String startTime;
    private String endTime;        // Calculated: startTime + duration
    private Integer duration;
    private String venue;
    private Long invigilatorId;
    private String status;         // SCHEDULED, ACTIVE, COMPLETED, CANCELLED
}
```

#### Step 3: Add Methods to ExamController (20 minutes)

Add these methods to your existing ExamController class:

```java
/**
 * Create a new exam
 * POST /api/exams
 */
@PostMapping
public ResponseEntity<?> createExam(
        @RequestBody ExamSchedulerRequest request,
        @RequestHeader(value = "Authorization", required = false) String authHeader) {
    try {
        // Validate required fields
        if (request.getCourseCode() == null || request.getCourseCode().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Course code is required");
        }
        if (request.getCourseName() == null || request.getCourseName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Course name is required");
        }
        if (request.getExamDate() == null || request.getExamDate().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Exam date is required");
        }
        if (request.getStartTime() == null || request.getStartTime().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Start time is required");
        }
        if (request.getDuration() == null || request.getDuration() <= 0) {
            return ResponseEntity.badRequest().body("Duration must be greater than 0");
        }
        if (request.getVenue() == null || request.getVenue().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Venue is required");
        }
        if (request.getInvigilatorId() == null) {
            return ResponseEntity.badRequest().body("Invigilator ID is required");
        }

        // Call service to create exam
        ExamSchedulerResponse response = examService.createExamSchedule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating exam: " + e.getMessage());
    }
}

/**
 * Update an existing exam
 * PUT /api/exams/{id}
 */
@PutMapping("/{id}")
public ResponseEntity<?> updateExam(
        @PathVariable Long id,
        @RequestBody ExamSchedulerRequest request,
        @RequestHeader(value = "Authorization", required = false) String authHeader) {
    try {
        // Validate exam exists
        Exam existingExam = examRepository.findById(id)
                .orElse(null);
        if (existingExam == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Exam not found");
        }

        // Validate required fields
        if (request.getCourseCode() == null || request.getCourseCode().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Course code is required");
        }
        if (request.getStartTime() == null || request.getStartTime().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Start time is required");
        }

        // Call service to update exam
        ExamSchedulerResponse response = examService.updateExamSchedule(id, request);
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating exam: " + e.getMessage());
    }
}

/**
 * Delete an exam
 * DELETE /api/exams/{id}
 */
@DeleteMapping("/{id}")
public ResponseEntity<?> deleteExam(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authHeader) {
    try {
        // Validate exam exists
        Exam exam = examRepository.findById(id)
                .orElse(null);
        if (exam == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Exam not found");
        }

        // Delete exam
        examService.deleteExamSchedule(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting exam: " + e.getMessage());
    }
}
```

#### Step 4: Add Methods to ExamService (20 minutes)

Add these methods to your ExamService class:

```java
public ExamSchedulerResponse createExamSchedule(ExamSchedulerRequest request) {
    try {
        // Parse date and time
        LocalDate examDate = LocalDate.parse(request.getExamDate());
        LocalTime startTime = LocalTime.parse(request.getStartTime());
        
        // Validate date not in past
        if (examDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Exam date cannot be in the past");
        }
        
        // Create new exam
        Exam exam = new Exam();
        exam.setCourseCode(request.getCourseCode());
        exam.setCourseName(request.getCourseName());
        exam.setExamDate(examDate);
        exam.setStartTime(startTime);
        exam.setDuration(request.getDuration());
        exam.setVenue(request.getVenue());
        exam.setStatus("SCHEDULED");
        
        // Set invigilator
        User invigilator = userRepository.findById(request.getInvigilatorId())
                .orElseThrow(() -> new IllegalArgumentException("Invigilator not found"));
        exam.setInvigilator(invigilator);
        
        // Save exam
        Exam savedExam = examRepository.save(exam);
        
        // Convert to response
        return examToResponse(savedExam);
    } catch (Exception e) {
        throw new RuntimeException("Error creating exam: " + e.getMessage());
    }
}

public ExamSchedulerResponse updateExamSchedule(Long id, ExamSchedulerRequest request) {
    try {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
        
        // Update fields
        exam.setCourseCode(request.getCourseCode());
        exam.setCourseName(request.getCourseName());
        exam.setExamDate(LocalDate.parse(request.getExamDate()));
        exam.setStartTime(LocalTime.parse(request.getStartTime()));
        exam.setDuration(request.getDuration());
        exam.setVenue(request.getVenue());
        
        // Update invigilator if provided
        if (request.getInvigilatorId() != null) {
            User invigilator = userRepository.findById(request.getInvigilatorId())
                    .orElseThrow(() -> new IllegalArgumentException("Invigilator not found"));
            exam.setInvigilator(invigilator);
        }
        
        // Save changes
        Exam updatedExam = examRepository.save(exam);
        return examToResponse(updatedExam);
    } catch (Exception e) {
        throw new RuntimeException("Error updating exam: " + e.getMessage());
    }
}

public void deleteExamSchedule(Long id) {
    try {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
        examRepository.delete(exam);
    } catch (Exception e) {
        throw new RuntimeException("Error deleting exam: " + e.getMessage());
    }
}

private ExamSchedulerResponse examToResponse(Exam exam) {
    ExamSchedulerResponse response = new ExamSchedulerResponse();
    response.setId(exam.getId());
    response.setCourseCode(exam.getCourseCode());
    response.setCourseName(exam.getCourseName());
    response.setExamDate(exam.getExamDate().toString());
    response.setStartTime(exam.getStartTime().toString());
    
    // Calculate end time
    LocalTime endTime = exam.getStartTime().plusMinutes(exam.getDuration());
    response.setEndTime(endTime.toString());
    
    response.setDuration(exam.getDuration());
    response.setVenue(exam.getVenue());
    response.setInvigilatorId(exam.getInvigilator().getId());
    response.setStatus(exam.getStatus());
    
    return response;
}
```

#### Step 5: Test the Endpoints (10 minutes)

Use Postman or curl:

```bash
# 1. Create Exam
curl -X POST http://localhost:8080/api/exams \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "CS101",
    "courseName": "Intro to CS",
    "examDate": "2026-03-15",
    "startTime": "09:00",
    "duration": 120,
    "venue": "Room 101",
    "invigilatorId": 1
  }'

# 2. Get All Exams
curl -X GET http://localhost:8080/api/exams

# 3. Update Exam (use ID from creation)
curl -X PUT http://localhost:8080/api/exams/1 \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "CS101",
    "courseName": "Intro to CS - Updated",
    "examDate": "2026-03-15",
    "startTime": "10:00",
    "duration": 120,
    "venue": "Room 102",
    "invigilatorId": 1
  }'

# 4. Delete Exam
curl -X DELETE http://localhost:8080/api/exams/1
```

---

## 🎯 EXPECTED RESULTS

After implementation, you should see:

✅ **POST /api/exams** returns 201 with exam ID  
✅ **GET /api/exams** returns list of exams  
✅ **PUT /api/exams/{id}** returns 200 with updated exam  
✅ **DELETE /api/exams/{id}** returns 204  
✅ Frontend calendar loads exams without errors  
✅ Create/Edit/Delete exams from frontend works  
✅ Conflicts detected and highlighted in red  

---

## ❌ COMMON ISSUES & FIXES

### Issue: 400 Bad Request on POST
**Cause**: Missing required fields or invalid format  
**Fix**: Check request body matches expected format, dates are YYYY-MM-DD, times are HH:MM

### Issue: 404 Not Found on PUT/DELETE
**Cause**: Exam ID doesn't exist  
**Fix**: First create an exam, then use that ID for updates

### Issue: 500 Internal Server Error
**Cause**: Invigilator user doesn't exist  
**Fix**: Make sure invigilatorId references valid user ID in database

### Issue: Frontend still can't create exams
**Cause**: Backend not returning correct response format  
**Fix**: Ensure response includes all fields frontend expects (id, startTime, endTime, status)

---

## 📞 STILL HAVING ISSUES?

If endpoints aren't working:

1. **Check backend is running**: http://localhost:8080/api/exams
2. **Check logs**: Look for error messages in IntelliJ console
3. **Test with Postman**: Before testing with frontend
4. **Verify DTOs**: Make sure DTO field names match JSON
5. **Check imports**: Make sure all imports are correct

---

## ✅ CHECKLIST

- [ ] Created ExamSchedulerRequest DTO
- [ ] Created ExamSchedulerResponse DTO
- [ ] Added POST /api/exams to ExamController
- [ ] Added PUT /api/exams/{id} to ExamController
- [ ] Added DELETE /api/exams/{id} to ExamController
- [ ] Added methods to ExamService
- [ ] Tested endpoints with curl/Postman
- [ ] Frontend can create exams
- [ ] Frontend can edit exams
- [ ] Frontend can delete exams
- [ ] No console errors
- [ ] Response format matches frontend expectations

