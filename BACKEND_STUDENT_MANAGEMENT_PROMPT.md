# Backend Implementation: Add/Remove Students from Exams

## Overview
The frontend now supports adding new students to exams and removing students from exams. You need to implement the backend endpoints to support these features.

## Required Endpoints

### 1. Create Student (POST /api/students)
**Purpose:** Create a new student record or return existing if student ID already exists.

**Request Body:**
```json
{
  "studentId": "BCS25165344",
  "fullName": "John Doe",
  "program": "Computer Science",
  "email": "john.doe@university.edu"
}
```

**Response (201 Created or 200 OK):**
```json
{
  "id": 12,
  "studentId": "BCS25165344",
  "fullName": "John Doe",
  "program": "Computer Science",
  "email": "john.doe@university.edu",
  "verified": false,
  "registrationDate": "2026-01-31T10:30:00"
}
```

**Implementation Notes:**
- Check if student with `studentId` already exists
- If exists, return the existing student (200 OK)
- If not exists, create new student (201 Created)
- Set `verified` to false by default
- Set `registrationDate` to current timestamp
- Email can be null/optional

**Suggested Code Structure:**
```java
@PostMapping("/students")
public ResponseEntity<?> createStudent(@RequestBody StudentDTO studentDTO) {
    // Check if student exists
    Optional<Student> existing = studentRepository.findByStudentId(studentDTO.getStudentId());
    
    if (existing.isPresent()) {
        return ResponseEntity.ok(existing.get());
    }
    
    // Create new student
    Student student = new Student();
    student.setStudentId(studentDTO.getStudentId());
    student.setFullName(studentDTO.getFullName());
    student.setProgram(studentDTO.getProgram());
    student.setEmail(studentDTO.getEmail());
    student.setVerified(false);
    student.setRegistrationDate(LocalDateTime.now());
    
    Student saved = studentRepository.save(student);
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
}
```

---

### 2. Add Student to Exam (POST /api/exams/{examId}/students/{studentId})
**Purpose:** Enroll a student in a specific exam.

**Path Parameters:**
- `examId` - The ID of the exam (Long)
- `studentId` - The database ID of the student (Long, NOT the studentId string)

**Response (200 OK):**
```json
{
  "message": "John Doe was successfully added to BSC121 - Software Engineering"
}
```

**Implementation Notes:**
- Verify exam exists
- Verify student exists
- Check if student is already enrolled in this exam (avoid duplicates)
- Add student to exam's students list
- Return success message with student name and exam details

**Suggested Code Structure:**
```java
@PostMapping("/exams/{examId}/students/{studentId}")
public ResponseEntity<?> addStudentToExam(
        @PathVariable Long examId,
        @PathVariable Long studentId) {
    
    Exam exam = examRepository.findById(examId)
        .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
    
    Student student = studentRepository.findById(studentId)
        .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    
    // Check if already enrolled
    if (exam.getStudents().contains(student)) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Student already enrolled in this exam"));
    }
    
    // Add student to exam
    exam.getStudents().add(student);
    examRepository.save(exam);
    
    String message = String.format("%s was successfully added to %s - %s",
        student.getFullName(),
        exam.getCourseCode(),
        exam.getCourseName());
    
    return ResponseEntity.ok(Map.of("message", message));
}
```

---

### 3. Remove Student from Exam (DELETE /api/exams/{examId}/students/{studentId})
**Purpose:** Unenroll a student from a specific exam.

**Path Parameters:**
- `examId` - The ID of the exam (Long)
- `studentId` - The database ID of the student (Long, NOT the studentId string)

**Response (200 OK):**
```json
{
  "message": "Student removed successfully"
}
```

**Implementation Notes:**
- Verify exam exists
- Verify student exists
- Remove student from exam's students list
- Also delete any attendance records for this student in this exam (optional but recommended)
- Return success message

**Suggested Code Structure:**
```java
@DeleteMapping("/exams/{examId}/students/{studentId}")
public ResponseEntity<?> removeStudentFromExam(
        @PathVariable Long examId,
        @PathVariable Long studentId) {
    
    Exam exam = examRepository.findById(examId)
        .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
    
    Student student = studentRepository.findById(studentId)
        .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    
    // Remove student from exam
    exam.getStudents().remove(student);
    examRepository.save(exam);
    
    // Optional: Delete attendance records for this student in this exam
    attendanceRepository.deleteByExamIdAndStudentId(examId, studentId);
    
    return ResponseEntity.ok(Map.of("message", "Student removed successfully"));
}
```

---

## Database Considerations

### Check Your Student Entity
Make sure your `Student.java` has these fields:
```java
@Column(name = "student_id", unique = true, nullable = false)
private String studentId; // e.g., "BCS25165336"

@Column(name = "full_name", nullable = false)
private String fullName;

@Column(nullable = false)
private String program;

@Column(nullable = true)
private String email;

@Column(name = "verified", nullable = false)
private Boolean verified = false;

@Column(name = "registration_date")
private LocalDateTime registrationDate;
```

### Check Your Exam Entity
Make sure your `Exam.java` has a Many-to-Many relationship with students:
```java
@ManyToMany
@JoinTable(
    name = "exam_students",
    joinColumns = @JoinColumn(name = "exam_id"),
    inverseJoinColumns = @JoinColumn(name = "student_id")
)
private List<Student> students = new ArrayList<>();
```

### Repository Methods Needed
Add these methods to your repositories if not present:

**StudentRepository.java:**
```java
Optional<Student> findByStudentId(String studentId);
```

**AttendanceRepository.java (optional but recommended):**
```java
@Transactional
void deleteByExamIdAndStudentId(Long examId, Long studentId);
```

---

## Testing the Endpoints

### 1. Test Create Student
```bash
curl -X POST http://localhost:8080/api/students \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "BCS25165344",
    "fullName": "Test Student",
    "program": "Computer Science",
    "email": "test@university.edu"
  }'
```

### 2. Test Add Student to Exam
```bash
# First get the student's database ID from the response above (e.g., id: 12)
curl -X POST http://localhost:8080/api/exams/1/students/12 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Remove Student from Exam
```bash
curl -X DELETE http://localhost:8080/api/exams/1/students/12 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Handling

### Handle these scenarios:
1. **Student ID already exists** → Return existing student (200 OK)
2. **Exam not found** → Return 404 with error message
3. **Student not found** → Return 404 with error message
4. **Student already enrolled** → Return 400 with error message
5. **Database errors** → Return 500 with error message

### Example Error Response:
```json
{
  "error": "Exam not found with ID: 999",
  "timestamp": "2026-01-31T10:30:00",
  "status": 404
}
```

---

## Security Considerations

1. **Authentication Required:** All endpoints should require a valid JWT token
2. **Role-Based Access:**
   - Only INVIGILATOR and LIBRARIAN roles should be able to add/remove students
   - Consider adding @PreAuthorize annotations
3. **Validation:**
   - Validate student ID format (e.g., must match pattern: BCS\d{8})
   - Validate full name is not empty
   - Validate program is not empty
   - Validate email format if provided

---

## Frontend Integration

The frontend is already configured to:
1. Call POST /api/students first to create/get the student
2. Use the returned student's database ID (not studentId string)
3. Call POST /api/exams/{examId}/students/{studentId} to enroll
4. Show success toast notification
5. Store notification in localStorage for librarian dashboard
6. Refresh the exam list to show updated student count

---

## Summary Checklist

- [ ] Implement POST /api/students endpoint
- [ ] Implement POST /api/exams/{examId}/students/{studentId} endpoint
- [ ] Implement DELETE /api/exams/{examId}/students/{studentId} endpoint
- [ ] Add findByStudentId method to StudentRepository
- [ ] Test with Postman or curl
- [ ] Verify authentication works
- [ ] Handle duplicate student enrollment
- [ ] Return proper error messages
- [ ] Test integration with frontend

---

## Questions?

If anything is unclear:
1. Check the Student.java model attached
2. Look at existing endpoints in your ExamController
3. Follow the same patterns for error handling
4. Test each endpoint individually before testing with frontend

**Expected completion time:** 1-2 hours

Good luck! 🚀
