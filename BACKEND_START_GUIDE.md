# 🚀 Backend Startup - Quick Visual Guide

## Step-by-Step Instructions

### Step 1️⃣: Open Command Prompt
1. Press **Windows Key + R**
2. Type: `cmd`
3. Press **Enter**

### Step 2️⃣: Navigate to Backend Folder
```bash
cd C:\Users\sstac\OneDrive\Desktop\exam-invigilator-app-repo\backend
```

### Step 3️⃣: Run the Build Script
```bash
build.bat
```

### Step 4️⃣: Wait for Output
You'll see:
```
============================================
Exam Invigilator Backend - Build & Run
============================================

[Step 1/3] Cleaning old build...
[Step 2/3] Building project with Maven...
[Step 3/3] Starting Backend Server...

============================================
✅ Build Successful!
============================================

📍 Server starting on http://localhost:8080
📚 API Base: http://localhost:8080/api

🔑 Default Login Credentials:
   Username: invigilator1
   Password: password123
============================================
```

### Step 5️⃣: See This Message
```
2026-03-01 14:30:45 - Exam Invigilator API is running!
```

✅ **Backend is running!**

---

## Test It Works

### Option A: Quick Test in Browser
Navigate to: **http://localhost:8080/api/exams**

You should see a JSON list like:
```json
[
  {
    "id": 1,
    "courseCode": "BSC121",
    "courseName": "Software Engineering",
    "venue": "Hall A",
    "examDate": "2026-03-01",
    "startTime": "14:25:00",
    "duration": 180,
    "invigilator": {
      "username": "invigilator1",
      "fullName": "John Doe"
    }
  }
]
```

### Option B: Test Login via Command Prompt

In a **NEW** command prompt (keep first one running):

```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"invigilator1\",\"password\":\"password123\"}"
```

You should see:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJpbnZpZ2lsYXRvcjEiLCJpYXQiOjE3NDA4NTcwNDUsImV4cCI6MTc0MDk0MzQ0NX0...",
  "username": "invigilator1",
  "fullName": "John Doe",
  "role": "INVIGILATOR"
}
```

### Option C: Get All Students

```bash
curl http://localhost:8080/api/students
```

You should see list of 8 students (BCS25165336 - BCS25165343)

---

## 🎯 Main Features Now Available

### Exam Management
- View all exams (1 active: BSC121 - Software Engineering)
- Get exam details
- View students enrolled in exam
- Add/remove students from exams

### Attendance Tracking
- Mark student attendance (PRESENT/ABSENT/LATE)
- View attendance records
- Get attendance summary
- **Undo attendance marks** (NEW!)

### Incident Reporting
- Report exam incidents
- Filter by severity (LOW/MEDIUM/HIGH)
- Get incident details

### Student Management
- Register new students
- Search students
- Verify student status
- Generate barcodes

### Authentication
- JWT token-based security
- Role-based access (INVIGILATOR, LIBRARIAN, ADMIN)
- Secure login endpoint

---

## 📊 Sample Data Ready to Use

### Users Available
| Username | Password | Role |
|----------|----------|------|
| invigilator1 | password123 | INVIGILATOR |
| invigilator2 | password123 | INVIGILATOR |
| librarian1 | password123 | LIBRARIAN |
| librarian2 | password321 | LIBRARIAN |
| admin | admin123 | ADMIN |

### Students Ready for Testing (8 total)
- BCS25165336 - Alice Smith
- BCS25165337 - Bob Johnson
- BCS25165338 - Carol Williams
- BCS25165339 - David Brown
- BCS25165340 - Eve Davis
- BCS25165341 - Frank Miller
- BCS25165342 - Grace Lee
- BCS25165343 - Henry Wilson

### Active Exam Ready
- **Exam ID**: 1
- **Course**: BSC121 - Software Engineering
- **Venue**: Hall A
- **Status**: ONGOING (3 hour duration)
- **Invigilator**: John Doe (invigilator1)
- **Students**: All 8 above enrolled

---

## ❌ If Something Goes Wrong

### Problem: "mvn not found"
✅ **Solution**: Let the script download Maven automatically. It only happens once.

### Problem: "Port 8080 already in use"
✅ **Solution**: 
1. Kill existing Java process: `taskkill /IM java.exe /F`
2. Or change port in `application.properties`: `server.port=8081`

### Problem: "Database locked"
✅ **Solution**: 
1. Stop the server (Ctrl+C)
2. Delete `examdb.db` file
3. Run `build.bat` again

### Problem: "Compilation errors"
✅ **Solution**:
1. Stop server (Ctrl+C)
2. Run: `mvn clean`
3. Run: `build.bat` again

### Problem: "Cannot access http://localhost:8080"
✅ **Solution**: Check if server is actually running - you should see:
```
Exam Invigilator API is running!
```
in the output.

---

## ✅ Success Checklist

- [ ] Command prompt opened
- [ ] Navigated to `backend` folder
- [ ] Ran `build.bat`
- [ ] Saw "✅ Build Successful!"
- [ ] Saw "Exam Invigilator API is running!"
- [ ] Server is listening on http://localhost:8080
- [ ] Can access http://localhost:8080/api/exams in browser
- [ ] See 1 exam (BSC121) in the list
- [ ] Can login with invigilator1/password123
- [ ] Got JWT token from login
- [ ] Can see 8 students for exam
- [ ] Backend is ready! ✅

---

## 🎉 You're All Set!

Your backend is **RUNNING** and **READY** to:
- ✅ Accept API calls
- ✅ Authenticate users
- ✅ Manage exams
- ✅ Track attendance
- ✅ Report incidents
- ✅ Work with the frontend

**Keep the command prompt window open while using the backend!**

To stop: Press `Ctrl+C`

---

## Next: Connect Frontend

Once backend is running:

```bash
cd ..\frontend
npm start
```

Then login to http://localhost:3000 with:
- Username: `invigilator1`
- Password: `password123`

And start testing! 🚀

