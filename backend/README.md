# Exam Invigilator Backend - Setup Guide

## 🚀 Quick Start

### 1. Open Project in IntelliJ
1. Open IntelliJ IDEA Ultimate
2. Click **File → Open**
3. Select the `backend` folder
4. Wait for Maven to download dependencies (see bottom-right progress bar)

### 2. Run the Application
1. Navigate to `src/main/java/com/examapp/ExamInvigilatorApplication.java`
2. Right-click the file → **Run 'ExamInvigilatorApplication'**
3. Wait for console to show: `✅ Exam Invigilator API is running!`

### 3. Test the API
Open Postman and test the login endpoint:

**Request:**
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "invigilator1",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "invigilator1",
  "fullName": "John Doe",
  "role": "INVIGILATOR"
}
```

---

## 📊 Sample Data (Auto-Created)

### Default Users:
| Username | Password | Role |
|----------|----------|------|
| invigilator1 | password123 | INVIGILATOR |
| invigilator2 | password123 | INVIGILATOR |
| admin | admin123 | ADMIN |

### Sample Exams:
- **BSC121** - Software Engineering (Today, 9:00 AM, Hall A)
- **BSC122** - Database Systems (Tomorrow, 2:00 PM, Hall B)
- **BSC123** - Data Structures (In 3 days, 10:00 AM, Lab C)
- **BSC124** - Computer Networks (In 5 days, 9:00 AM, Hall A)

### Sample Students:
- 8 students with IDs from BCS25165336 to BCS25165343

---

## 🔧 API Endpoints Quick Reference

### Authentication
- `POST /api/auth/login` - Login (no token required)
- `POST /api/auth/logout` - Logout

### Exams
- `GET /api/exams` - Get my exams (requires token)
- `GET /api/exams/{id}` - Get exam details
- `GET /api/exams/{id}/students` - Get students for exam

### Attendance
- `POST /api/attendance` - Mark attendance (requires token)
- `GET /api/attendance/exam/{examId}` - Get attendance list
- `GET /api/attendance/exam/{examId}/summary` - Get attendance summary

### Incidents
- `POST /api/incidents` - Report incident (requires token)
- `GET /api/incidents/exam/{examId}` - Get incidents for exam

---

## 🧪 Testing with Postman

### Step 1: Login
```
POST http://localhost:8080/api/auth/login
Body: {"username": "invigilator1", "password": "password123"}
```
Copy the `token` from response.

### Step 2: Get My Exams (Protected)
```
GET http://localhost:8080/api/exams
Headers: Authorization: Bearer YOUR_TOKEN_HERE
```

### Step 3: Mark Attendance
```
POST http://localhost:8080/api/attendance
Headers: Authorization: Bearer YOUR_TOKEN_HERE
Body: {
  "examId": 1,
  "studentId": 1,
  "status": "PRESENT",
  "method": "MANUAL"
}
```

---

## 📁 Database Location
SQLite database file: `backend/examdb.db`

You can view it with: [DB Browser for SQLite](https://sqlitebrowser.org/)

---

## ⚠️ Troubleshooting

### Port 8080 Already in Use
If you see `Port 8080 is already in use`, kill the process:
```bash
# On Windows (Command Prompt as Admin)
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F

# On Mac/Linux
lsof -ti:8080 | xargs kill -9
```

### Maven Dependencies Not Downloading
1. Right-click `pom.xml` → **Maven → Reload Project**
2. Or run: **File → Invalidate Caches → Invalidate and Restart**

### Cannot Find Application Class
Make sure your package structure matches:
```
src/main/java/com/examapp/
├── ExamInvigilatorApplication.java
├── config/
├── controller/
├── model/
├── repository/
├── service/
├── dto/
└── util/
```

---

## ✅ Backend Complete!
Once the server is running without errors, you're ready to build the React frontend!