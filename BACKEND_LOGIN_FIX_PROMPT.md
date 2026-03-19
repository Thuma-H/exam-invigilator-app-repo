# INTELLIJ BACKEND PROMPT - FIX LOGIN & DATABASE INITIALIZATION

Copy this prompt into your IntelliJ Copilot Chat to fix the login issues and ensure the database initializes properly.

---

## PROMPT FOR COPILOT

I have a Spring Boot backend with login authentication that's not working properly. The frontend shows "Invalid username or password" even with correct credentials. I need you to:

**The Problem:**
1. Frontend login is failing with "Invalid username or password"
2. Database might not be initializing properly
3. Users might not be created in the database
4. The DataInitializer component should create test users on startup

**What Needs to Be Done:**

### 1. Verify DataInitializer is Working
Look at `com/examapp/config/DataInitializer.java` and ensure:
- It's annotated with @Component and @Order(2)
- It implements CommandLineRunner
- The `run()` method is public and creates test users
- It should create:
  - invigilator1 with password: password123
  - librarian1 with password: password123
  - librarian2 with password: password321
  - Other test users

If the DataInitializer exists, verify it:
- Runs when exam count is 0
- Creates users with password hashing using PasswordEncoder
- Sets user roles correctly (INVIGILATOR, LIBRARIAN, ADMIN)

### 2. Check AuthService Works Correctly
In `com/examapp/service/AuthService.java`:
- The login() method should:
  - Find user by username from UserRepository
  - Use PasswordEncoder.matches() to verify password
  - Generate JWT token using JwtUtil
  - Return LoginResponse with token, username, fullName, role
  - Return null if user not found or password wrong

- The validateToken() method should:
  - Extract username from JWT token
  - Find user in database
  - Validate token is not expired
  - Return user if valid, null otherwise

### 3. Ensure Database Initializes on Startup
The application should:
- Create database on first run
- Run migrations (Flyway)
- Execute DataInitializer to seed test data
- Have users available for login immediately

### 4. Verify User Repository
In `com/examapp/repository/UserRepository.java` ensure:
- Has method: `Optional<User> findByUsername(String username);`
- Has method: `boolean existsByUsername(String username);`
- Both methods work for User entity

### 5. Check User Entity
In `com/examapp/model/User.java` ensure:
- Has fields: id, username, password, fullName, email, role
- Password is stored hashed (never plain text)
- Has constructors for creating users
- Properly mapped to database table

### 6. Verify PasswordEncoder Bean
Ensure PasswordEncoder bean exists in configuration:
- Should use BCryptPasswordEncoder
- Should be available for @Autowired injection in services
- Should properly hash passwords on registration
- Should properly match passwords on login

### 7. Check JWT Generation
In `com/examapp/util/JwtUtil.java` ensure:
- generateToken(username) creates valid JWT
- extractUsername(token) gets username from token
- validateToken(token, username) checks token validity
- Token expiration is reasonable (e.g., 24 hours)

**What the Login Flow Should Be:**
1. Frontend sends: POST /api/auth/login with {username, password}
2. AuthService.login() is called
3. User lookup happens in database
4. Password comparison with BCrypt
5. If match: Generate JWT token
6. Return: {token, username, fullName, role}
7. Frontend stores token and redirects

**If Login Still Fails:**
1. Check database file exists and is writable
2. Verify no database corruption
3. Check DataInitializer runs at startup
4. Look for exceptions in application logs
5. Verify PasswordEncoder is properly configured
6. Ensure User table has test data

**Test Users That Should Exist:**
- username: invigilator1, password: password123, role: INVIGILATOR
- username: librarian1, password: password123, role: LIBRARIAN
- username: librarian2, password: password321, role: LIBRARIAN
- (Plus other test invigilators)

**How to Verify:**
1. Run application
2. Check logs for "Creating sample data..." message
3. Verify database file was created
4. Try login with invigilator1/password123
5. Should receive JWT token in response

Generate or fix any code that's missing or broken in these components. Make sure the login flow works end-to-end.

---

## ALTERNATIVE: STEP-BY-STEP FIX

If Copilot doesn't fix it completely, follow these manual steps:

### Step 1: Restart Backend with Fresh Database

1. Stop the backend (kill Java processes)
2. Delete old database:
   ```
   C:\Users\Christopher\OneDrive\Desktop\exam-invigilator-app-repo\backend\examdb.db
   C:\Users\Christopher\OneDrive\Desktop\exam-invigilator-app-repo\examdb.db
   ```
3. Restart backend: `java -jar target\exam-invigilator-1.0.0.jar`
4. Wait 15-20 seconds for database creation and initialization
5. Check console for: "✅ Exam Invigilator API is running!"

### Step 2: Test Login Endpoint with Curl

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"invigilator1","password":"password123"}'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "invigilator1",
  "fullName": "John Doe (Legacy)",
  "role": "INVIGILATOR"
}
```

### Step 3: If Still Failing

Check these:
1. Database file exists: `backend/examdb.db`
2. Application logs show: "Initializing sample data..."
3. Users are being created (check logs)
4. No exceptions in startup

### Step 4: Force Database Reset

Delete ALL database files:
- `backend/examdb.db`
- `backend/examdb.db-shm`
- `backend/examdb.db-wal`
- `examdb.db` (in project root)

Then restart backend.

---

## QUICK COMMANDS TO RUN

Kill old backend and start fresh:
```bash
taskkill /F /IM java.exe

# Delete old database
del C:\Users\Christopher\OneDrive\Desktop\exam-invigilator-app-repo\backend\examdb.db
del C:\Users\Christopher\OneDrive\Desktop\exam-invigilator-app-repo\examdb.db

# Start backend
cd C:\Users\Christopher\OneDrive\Desktop\exam-invigilator-app-repo\backend
java -jar target\exam-invigilator-1.0.0.jar
```

Then test:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"invigilator1","password":"password123"}'
```

---

## EXPECTED OUTCOME

After running this prompt or following manual steps:
✅ Database initializes with test users
✅ invigilator1 can login with password123
✅ librarian1 can login with password123
✅ JWT token is returned on successful login
✅ Frontend login page accepts credentials
✅ Frontend redirects to dashboard after login
✅ Schedule button visible for librarians
✅ ExamScheduler calendar loads

---

## HOW TO USE IN INTELLIJ

1. Copy the "PROMPT FOR COPILOT" section above
2. Open IntelliJ
3. Press: Ctrl+Shift+C (Windows) or Cmd+Shift+C (Mac)
4. Paste the prompt
5. Click Generate
6. Review and accept the changes
7. Rebuild and restart backend
8. Test login again

If that doesn't work, follow the "STEP-BY-STEP FIX" manual approach.

