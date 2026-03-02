# Backend Implementation: Add Student to Exam Feature

## Overview
Implement an endpoint that allows invigilators to create new students and automatically enroll them in exams. This creates the student record, enrolls them in the specified exam, and makes them immediately available in the librarian dashboard and attendance registers.

---

## Required Endpoint

### POST /api/students/create-and-enroll

**Authorization:** INVIGILATOR, ADMIN roles only

**Request Body:**
```json
{
  "studentId": "BCS25165344",
  "fullName": "John Smith",
  "email": "john.smith@university.edu",
  "program": "Computer Science",
  "examId": 1
}
```

**Response (201 Created):**
```json
{
  "id": 9,
  "studentId": "BCS25165344",
  "fullName": "John Smith",
  "email": "john.smith@university.edu",
  "program": "Computer Science",
  "verified": false,
  "registrationDate": "2026-01-28T14:30:00",
  "examEnrollment": {
    "examId": 1,
    "courseCode": "BSC121",
    "courseName": "Software Engineering"
  }
}
```

**Error Responses:**

400 Bad Request - Duplicate student:
```json
{
  "error": "Student ID BCS25165344 already exists"
}
```

400 Bad Request - Invalid exam:
```json
{
  "error": "Exam with ID 1 not found"
}
```

---

## Implementation Guide

### Step 1: Create DTO Class

**File:** `backend/src/main/java/com/examapp/dto/CreateStudentEnrollRequest.java`

```java
package com.examapp.dto;

public class CreateStudentEnrollRequest {
    private String studentId;
    private String fullName;
    private String email;
    private String program;
    private Long examId;

    // Constructors
    public CreateStudentEnrollRequest() {}

    public CreateStudentEnrollRequest(String studentId, String fullName, 
                                     String email, String program, Long examId) {
        this.studentId = studentId;
        this.fullName = fullName;
        this.email = email;
        this.program = program;
        this.examId = examId;
    }

    // Getters and Setters
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }
}
```

---

### Step 2: Add Controller Method

**File:** `backend/src/main/java/com/examapp/controller/StudentController.java`

```java
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;

@Transactional
@PostMapping("/create-and-enroll")
@PreAuthorize("hasAnyRole('INVIGILATOR', 'ADMIN')")
public ResponseEntity<?> createStudentAndEnrollInExam(
        @RequestBody CreateStudentEnrollRequest request) {
    
    try {
        // Validate student doesn't already exist
        Optional<Student> existingStudent = studentRepository.findByStudentId(request.getStudentId());
        if (existingStudent.isPresent()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Student ID " + request.getStudentId() + " already exists"));
        }

        // Validate exam exists
        Exam exam = examRepository.findById(request.getExamId())
            .orElseThrow(() -> new RuntimeException("Exam with ID " + request.getExamId() + " not found"));

        // Create new student
        Student student = new Student();
        student.setStudentId(request.getStudentId());
        student.setFullName(request.getFullName());
        student.setEmail(request.getEmail());
        student.setProgram(request.getProgram());
        student.setVerified(false);
        student.setRegistrationDate(LocalDateTime.now());
        
        // Save student
        Student savedStudent = studentRepository.save(student);

        // Enroll student in exam
        exam.getStudents().add(savedStudent);
        examRepository.save(exam);

        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedStudent.getId());
        response.put("studentId", savedStudent.getStudentId());
        response.put("fullName", savedStudent.getFullName());
        response.put("email", savedStudent.getEmail());
        response.put("program", savedStudent.getProgram());
        response.put("verified", savedStudent.isVerified());
        response.put("registrationDate", savedStudent.getRegistrationDate());
        
        Map<String, Object> examInfo = new HashMap<>();
        examInfo.put("examId", exam.getId());
        examInfo.put("courseCode", exam.getCourseCode());
        examInfo.put("courseName", exam.getCourseName());
        response.put("examEnrollment", examInfo);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);

    } catch (RuntimeException e) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", e.getMessage()));
    }
}
```

---

### Step 3: Update Student Repository

**File:** `backend/src/main/java/com/examapp/repository/StudentRepository.java`

Ensure this method exists:

```java
Optional<Student> findByStudentId(String studentId);
```

If it doesn't exist, add it to the repository interface.

---

## Required Database Schema

### Students Table
- `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- `student_id` (VARCHAR, UNIQUE, NOT NULL, INDEXED)
- `full_name` (VARCHAR, NOT NULL)
- `email` (VARCHAR, NULLABLE)
- `program` (VARCHAR, NOT NULL)
- `verified` (BOOLEAN, DEFAULT FALSE)
- `registration_date` (TIMESTAMP, NOT NULL)

### Exam-Student Relationship
- Many-to-Many relationship
- Junction table: `exam_students`
  - `exam_id` (BIGINT, FOREIGN KEY)
  - `student_id` (BIGINT, FOREIGN KEY)
  - PRIMARY KEY (`exam_id`, `student_id`)

---

## Testing

### Test 1: Successful Creation

```bash
curl -X POST http://localhost:8080/api/students/create-and-enroll \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "studentId": "BCS25165344",
    "fullName": "John Smith",
    "email": "john.smith@university.edu",
    "program": "Computer Science",
    "examId": 1
  }'
```

**Expected:** 201 Created with student details

---

### Test 2: Duplicate Student ID

```bash
curl -X POST http://localhost:8080/api/students/create-and-enroll \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "studentId": "BCS25165336",
    "fullName": "Alice Johnson",
    "email": "alice@example.com",
    "program": "Computer Science",
    "examId": 1
  }'
```

**Expected:** 400 Bad Request with error message about duplicate student ID

---

### Test 3: Invalid Exam ID

```bash
curl -X POST http://localhost:8080/api/students/create-and-enroll \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "studentId": "BCS25165999",
    "fullName": "Test Student",
    "email": "test@example.com",
    "program": "Computer Science",
    "examId": 9999
  }'
```

**Expected:** 400 Bad Request with error message about exam not found

---

## Validation Requirements

1. **Student ID Uniqueness:** Must check if student ID already exists before creating
2. **Exam Existence:** Must verify exam exists before enrollment
3. **Transaction Atomicity:** Both student creation and enrollment must succeed or both must fail
4. **Authorization:** Only INVIGILATOR and ADMIN roles can access this endpoint
5. **Email Optional:** Email field can be null
6. **Verified Default:** New students should have `verified = false`
7. **Timestamp:** `registrationDate` should be set to current time automatically

---

## Verification Checklist

After implementation, verify:

- [ ] Endpoint accessible at POST /api/students/create-and-enroll
- [ ] Returns 201 Created on success
- [ ] Returns 400 on duplicate student ID
- [ ] Returns 400 on invalid exam ID
- [ ] Returns 401/403 on unauthorized access
- [ ] Student saved to `students` table
- [ ] Student enrolled in `exam_students` table
- [ ] Student appears in GET /api/exams/{examId}/students
- [ ] Student appears in GET /api/students (librarian dashboard)
- [ ] Student count updated for exam
- [ ] Barcode can be generated for new student
- [ ] Transaction rolls back if any step fails
- [ ] CORS headers allow frontend access

---

## Common Issues & Solutions

### Issue: Port 8080 already in use
```bash
# Find process
netstat -ano | findstr :8080

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Issue: Database connection failed
Check `application.properties`:
```properties
spring.datasource.url=jdbc:sqlite:../examdb.db
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.hibernate.ddl-auto=update
```

### Issue: Authorization fails
Ensure SecurityConfig allows the endpoint and user has correct role.

---

## Expected Frontend Integration

Once implemented, the frontend will:

1. Invigilator clicks "Add Student" on exam card
2. Modal opens with form
3. Invigilator fills: Student ID, Name, Email, Program
4. Frontend calls POST /api/students/create-and-enroll
5. Backend creates student and enrolls in exam
6. Success message shows to invigilator
7. Dashboard refreshes with updated student count
8. Student immediately appears in:
   - Attendance page for that exam
   - Librarian dashboard
   - Available for barcode generation

---

## Notes

- Email is optional (can be null)
- Program should be one of: Computer Science, Software Engineering, Information Technology, Data Science, Cybersecurity, Business Administration, Engineering, Mathematics, Physics, Chemistry
- Student ID must be unique across all students
- New students are unverified by default
- Registration date is set automatically

---

## Questions?

If you encounter errors:
1. Check backend console logs
2. Verify database schema matches requirements
3. Test endpoint with Postman/curl first
4. Share error message for debugging assistance

---

**Implementation Priority: HIGH - Frontend is waiting for this endpoint**
