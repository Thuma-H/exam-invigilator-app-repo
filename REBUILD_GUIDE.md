# Backend Maven Rebuild Guide

## ✅ Summary of Changes Implemented

### New Models Added:
✓ **Course.java** - Located at `backend/src/main/java/com/examapp/model/Course.java`
  - Fields: `id`, `courseCode`, `courseName`, `department`, `creditHours`, `instructor`, `registrationDate`
  - Fully implemented with JPA annotations and constructors

### Updated Models:
✓ **Student.java** - Updated with new fields:
  - ✓ `email` (String, nullable)
  - ✓ `verified` (Boolean, default false)
  - ✓ `registrationDate` (LocalDateTime)
  - ✓ Updated constructors to initialize `registrationDate`

### New Repositories Added:
✓ **CourseRepository.java** - Located at `backend/src/main/java/com/examapp/repository/CourseRepository.java`
  - Methods: `findByCourseCode`, `findByDepartment`, `existsByCourseCode`, `findByCourseNameContainingIgnoreCase`

### Updated Repositories:
✓ **StudentRepository.java** - Added new method:
  - ✓ `findByVerified(Boolean verified)`

### New Controllers Added:
✓ **CourseController.java** - Located at `backend/src/main/java/com/examapp/controller/CourseController.java`
  - Full CRUD operations for courses
  - Endpoints:
    - `GET /api/courses` - Get all courses
    - `POST /api/courses` - Create new course
    - `PUT /api/courses/{id}` - Update course
    - `DELETE /api/courses/{id}` - Delete course
    - `GET /api/courses/department/{department}` - Get courses by department

### Updated Controllers:
✓ **StudentController.java** - Added new endpoints:
  - ✓ `PUT /api/students/{id}/verify` - Verify a student
  - ✓ `GET /api/students/pending` - Get unverified students
  - ✓ `POST /api/students/{id}/send-barcode-email` - Send barcode email to student

### Email Service:
✓ **EmailService.java** - Already has method:
  - ✓ `sendBarcodeInfoToStudent(String studentEmail, String studentId, String fullName)`

---

## 🔧 How to Rebuild the Project

### Method 1: Using IntelliJ IDEA (Recommended)

#### Step 1: Delete Old Database
1. Navigate to project root: `C:\Users\sstac\OneDrive\Desktop\exam-invigilator-app-repo`
2. Delete `examdb.db` file if it exists (or it will be auto-recreated on startup)

#### Step 2: Clean and Rebuild in IntelliJ
1. Open IntelliJ IDEA
2. Open the project folder: `exam-invigilator-app-repo`
3. In IntelliJ, go to **View → Tool Windows → Maven**
4. In the Maven panel, expand **exam-invigilator**
5. Expand **Lifecycle**
6. Double-click **clean** (this removes old compiled files)
7. Double-click **install** (this compiles and packages the project)

Alternatively, use the menu:
- **Build → Rebuild Project**

#### Step 3: Run the Application
1. Navigate to `backend/src/main/java/com/examapp/ExamInvigilatorApplication.java`
2. Right-click the file
3. Select **Run 'ExamInvigilatorApplication'**
4. Wait for the console output:
   ```
   ===========================================
   ✅ Exam Invigilator API is running!
   📍 Server: http://localhost:8080
   📚 API Base: http://localhost:8080/api
   ===========================================
   ```

### Method 2: Using Command Line (If Maven is Installed)

#### Step 1: Delete Old Database
```powershell
cd C:\Users\sstac\OneDrive\Desktop\exam-invigilator-app-repo
Remove-Item examdb.db -ErrorAction SilentlyContinue
```

#### Step 2: Clean and Install
```powershell
cd backend
mvn clean install
```

#### Step 3: Run the Application
```powershell
mvn spring-boot:run
```

---

## 🧪 Verify the Endpoints

### Test Course Endpoints:

#### 1. Get All Courses
```http
GET http://localhost:8080/api/courses
```

#### 2. Create a New Course
```http
POST http://localhost:8080/api/courses
Content-Type: application/json

{
  "courseCode": "BSC125",
  "courseName": "Software Engineering",
  "department": "Computer Science",
  "creditHours": 3,
  "instructor": "Dr. Smith"
}
```

#### 3. Get Courses by Department
```http
GET http://localhost:8080/api/courses/department/Computer Science
```

#### 4. Update a Course
```http
PUT http://localhost:8080/api/courses/1
Content-Type: application/json

{
  "courseName": "Advanced Software Engineering",
  "department": "Computer Science",
  "creditHours": 4,
  "instructor": "Dr. Smith"
}
```

#### 5. Delete a Course
```http
DELETE http://localhost:8080/api/courses/1
```

### Test Student Verification Endpoints:

#### 1. Get All Students
```http
GET http://localhost:8080/api/students
```

#### 2. Get Pending (Unverified) Students
```http
GET http://localhost:8080/api/students/pending
```

#### 3. Verify a Student
```http
PUT http://localhost:8080/api/students/1/verify
```

#### 4. Send Barcode Email to Student
```http
POST http://localhost:8080/api/students/1/send-barcode-email
```

---

## 🗃️ Database Schema Verification

After starting the application, the database should be automatically created with these tables:

### Tables Created:
1. **courses** - with columns:
   - `id` (PRIMARY KEY)
   - `course_code` (UNIQUE, NOT NULL)
   - `course_name` (NOT NULL)
   - `department` (NOT NULL)
   - `credit_hours`
   - `instructor`
   - `registration_date`

2. **students** - with columns:
   - `id` (PRIMARY KEY)
   - `student_id` (UNIQUE, NOT NULL)
   - `full_name` (NOT NULL)
   - `program` (NOT NULL)
   - `email` (NULLABLE)
   - `verified` (NOT NULL, DEFAULT false)
   - `registration_date`

3. Other existing tables:
   - `users`
   - `exams`
   - `attendance`
   - `incidents`

---

## 📋 Checklist

- [x] Course.java model created with all fields
- [x] CourseRepository.java created with query methods
- [x] CourseController.java created with CRUD endpoints
- [x] Student.java updated with email, verified, registrationDate
- [x] StudentRepository.java updated with findByVerified method
- [x] StudentController.java updated with verify, pending, and send-barcode-email endpoints
- [x] EmailService.java has sendBarcodeInfoToStudent method
- [x] All JPA annotations are correct
- [x] All Spring annotations (@Autowired, @RestController, etc.) are in place
- [ ] Database deleted (manual step before rebuild)
- [ ] Maven clean install executed (use IntelliJ)
- [ ] Application started successfully
- [ ] Endpoints tested with Postman/browser

---

## 🐛 Troubleshooting

### Error: "Table not found" or "Column not found"
**Solution:** Delete `examdb.db` and restart the application. Spring Boot will recreate the database with the new schema.

### Error: "Could not autowire" or "No qualifying bean"
**Solution:** 
1. Make sure all classes are in `com.examapp` package or subpackages
2. Check that `@Repository`, `@Service`, `@RestController` annotations are present
3. Rebuild the project in IntelliJ

### Error: Port 8080 already in use
**Solution:**
```powershell
# Find and kill the process using port 8080
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F
```

### Maven dependencies not downloading
**Solution:**
1. In IntelliJ: **File → Invalidate Caches → Invalidate and Restart**
2. Or right-click `pom.xml` → **Maven → Reload Project**

---

## 📝 Notes

- The database uses `spring.jpa.hibernate.ddl-auto=create` which recreates the schema on every startup
- Default users are created via `DataInitializer.java`
- Barcode images are stored in the `barcodes/` folder
- Email configuration is in `application.properties`

---

## ✅ Expected Behavior After Rebuild

1. ✅ All new Course endpoints should work (GET, POST, PUT, DELETE)
2. ✅ Student verification workflow should work
3. ✅ Email sending for barcode information should work
4. ✅ Database should recreate with updated schema including:
   - New `courses` table with all columns
   - Updated `students` table with `email`, `verified`, `registration_date` columns
5. ✅ No compilation errors
6. ✅ All @Autowired dependencies resolved
7. ✅ Application starts successfully on http://localhost:8080

---

## 🎯 Quick Test Script

Once the application is running, test all new features:

```bash
# Test 1: Get all courses (should return empty array initially)
curl http://localhost:8080/api/courses

# Test 2: Create a course
curl -X POST http://localhost:8080/api/courses \
  -H "Content-Type: application/json" \
  -d '{"courseCode":"BSC125","courseName":"Software Engineering","department":"Computer Science","creditHours":3,"instructor":"Dr. Smith"}'

# Test 3: Get pending students
curl http://localhost:8080/api/students/pending

# Test 4: Verify a student (replace {id} with actual student ID)
curl -X PUT http://localhost:8080/api/students/1/verify
```

---

**Last Updated:** January 17, 2026
**Status:** ✅ All changes implemented and ready for rebuild
