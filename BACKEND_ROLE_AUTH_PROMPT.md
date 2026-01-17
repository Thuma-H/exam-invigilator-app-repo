# Backend Role-Based Authentication Implementation

## 🎯 Changes Made to Backend

I've updated the DataInitializer to add librarian accounts. Here's what needs to be done:

---

## ✅ File Modified: DataInitializer.java

**Location**: `backend/src/main/java/com/examapp/config/DataInitializer.java`

**Change**: Updated the `createUsers()` method to add 2 librarian accounts

### New Code Added:

```java
// Librarians
User librarian1 = new User();
librarian1.setUsername("librarian1");
librarian1.setPassword(passwordEncoder.encode("password123"));
librarian1.setFullName("Librarian One");
librarian1.setRole("LIBRARIAN");
userRepository.save(librarian1);

User librarian2 = new User();
librarian2.setUsername("librarian2");
librarian2.setPassword(passwordEncoder.encode("password321"));
librarian2.setFullName("Librarian Two");
librarian2.setRole("LIBRARIAN");
userRepository.save(librarian2);
```

---

## 🔧 What You Need to Do

### Step 1: Delete the Old Database
Since we're adding new users, you need to recreate the database:

**For PowerShell (Windows):**
```powershell
cd C:\Users\sstac\OneDrive\Desktop\exam-invigilator-app-repo
Remove-Item -Path examdb.db -Force -ErrorAction SilentlyContinue
```

**For Command Prompt:**
```cmd
cd C:\Users\sstac\OneDrive\Desktop\exam-invigilator-app-repo
del examdb.db
```

### Step 2: Rebuild and Restart Backend
```powershell
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```

### Step 3: Verify Users Were Created
Check the console output when the backend starts. You should see:
```
✓ Created 5 users (2 invigilators, 2 librarians, 1 admin)
```

---

## 📋 New User Accounts Created

After restarting the backend, these accounts will exist:

### Invigilators:
| Username      | Password     | Role         | Full Name   |
|--------------|--------------|--------------|-------------|
| invigilator1 | password123  | INVIGILATOR  | John Doe    |
| invigilator2 | password123  | INVIGILATOR  | Jane Smith  |

### Librarians:
| Username    | Password    | Role       | Full Name      |
|-------------|-------------|------------|----------------|
| librarian1  | password123 | LIBRARIAN  | Librarian One  |
| librarian2  | password321 | LIBRARIAN  | Librarian Two  |

### Admin:
| Username | Password  | Role  | Full Name  |
|----------|-----------|-------|------------|
| admin    | admin123  | ADMIN | Admin User |

---

## 🎨 Backend Changes Summary

### Files That Were Modified:
1. ✅ **DataInitializer.java** - Added librarian accounts

### Files That Already Supported This (No Changes Needed):
1. ✅ **User.java** - Already has `role` field
2. ✅ **LoginResponse.java** - Already returns `role`
3. ✅ **AuthService.java** - Already sends role in login response
4. ✅ **AuthController.java** - Already working correctly

---

## 🧪 Testing the Backend

### Test 1: Login as Invigilator
```bash
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
  "token": "eyJhbGc...",
  "username": "invigilator1",
  "fullName": "John Doe",
  "role": "INVIGILATOR"
}
```

### Test 2: Login as Librarian 1
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "librarian1",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGc...",
  "username": "librarian1",
  "fullName": "Librarian One",
  "role": "LIBRARIAN"
}
```

### Test 3: Login as Librarian 2
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "librarian2",
  "password": "password321"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGc...",
  "username": "librarian2",
  "fullName": "Librarian Two",
  "role": "LIBRARIAN"
}
```

---

## 🐛 Troubleshooting

### Issue: "User already exists" error
**Solution**: Delete the database file and restart:
```powershell
Remove-Item -Path ..\examdb.db -Force
mvn spring-boot:run
```

### Issue: Librarians not created
**Solution**: Check that DataInitializer.java was saved correctly and rebuild:
```powershell
mvn clean install -DskipTests
mvn spring-boot:run
```

### Issue: Wrong password
**Solution**: Double-check:
- librarian1 → password123
- librarian2 → password321

---

## ✨ What This Enables

With these changes:
✅ Librarians can log in with their own credentials
✅ Librarians are automatically redirected to Librarian Dashboard
✅ Invigilators cannot access Librarian Dashboard
✅ Role-based access control is enforced
✅ Each user type sees appropriate navigation options

---

## 🎉 Ready to Test!

Once you've deleted the database and restarted the backend:

1. **Delete database**: `Remove-Item examdb.db`
2. **Restart backend**: `mvn spring-boot:run`
3. **Refresh frontend**: Press F5 in browser
4. **Test librarian login**: Use librarian1/password123
5. **Verify access**: Should go to Librarian Dashboard
6. **Test invigilator login**: Use invigilator1/password123
7. **Verify separation**: Should go to Invigilator Dashboard

---

## 📝 Quick Command Summary

**Full Reset (One Command):**
```powershell
cd C:\Users\sstac\OneDrive\Desktop\exam-invigilator-app-repo; Remove-Item examdb.db -Force -ErrorAction SilentlyContinue; cd backend; mvn clean install -DskipTests; mvn spring-boot:run
```

---

**That's it! Your backend is ready for role-based authentication!** 🚀

