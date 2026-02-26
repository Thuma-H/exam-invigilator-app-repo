# GitHub Copilot Prompt – Exam Invigilator Backend Rebuild

> **How to use:** Copy the block(s) below into the GitHub Copilot Chat panel inside IntelliJ IDEA
> (`View → Tool Windows → GitHub Copilot`), or paste directly into an open file as a comment
> before pressing `Tab` / `Alt+\` to trigger an inline suggestion.

---

## 🏗️ Full Backend Rebuild Prompt

Paste this entire block into GitHub Copilot Chat:

```
I need you to help me rebuild a Spring Boot backend for an Exam Invigilator application.
Below is the complete specification. Generate all files one at a time when I ask, following
these exact requirements.

==========================================================
PROJECT: Exam Invigilator Application – Backend
==========================================================

TECH STACK
----------
- Java 17
- Spring Boot 3.1.5
- Spring Data JPA (Hibernate)
- Spring Security (JWT – stateless, all routes currently open while in dev)
- SQLite database (dialect: org.hibernate.community.dialect.SQLiteDialect)
- JWT library: io.jsonwebtoken (jjwt) 0.11.5
- Barcode generation: com.google.zxing (core + javase) 3.5.2
- Email: spring-boot-starter-mail (Gmail SMTP)
- Dotenv: me.paulschwarz:spring-dotenv:4.0.0
- BCrypt for password hashing (spring-security-crypto)
- Maven build tool, packaging: jar
- Group ID: com.examapp  |  Artifact ID: exam-invigilator  |  Version: 1.0.0

PACKAGE STRUCTURE
-----------------
com.examapp
├── ExamInvigilatorApplication.java   (main class)
├── config/
│   ├── SecurityConfig.java
│   └── DataInitializer.java
├── controller/
│   ├── AuthController.java
│   ├── AttendanceController.java
│   ├── BarcodeController.java
│   ├── CourseController.java
│   ├── ExamController.java
│   ├── IncidentController.java
│   └── StudentController.java
├── dto/
│   ├── AttendanceRequest.java
│   ├── AttendanceSummary.java
│   ├── IncidentRequest.java
│   ├── LoginRequest.java
│   └── LoginResponse.java
├── model/
│   ├── Attendance.java
│   ├── Course.java
│   ├── Exam.java
│   ├── Incident.java
│   ├── Student.java
│   └── User.java
├── repository/
│   ├── AttendanceRepository.java
│   ├── CourseRepository.java
│   ├── ExamRepository.java
│   ├── IncidentRepository.java
│   ├── StudentRepository.java
│   └── UserRepository.java
├── service/
│   ├── AttendanceService.java
│   ├── AuthService.java
│   ├── BarcodeService.java
│   ├── EmailService.java
│   ├── ExamService.java
│   └── IncidentService.java
└── util/
    └── JwtUtil.java

==========================================================
DATABASE (SQLite – file: examdb.db)
==========================================================

Tables and key columns:

users
  id BIGINT PK, username VARCHAR UNIQUE NOT NULL, password VARCHAR NOT NULL,
  full_name VARCHAR NOT NULL, role VARCHAR NOT NULL   -- 'INVIGILATOR'|'LIBRARIAN'|'ADMIN'

courses
  id BIGINT PK, course_code VARCHAR UNIQUE NOT NULL, course_name VARCHAR NOT NULL,
  department VARCHAR NOT NULL, credit_hours INT, instructor VARCHAR,
  registration_date TIMESTAMP

students
  id BIGINT PK, student_id VARCHAR UNIQUE NOT NULL (e.g. 'BCS25165336'),
  full_name VARCHAR NOT NULL, program VARCHAR NOT NULL, email VARCHAR,
  verified BOOLEAN NOT NULL DEFAULT FALSE, registration_date TIMESTAMP

exams
  id BIGINT PK, course_code VARCHAR NOT NULL, course_name VARCHAR NOT NULL,
  venue VARCHAR NOT NULL, exam_date DATE NOT NULL, start_time TIME NOT NULL,
  duration INT NOT NULL (minutes), invigilator_id BIGINT FK→users

exam_students (join table)
  exam_id BIGINT FK→exams, student_id BIGINT FK→students

attendance
  id BIGINT PK, exam_id BIGINT FK→exams, student_id BIGINT FK→students,
  status VARCHAR NOT NULL ('PRESENT'|'ABSENT'|'LATE'),
  marked_at TIMESTAMP, marked_by VARCHAR, method VARCHAR ('MANUAL'|'SCANNED')

incidents
  id BIGINT PK, exam_id BIGINT FK→exams, student_id BIGINT FK→students (nullable),
  category VARCHAR NOT NULL ('CHEATING'|'HEALTH_EMERGENCY'|'DISRUPTION'|'OTHER'),
  severity VARCHAR NOT NULL ('LOW'|'MEDIUM'|'HIGH'),
  description VARCHAR(1000) NOT NULL, reported_at TIMESTAMP NOT NULL,
  reported_by VARCHAR NOT NULL, evidence_file VARCHAR

==========================================================
MODELS (JPA Entities)
==========================================================

User
  @Entity @Table(name="users")
  Fields: Long id, String username (unique), String password (@JsonIgnore), 
          String fullName, String role
  GenerationType.AUTO for all @Id fields

Student
  @Entity @Table(name="students")
  Fields: Long id, String studentId (unique, column="student_id"),
          String fullName (column="full_name"), String program,
          String email (nullable), Boolean verified (default false),
          LocalDateTime registrationDate (column="registration_date")
  Default constructor sets registrationDate = LocalDateTime.now()

Course
  @Entity @Table(name="courses")
  Fields: Long id, String courseCode (unique, column="course_code"),
          String courseName (column="course_name"), String department,
          Integer creditHours (column="credit_hours"), String instructor,
          LocalDateTime registrationDate (column="registration_date")
  Default constructor sets registrationDate = LocalDateTime.now()

Exam
  @Entity @Table(name="exams") @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
  Fields: Long id, String courseCode, String courseName, String venue,
          LocalDate examDate, LocalTime startTime, Integer duration,
          User invigilator (@ManyToOne EAGER, @JsonIgnoreProperties({"password","authorities"})),
          List<Student> students (@ManyToMany LAZY via exam_students join table, @JsonIgnore)

Attendance
  @Entity @Table(name="attendance")
  Fields: Long id,
          Exam exam (@ManyToOne, @JsonIgnoreProperties({"students","invigilator"})),
          Student student (@ManyToOne, @JsonIgnoreProperties({"exams"})),
          String status, LocalDateTime markedAt, String markedBy, String method

Incident
  @Entity @Table(name="incidents")
  Fields: Long id,
          Exam exam (@ManyToOne, @JsonIgnoreProperties({"students","invigilator"})),
          Student student (@ManyToOne nullable, @JsonIgnoreProperties({"exams"})),
          String category, String severity, String description,
          LocalDateTime reportedAt, String reportedBy, String evidenceFile

==========================================================
REPOSITORIES (extend JpaRepository)
==========================================================

UserRepository
  Optional<User> findByUsername(String username)
  boolean existsByUsername(String username)

StudentRepository
  Optional<Student> findByStudentId(String studentId)
  List<Student> findByProgram(String program)
  boolean existsByStudentId(String studentId)
  List<Student> findByFullNameContainingIgnoreCase(String fullName)
  List<Student> findByVerified(Boolean verified)

CourseRepository
  Optional<Course> findByCourseCode(String courseCode)
  List<Course> findByDepartment(String department)
  boolean existsByCourseCode(String courseCode)
  List<Course> findByCourseNameContainingIgnoreCase(String courseName)

ExamRepository
  List<Exam> findByInvigilator(User invigilator)
  List<Exam> findByInvigilatorAndExamDate(User invigilator, LocalDate date)
  List<Exam> findByCourseCode(String courseCode)

AttendanceRepository
  List<Attendance> findByExam(Exam exam)
  Optional<Attendance> findByExamAndStudent(Exam exam, Student student)
  long countByExamAndStatus(Exam exam, String status)
  boolean existsByExamAndStudent(Exam exam, Student student)
  List<Attendance> findByMarkedBy(String markedBy)

IncidentRepository
  List<Incident> findByExam(Exam exam)
  List<Incident> findByStudent(Student student)
  List<Incident> findByCategory(String category)
  List<Incident> findBySeverity(String severity)
  List<Incident> findByReportedBy(String reportedBy)
  long countByExam(Exam exam)
  List<Incident> findByExamAndSeverity(Exam exam, String severity)

==========================================================
SERVICES
==========================================================

AuthService
  LoginResponse login(LoginRequest request)
    → find user by username, BCrypt.matches password, generate JWT, return LoginResponse
  User registerUser(User user)  → encode password, save
  User validateToken(String token)  → extract username from JWT, find user, validate

JwtUtil (@Component)
  @Value("${jwt.secret}") String secret
  @Value("${jwt.expiration}") Long expiration
  String generateToken(String username)  → HMAC-SHA256, subject=username
  String extractUsername(String token)
  Boolean validateToken(String token, String username)
  → uses Keys.hmacShaKeyFor(secret.getBytes()), Jwts.parserBuilder()

ExamService
  List<Exam> getAllExams()
  List<Exam> getExamsForInvigilator(String username)
  List<Exam> getExamsForInvigilatorByDate(String username, LocalDate date)
  Optional<Exam> getExamById(Long id)
  List<Student> getStudentsForExam(Long examId)
  List<Exam> getExamsByCourseCode(String courseCode)

AttendanceService
  Attendance markAttendance(AttendanceRequest request, String markedBy)
    → check exam exists, check student exists, check not already marked (throw "already marked"),
      create Attendance, save
  AttendanceSummary getAttendanceSummary(Long examId)
    → counts PRESENT/ABSENT/LATE, total enrolled students
  List<Attendance> getAttendanceForExam(Long examId)
  Attendance updateAttendanceStatus(Long attendanceId, String newStatus)
  List<Attendance> getAttendanceByInvigilator(String username)

IncidentService
  Incident reportIncident(IncidentRequest request, String reportedBy)
    → find exam, optionally find student, create Incident with LocalDateTime.now(), save
  List<Incident> getIncidentsForExam(Long examId)
  List<Incident> getIncidentsByCategory(String category)
  List<Incident> getIncidentsBySeverity(String severity)
  List<Incident> getIncidentsByReporter(String username)
  List<Incident> getIncidentsByStudent(Long studentId)
  List<Incident> getHighSeverityIncidents(Long examId)
    → findByExamAndSeverity(exam, "HIGH")
  long countIncidentsForExam(Long examId)
  Incident attachEvidence(Long incidentId, String filePath)

BarcodeService (@Service)
  String BARCODE_DIR = "barcodes/"
  Uses Code128Writer (ZXing), width=300, height=100
  String generateBarcode(String studentId)   → saves PNG to barcodes/{studentId}.png
  byte[] generateBarcodeBytes(String studentId)  → returns PNG as byte[]
  Path getBarcodeFile(String studentId)
  boolean barcodeExists(String studentId)
  int generateBulkBarcodes(String[] studentIds)

EmailService (@Service)
  Uses JavaMailSender, @Value("${librarian.email}")
  void notifyNewStudent(String studentId, String fullName, String program)
    → sends to librarian email, subject "New Student ID Card Request – {studentId}"
  void sendBarcodeInfoToStudent(String studentEmail, String studentId, String fullName)
    → sends barcode-ready notification to student

==========================================================
DTOs
==========================================================

LoginRequest  { String username, String password }
LoginResponse { String token, String username, String fullName, String role }
AttendanceRequest { Long examId, Long studentId, String status, String method }
AttendanceSummary { Long examId, int totalStudents, int presentCount,
                    int absentCount, int lateCount, double attendancePercentage }
IncidentRequest { Long examId, Long studentId (nullable), String category,
                  String severity, String description }

==========================================================
CONTROLLERS (all @CrossOrigin(origins="*"))
==========================================================

POST   /api/auth/login            → AuthController.login
GET    /api/auth/validate          → AuthController.validateToken (Authorization header)
POST   /api/auth/logout            → returns 200 "Logged out successfully"

GET    /api/exams                  → getMyExams (optional auth; no auth → all exams)
GET    /api/exams/{examId}         → getExamById
GET    /api/exams/date/{date}      → getExamsByDate (auth required)
GET    /api/exams/{examId}/students
GET    /api/exams/course/{courseCode}

GET    /api/attendance/exam/{examId}
GET    /api/attendance/exam/{examId}/summary
POST   /api/attendance              → markAttendance (auth required)
PUT    /api/attendance/{attendanceId}
GET    /api/attendance/my-records   (auth required)

POST   /api/incidents               → reportIncident (auth required)
GET    /api/incidents/exam/{examId}
GET    /api/incidents/category/{category}
GET    /api/incidents/severity/{severity}
GET    /api/incidents/my-reports    (auth required)
GET    /api/incidents/exam/{examId}/high-severity
GET    /api/incidents/exam/{examId}/count
GET    /api/incidents/student/{studentId}

POST   /api/students                → registerStudent (generates barcode, emails librarian)
GET    /api/students
GET    /api/students/search?studentId=
GET    /api/students/pending
PUT    /api/students/{id}/verify
POST   /api/students/{id}/send-barcode-email

GET    /api/courses
POST   /api/courses
PUT    /api/courses/{id}
DELETE /api/courses/{id}
GET    /api/courses/department/{department}

GET    /api/barcode/{studentId}
GET    /api/barcode/generate/{studentId}
GET    /api/barcode/check/{studentId}
GET    /api/barcode/download/{studentId}
POST   /api/barcode/generate-all

==========================================================
SECURITY CONFIG
==========================================================

- Stateless JWT (no sessions)
- All requests currently permitted (anyRequest().permitAll()) for development
- CORS: allowedOriginPatterns("*"), methods GET/POST/PUT/DELETE/OPTIONS, all headers
- @Bean PasswordEncoder → BCryptPasswordEncoder

==========================================================
APPLICATION PROPERTIES (application.properties)
==========================================================

spring.datasource.url=${DB_URL:jdbc:sqlite:examdb.db}
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}
spring.mail.host=${MAIL_HOST:smtp.gmail.com}
spring.mail.port=${MAIL_PORT:587}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
librarian.email=${LIBRARIAN_EMAIL}
server.address=0.0.0.0
server.port=${SERVER_PORT:8080}

==========================================================
DATA INITIALIZER (runs on startup if DB is empty)
==========================================================

Creates:
  5 users:
    invigilator1 / password123  (INVIGILATOR, "John Doe")
    invigilator2 / password123  (INVIGILATOR, "Jane Smith")
    librarian1   / password123  (LIBRARIAN,   "Librarian One")
    librarian2   / password321  (LIBRARIAN,   "Librarian Two")
    admin        / admin123     (ADMIN,        "Admin User")

  5 courses: BSC121–BSC125 (Computer Science / IT / Software Engineering)

  8 students: BCS25165336–BCS25165343

  4 exams: BSC121 today, BSC122 tomorrow, BSC123 +3 days, BSC124 +5 days

==========================================================
KNOWN PATTERNS / RULES
==========================================================

1. All IDs use @GeneratedValue(strategy = GenerationType.AUTO)
2. Never expose passwords in JSON → @JsonIgnore on User.password
3. Prevent lazy-load serialisation loops → @JsonIgnoreProperties on related entities
4. JWT helper method in each controller: private String extractUsername(String authHeader)
     { return jwtUtil.extractUsername(authHeader.substring(7)); }
5. Service layer throws RuntimeException with descriptive messages on not-found
6. AttendanceService must throw "Attendance already marked" if existsByExamAndStudent
7. BarcodeService creates "barcodes/" directory on startup if missing
8. EmailService catches all exceptions and logs them (never lets the request fail)
9. Main class prints startup banner to System.out

==========================================================
```

---

## 🔧 Individual File Prompts

Use these shorter prompts when you want Copilot to regenerate a specific file:

---

### Prompt: Rebuild `User.java`
```
In package com.examapp.model, generate a JPA @Entity class called User.
Table name: "users".
Fields: Long id (GenerationType.AUTO), String username (unique, not null),
String password (not null, @JsonIgnore), String fullName (column full_name, not null),
String role (not null) – valid values "INVIGILATOR", "LIBRARIAN", "ADMIN".
Include no-arg constructor, full-arg constructor, and all getters/setters.
Add a Javadoc class comment explaining it represents invigilators and admins.
```

---

### Prompt: Rebuild `Student.java`
```
In package com.examapp.model, generate a JPA @Entity class called Student.
Table name: "students".
Fields: Long id (GenerationType.AUTO), String studentId (unique, column="student_id", not null),
String fullName (column="full_name", not null), String program (not null),
String email (nullable), Boolean verified (not null, default false),
LocalDateTime registrationDate (column="registration_date").
Default constructor must set registrationDate = LocalDateTime.now().
Convenience constructor: Student(String studentId, String fullName, String program)
  also sets registrationDate = LocalDateTime.now().
Include all getters/setters.
```

---

### Prompt: Rebuild `Exam.java`
```
In package com.examapp.model, generate a JPA @Entity called Exam.
Table name: "exams". Annotate class with @JsonIgnoreProperties({"hibernateLazyInitializer","handler"}).
Fields:
  Long id (AUTO), String courseCode (column course_code, not null),
  String courseName (column course_name, not null), String venue (not null),
  LocalDate examDate (column exam_date, not null), LocalTime startTime (column start_time, not null),
  Integer duration (not null, minutes),
  User invigilator (@ManyToOne EAGER, @JoinColumn(invigilator_id), @JsonIgnoreProperties({"password","authorities"})),
  List<Student> students (@ManyToMany LAZY, @JoinTable(exam_students, joinColumns=exam_id, inverseColumns=student_id), @JsonIgnore).
No-arg + full-arg constructors, all getters/setters.
```

---

### Prompt: Rebuild `SecurityConfig.java`
```
In package com.examapp.config, generate a Spring Security @Configuration class called SecurityConfig.
Requirements:
  - Disable CSRF
  - Stateless session management (SessionCreationPolicy.STATELESS)
  - Permit all requests (anyRequest().permitAll()) – development mode
  - CORS: allowedOriginPatterns("*"), methods GET/POST/PUT/DELETE/OPTIONS,
          all headers, allowCredentials=false, expose "Authorization" header
  - @Bean PasswordEncoder returning new BCryptPasswordEncoder()
  - Use lambda DSL (Spring Security 6 style)
```

---

### Prompt: Rebuild `JwtUtil.java`
```
In package com.examapp.util, generate a @Component class called JwtUtil.
It must:
  - Read @Value("${jwt.secret}") String secret and @Value("${jwt.expiration}") Long expiration
  - Build the signing key with Keys.hmacShaKeyFor(secret.getBytes())
  - String generateToken(String username) – creates HS256 JWT with subject=username,
    issuedAt=now, expiration=now+expiration ms
  - String extractUsername(String token)
  - Boolean validateToken(String token, String username) – checks subject match and not expired
  - Use io.jsonwebtoken (jjwt) 0.11.5 API: Jwts.parserBuilder().setSigningKey().build().parseClaimsJws()
```

---

### Prompt: Rebuild `AttendanceService.java`
```
In package com.examapp.service, generate a @Service class called AttendanceService.
Inject: AttendanceRepository, ExamRepository, StudentRepository.
Methods:
  Attendance markAttendance(AttendanceRequest req, String markedBy)
    - Find Exam by req.examId (throw RuntimeException "Exam not found" if missing)
    - Find Student by req.studentId (throw "Student not found")
    - If attendanceRepository.existsByExamAndStudent → throw "Attendance already marked for this student"
    - Create Attendance(exam, student, req.status, LocalDateTime.now(), markedBy, req.method), save

  AttendanceSummary getAttendanceSummary(Long examId)
    - Count PRESENT, ABSENT, LATE via countByExamAndStatus
    - Total = exam.getStudents().size()
    - attendancePercentage = (presentCount / (double) totalStudents) * 100

  List<Attendance> getAttendanceForExam(Long examId)
  Attendance updateAttendanceStatus(Long attendanceId, String newStatus)
  List<Attendance> getAttendanceByInvigilator(String username)
```

---

### Prompt: Rebuild `DataInitializer.java`
```
In package com.examapp.config, generate a @Component class called DataInitializer
that implements CommandLineRunner.
Inject: UserRepository, ExamRepository, StudentRepository, CourseRepository, PasswordEncoder.
In run(): only execute if userRepository.count() == 0.

Create users:
  invigilator1/password123 INVIGILATOR "John Doe"
  invigilator2/password123 INVIGILATOR "Jane Smith"
  librarian1/password123   LIBRARIAN   "Librarian One"
  librarian2/password321   LIBRARIAN   "Librarian Two"
  admin/admin123           ADMIN       "Admin User"
  (BCrypt-encode all passwords)

Create courses: BSC121 "Software Engineering" CS 3 "Dr. John Smith",
  BSC122 "Database Systems" CS 3 "Dr. Jane Doe",
  BSC123 "Data Structures and Algorithms" CS 4 "Dr. Robert Johnson",
  BSC124 "Computer Networks" IT 3 "Dr. Emily Brown",
  BSC125 "Web Development" SE 3 "Dr. Michael Davis"

Create students: BCS25165336–BCS25165343 (Alice, Bob, Carol, David, Eve, Frank, Grace, Henry)
  programs: CS, CS, IT, SE, CS, CS, IT, SE

Create exams:
  BSC121 "Software Engineering" Hall A LocalDate.now() 16:50 20min invigilator1 (students 1-5)
  BSC122 "Database Systems" Hall B now+1d 14:00 120min invigilator1 (students 1,3,5,6,7)
  BSC123 "Data Structures..." Lab C now+3d 10:00 150min invigilator2 (students 2,4,6,8)
  BSC124 "Computer Networks" Hall A now+5d 09:00 180min invigilator1 (all 8 students)

Print startup messages with ✓ counts and default login credentials.
```

---

## 📦 pom.xml Dependencies Block

Copy into your `pom.xml` `<dependencies>` section:

```xml
<!-- Spring Boot Web -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<!-- Spring Data JPA -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<!-- Spring Security -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<!-- SQLite JDBC -->
<dependency>
  <groupId>org.xerial</groupId>
  <artifactId>sqlite-jdbc</artifactId>
  <version>3.43.0.0</version>
</dependency>
<!-- Hibernate SQLite dialect -->
<dependency>
  <groupId>org.hibernate.orm</groupId>
  <artifactId>hibernate-community-dialects</artifactId>
</dependency>
<!-- JWT -->
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-api</artifactId>
  <version>0.11.5</version>
</dependency>
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-impl</artifactId>
  <version>0.11.5</version>
  <scope>runtime</scope>
</dependency>
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-jackson</artifactId>
  <version>0.11.5</version>
  <scope>runtime</scope>
</dependency>
<!-- BCrypt -->
<dependency>
  <groupId>org.springframework.security</groupId>
  <artifactId>spring-security-crypto</artifactId>
</dependency>
<!-- Mail -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
<!-- ZXing Barcode -->
<dependency>
  <groupId>com.google.zxing</groupId>
  <artifactId>core</artifactId>
  <version>3.5.2</version>
</dependency>
<dependency>
  <groupId>com.google.zxing</groupId>
  <artifactId>javase</artifactId>
  <version>3.5.2</version>
</dependency>
<!-- Dotenv -->
<dependency>
  <groupId>me.paulschwarz</groupId>
  <artifactId>spring-dotenv</artifactId>
  <version>4.0.0</version>
</dependency>
<!-- Dev Tools -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-devtools</artifactId>
  <scope>runtime</scope>
  <optional>true</optional>
</dependency>
```

---

## 🔐 `.env` File Template

Create a file named `.env` in the **project root** (next to `backend/`):

```env
# Server
SERVER_PORT=8080

# Database
DB_URL=jdbc:sqlite:examdb.db

# JWT – generate a random 64-character string
JWT_SECRET=REPLACE_WITH_64_CHAR_RANDOM_STRING
JWT_EXPIRATION=86400000

# Gmail SMTP
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-16-char-app-password

# Librarian notification email
LIBRARIAN_EMAIL=librarian@example.com
```

> **Important:** Add `.env` and `examdb.db` to `.gitignore` – never commit real credentials.

---

## ✅ Quick Rebuild Checklist (IntelliJ)

1. Delete `examdb.db` (if it exists) to reset the database schema
2. Open **Maven** tool window → **exam-invigilator** → **Lifecycle** → `clean` then `install`
3. Run `ExamInvigilatorApplication.java` (right-click → Run)
4. Confirm console shows:
   ```
   ✓ Created 5 users (2 invigilators, 2 librarians, 1 admin)
   ✓ Created 5 courses
   ✓ Created 8 students
   ✓ Created 4 exams with enrolled students
   ```
5. Test login: `POST http://localhost:8080/api/auth/login`
   ```json
   { "username": "invigilator1", "password": "password123" }
   ```

---

**Last updated:** 2026-02-26 | Status: ✅ Ready for use in GitHub Copilot (IntelliJ)
