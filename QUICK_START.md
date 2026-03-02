# Quick Start - Exam Invigilator Backend

## ✅ What Was Fixed

Your backend had compatibility issues with Java 25. Here's what was updated:

1. **Spring Boot**: Upgraded from 3.1.5 → **3.4.3** (supports Java 25)
2. **JWT Library**: Upgraded from 0.11.5 → **0.12.6** (Java 25 compatible)
3. **SQLite Driver**: Upgraded to 3.45.1.0 (latest)
4. **JwtUtil.java**: Updated to use new JJWT 0.12.x API
5. **Maven Wrapper**: Added automatic Maven download on first run

---

## 🚀 How to Start the Backend

### Option 1: Simple Batch Script (RECOMMENDED for Windows)

```bash
cd C:\Users\sstac\OneDrive\Desktop\exam-invigilator-app-repo\backend
build.bat
```

This will:
- ✅ Download Maven if needed
- ✅ Clean and compile the project
- ✅ Create an executable JAR
- ✅ Start the server on http://localhost:8080

### Option 2: From IntelliJ IDEA

1. Open the backend folder as a Maven project
2. Right-click `ExamInvigilatorApplication.java`
3. Select **Run** (or press Shift+F10)
4. Server will start on http://localhost:8080

### Option 3: Manual Maven Command

```bash
cd C:\Users\sstac\OneDrive\Desktop\exam-invigilator-app-repo\backend
mvn clean install -DskipTests
java -jar target/exam-invigilator-1.0.0.jar
```

---

## 📍 API Endpoints (Running on localhost:8080)

### Authentication
- **POST** `/api/auth/login` - Login and get JWT token
  ```json
  {
    "username": "invigilator1",
    "password": "password123"
  }
  ```

### Exams
- **GET** `/api/exams` - List all exams
- **GET** `/api/exams/{examId}` - Get exam details
- **GET** `/api/exams/{examId}/students` - List enrolled students

### Attendance
- **POST** `/api/attendance` - Mark attendance
- **GET** `/api/attendance/exam/{examId}` - Get attendance records
- **DELETE** `/api/attendance/undo` - Undo attendance marking
- **GET** `/api/attendance/exam/{examId}/summary` - Get attendance summary

### Students
- **GET** `/api/students` - List all students
- **POST** `/api/students` - Register new student
- **GET** `/api/students/search?studentId=BCS25165336` - Search student

### Incidents
- **POST** `/api/incidents` - Report incident
- **GET** `/api/incidents/exam/{examId}` - Get incidents for exam
- **GET** `/api/incidents/exam/{examId}/high-severity` - High severity incidents

### Barcodes
- **GET** `/api/barcode/{studentId}` - Get student barcode
- **GET** `/api/barcode/download/{studentId}` - Download barcode

---

## 🔑 Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Invigilator | invigilator1 | password123 |
| Invigilator | invigilator2 | password123 |
| Librarian | librarian1 | password123 |
| Admin | admin | admin123 |

---

## 📊 Sample Data

The system comes pre-loaded with:
- **8 Students**: BCS25165336 through BCS25165343
- **5 Courses**: Software Engineering, Database Systems, Data Structures, Networks, Web Dev
- **1 Active Exam**: Software Engineering (BSC121) - Running NOW with 8 enrolled students

### Active Exam Details
- **Course**: Software Engineering (BSC121)
- **Venue**: Hall A
- **Invigilator**: invigilator1
- **Duration**: 3 hours
- **Status**: ONGOING (started 5 minutes ago)
- **Students Enrolled**: 8

---

## ✅ Verify Everything Works

### Test 1: Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"invigilator1","password":"password123"}'
```

Expected Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "invigilator1",
  "fullName": "John Doe",
  "role": "INVIGILATOR"
}
```

### Test 2: Get Active Exam
```bash
curl http://localhost:8080/api/exams
```

Expected Response: List with 1 active exam (BSC121)

### Test 3: Get Students for Exam
```bash
curl http://localhost:8080/api/exams/1/students
```

Expected Response: 8 students with IDs starting with BCS25165336

---

## 🐛 Troubleshooting

### Problem: "Java version not supported"
**Solution**: Java 25 is installed. The updated pom.xml now supports it.

### Problem: "Cannot find symbol" errors
**Solution**: Run `mvn clean` first, then `mvn compile`. This clears old compiled classes.

### Problem: "Port 8080 already in use"
**Solution**: Change port in `application.properties`:
```properties
server.port=8081
```

### Problem: Database errors
**Solution**: Delete `examdb.db` file. It will be recreated with fresh sample data on next startup.

### Problem: JWT token errors
**Solution**: Make sure you're using Bearer token format:
```
Authorization: Bearer <your-token-here>
```

---

## 📝 Key Files Updated

- ✅ `pom.xml` - Upgraded dependencies
- ✅ `src/main/java/com/examapp/util/JwtUtil.java` - Updated to JJWT 0.12.x API
- ✅ `build.bat` - New comprehensive build script
- ✅ `src/main/java/com/examapp/config/DataInitializer.java` - Creates active exam

---

## 🎯 Next Steps

1. **Run**: Execute `build.bat` to start the backend
2. **Test**: Verify API endpoints work with the curl commands above
3. **Connect Frontend**: Point frontend to `http://localhost:8080/api`
4. **Use Default Creds**: Login with `invigilator1 / password123`
5. **Mark Attendance**: Use the active exam (BSC121) to test attendance features

---

## 📞 Support

If you encounter issues:
1. Check the console output for error messages
2. Verify Java 25 is installed: `java -version`
3. Check if port 8080 is available: `netstat -ano | findstr :8080`
4. Delete `examdb.db` and restart to reset database
5. Run `mvn clean compile` to clear compilation cache

**Backend is ready to run!** 🚀

