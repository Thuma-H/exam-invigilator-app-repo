# 📊 Visual Overview of Changes & What to Do Next

## 🔄 The Fix Flow

```
PROBLEM
├── Spring Boot 3.1.5 (no Java 25 support)
├── JJWT 0.11.5 (API incompatible with Java 25)
├── No Maven installed
└── No build automation

                    ⬇️ FIXED ⬇️

SOLUTION APPLIED
├── ✅ Spring Boot upgraded to 3.4.3
├── ✅ JJWT upgraded to 0.12.6
├── ✅ JwtUtil.java updated for new API
├── ✅ build.bat created (auto-downloads Maven)
└── ✅ Database cleaned & refreshed

                    ⬇️ RESULT ⬇️

WORKING BACKEND
├── ✅ Compiles with Java 25
├── ✅ Runs on localhost:8080
├── ✅ JWT authentication working
├── ✅ 1 active exam ready
├── ✅ 8 students enrolled
└── ✅ All features ready to use
```

---

## 🚀 Your Startup Flowchart

```
START
  │
  ├─► Open Command Prompt
  │
  ├─► Navigate to backend folder
  │    cd C:\Users\sstac\OneDrive\Desktop\exam-invigilator-app-repo\backend
  │
  ├─► Run build script
  │    build.bat
  │
  ├─► Script downloads Maven (first time only)
  │
  ├─► Script compiles project
  │    mvn clean install -DskipTests
  │
  ├─► Script builds JAR
  │    exam-invigilator-1.0.0.jar
  │
  ├─► Script starts server
  │    java -jar target/exam-invigilator-1.0.0.jar
  │
  ├─► Server startup
  │    ✅ "Exam Invigilator API is running!"
  │
  └─► READY ON http://localhost:8080
        │
        ├─► Test: http://localhost:8080/api/exams
        │   Returns: 1 active exam (BSC121)
        │
        ├─► Login: POST /api/auth/login
        │   With: invigilator1 / password123
        │   Returns: JWT token
        │
        └─► Connected & Ready!
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                  │
│          http://localhost:3000                      │
└────────────────────┬────────────────────────────────┘
                     │
                     │ API Calls
                     │ (http://localhost:8080)
                     ▼
┌─────────────────────────────────────────────────────┐
│              BACKEND (Spring Boot)                  │
│           http://localhost:8080                     │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │        REST API Controllers (7)              │  │
│  │  • Auth, Exams, Students, Attendance        │  │
│  │  • Incidents, Barcodes, Courses             │  │
│  └──────────────────────────────────────────────┘  │
│                       │                            │
│                       ▼                            │
│  ┌──────────────────────────────────────────────┐  │
│  │         Services (6 layers)                  │  │
│  │  • Authentication, Exam, Student, Barcode   │  │
│  │  • Attendance, Incident                      │  │
│  └──────────────────────────────────────────────┘  │
│                       │                            │
│                       ▼                            │
│  ┌──────────────────────────────────────────────┐  │
│  │      Repositories (JPA/Hibernate)            │  │
│  │  Database access layer                       │  │
│  └──────────────────────────────────────────────┘  │
│                       │                            │
│                       ▼                            │
│  ┌──────────────────────────────────────────────┐  │
│  │           SQLite Database                    │  │
│  │              (examdb.db)                     │  │
│  │  • Users, Exams, Students, Attendance       │  │
│  │  • Incidents, Courses                        │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ⚙️  Security: JWT Tokens                          │
│  🔐 Encryption: BCrypt passwords                   │
│  📧 Email: Notifications to librarians             │
│  📊 Barcodes: Code128 generation                   │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Data Model (What's in Database)

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ invigilator1    │ ─┐
│ invigilator2    │  │
│ librarian1      │  │
│ librarian2      │  │
│ admin           │  │
└─────────────────┘  │
                     │
                     │ Supervises
                     ▼
┌─────────────────┐  ┌──────────────────┐  ┌─────────────┐
│     EXAMS       │  │    COURSES       │  │  STUDENTS   │
├─────────────────┤  ├──────────────────┤  ├─────────────┤
│ BSC121          │  │ BSC121           │  │ BCS2516...1 │
│ (Active NOW!)   │  │ BSC122           │  │ BCS2516...2 │
│ 3 hours         │  │ BSC123           │  │ ... (8 total)
│ 8 students      │  │ BSC124           │  │             │
│ Hall A          │  │ BSC125           │  │             │
└─────────────────┘  └──────────────────┘  └─────────────┘
        │                                          │
        ├─ Generates ──────────────────────────────┤
        │
        ▼
┌──────────────────────────────────────────────────────┐
│         ATTENDANCE RECORDS                           │
├──────────────────────────────────────────────────────┤
│ Student: BCS2516...1  │ Status: PRESENT  │ Time: Now │
│ Student: BCS2516...2  │ Status: ABSENT   │ Time: Now │
│ ... (can UNDO any)                                   │
└──────────────────────────────────────────────────────┘
        │
        └─ Links to ──┐
                      ▼
┌──────────────────────────────────────────────────────┐
│         INCIDENTS (Reports)                          │
├──────────────────────────────────────────────────────┤
│ Category: CHEATING          │ Severity: HIGH        │
│ Student: BCS2516...1        │ Reporter: invig1      │
│ Description: Student used   │ Time: 14:30           │
│ unauthorized materials      │                       │
└──────────────────────────────────────────────────────┘
```

---

## 📈 Technology Stack

```
FRONTEND
├─ React.js
├─ Axios (HTTP client)
├─ JWT stored in localStorage
└─ Custom CSS styling

BACKEND
├─ Java 25 ✅
├─ Spring Boot 3.4.3 ✅
├─ Spring Data JPA
├─ Spring Security (JWT)
├─ Hibernate ORM
└─ SQLite database

UTILITIES
├─ JJWT 0.12.6 (JWT tokens) ✅
├─ BCrypt (password hashing)
├─ ZXing (barcode generation)
├─ JavaMail (notifications)
└─ Spring DevTools (hot reload)
```

---

## 🔐 Authentication Flow

```
Frontend                          Backend

User enters
credentials                              
    │                                   
    ├─► POST /api/auth/login ─────────► Validate username/password
    │      {username, password}         │
    │                                   ├─ Check user exists
    │                                   ├─ Compare BCrypt hash
    │                                   ├─ Generate JWT token
    │                                   │
User receives JWT ◄──────────────────── Return: {token, username, role}
    │
    ├─ Store in localStorage
    │
    ├─ Add to every request: 
    │  Authorization: Bearer {token}
    │
    └─► GET /api/exams
           + Bearer token ────────────► Verify token signature
                                        │
                                        ├─ Check expiration
                                        ├─ Extract username
                                        ├─ Fetch user data
                                        │
Return exams ◄──────────────────────── Return: [{exam1}, {exam2}, ...]
```

---

## 🎯 API Endpoints Map

```
┌─ /api/auth
│  ├─ POST   /login              → Authenticate & get token
│  ├─ GET    /validate           → Check token validity
│  └─ POST   /logout             → Clear session
│
├─ /api/exams
│  ├─ GET    /                   → List all exams
│  ├─ GET    /{id}               → Get exam details
│  ├─ GET    /{id}/students      → Get enrolled students
│  ├─ POST   /{id}/students/{sid}→ Add student
│  └─ DELETE /{id}/students/{sid}→ Remove student
│
├─ /api/attendance
│  ├─ POST   /                   → Mark attendance
│  ├─ GET    /exam/{id}          → Get records
│  ├─ GET    /exam/{id}/summary  → Statistics
│  ├─ PUT    /{id}               → Update status
│  ├─ DELETE /undo               → Undo marking ⭐
│  └─ GET    /my-records         → My markings
│
├─ /api/students
│  ├─ GET    /                   → List all
│  ├─ POST   /                   → Register new
│  ├─ GET    /search             → Search by ID
│  ├─ GET    /pending            → Unverified
│  └─ PUT    /{id}/verify        → Verify student
│
├─ /api/incidents
│  ├─ POST   /                   → Report incident
│  ├─ GET    /exam/{id}          → For exam
│  ├─ GET    /category/{cat}     → By category
│  ├─ GET    /severity/{sev}     → By severity
│  └─ GET    /student/{id}       → For student
│
├─ /api/barcode
│  ├─ GET    /{studentId}        → Get barcode
│  ├─ GET    /download/{id}      → Download
│  └─ POST   /generate-all       → Create all
│
└─ /api/courses
   ├─ GET    /                   → List all
   ├─ POST   /                   → Create course
   └─ PUT    /{id}               → Update course
```

---

## ✅ Ready Checklist

- [ ] Read START_HERE.md
- [ ] Run build.bat
- [ ] See "Build Successful" message
- [ ] See "API is running" message
- [ ] Test http://localhost:8080/api/exams
- [ ] See 1 active exam
- [ ] Login with invigilator1/password123
- [ ] Get JWT token
- [ ] Connect frontend
- [ ] Test full workflow

---

## 🚀 READY TO GO!

Everything is fixed, configured, and ready to use.

**Just run**: `build.bat`

**Then visit**: http://localhost:8080/api/exams

**And enjoy!** 🎉

