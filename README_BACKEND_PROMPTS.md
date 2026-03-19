# ✅ BACKEND EXAM SCHEDULER - COMPLETE SETUP

## 📝 WHAT YOU ASKED FOR

You said: "I need a prompt to put into the backend to create the exam scheduler in IntelliJ to meet the frontend requirements because it's failing to work"

## ✅ WHAT I'VE PROVIDED

I've created **3 detailed prompts/guides** you can use in IntelliJ to implement the backend endpoints needed for the ExamScheduler frontend feature.

---

## 🎯 CHOOSE YOUR METHOD

### Method 1: FASTEST (2 minutes) ⚡
**File**: `COPYPASTE_INTELLIJ_PROMPT.md`

This is the exact prompt you need to copy-paste into GitHub Copilot Chat in IntelliJ.

**Steps:**
1. Open `COPYPASTE_INTELLIJ_PROMPT.md`
2. Copy the entire PROMPT section
3. In IntelliJ: Press **Ctrl+Shift+C** (Windows) or **Cmd+Shift+C** (Mac)
4. Paste the prompt into Copilot Chat
5. Click Generate
6. Accept the code

**Result**: Full backend code generated automatically

---

### Method 2: GUIDED STEP-BY-STEP (45 minutes) 📚
**File**: `BACKEND_IMPLEMENTATION_QUICK_GUIDE.md`

This guide walks you through manually implementing each component with code snippets.

**Includes:**
- Step 1: Create DTOs
- Step 2: Create Response DTOs
- Step 3: Add Controller methods
- Step 4: Add Service methods
- Step 5: Test with curl

**Result**: You understand what each part does

---

### Method 3: DETAILED SPECIFICATION (30 minutes) 📖
**File**: `BACKEND_EXAM_SCHEDULER_PROMPT.md`

Comprehensive specification document with all requirements and details.

**Includes:**
- API endpoint specifications
- Request/response formats
- Validation requirements
- Database considerations
- Testing procedures

**Result**: Complete reference for implementation

---

## 🚀 WHAT EACH FILE CONTAINS

### COPYPASTE_INTELLIJ_PROMPT.md
```
Perfect for: People who want code generated instantly
Time: 2 minutes
Contains: 
  - Exact prompt for Copilot Chat
  - Testing curl commands
  - How-to instructions
```

### BACKEND_IMPLEMENTATION_QUICK_GUIDE.md
```
Perfect for: People who want to learn and customize
Time: 45 minutes
Contains:
  - Step-by-step instructions
  - Complete code snippets
  - Common issues and fixes
  - Testing procedures
  - Checklist
```

### BACKEND_EXAM_SCHEDULER_PROMPT.md
```
Perfect for: Complete reference
Time: 30 minutes
Contains:
  - Full API specifications
  - All requirements
  - Database schema info
  - Testing instructions
  - Notes on implementation
```

---

## 📋 WHAT THE BACKEND NEEDS TO IMPLEMENT

### Required Endpoints

| Method | URL | Purpose | Status |
|--------|-----|---------|--------|
| POST | /api/exams | Create exam | Implement |
| GET | /api/exams | Get all exams | Implement |
| PUT | /api/exams/{id} | Update exam | Implement |
| DELETE | /api/exams/{id} | Delete exam | Implement |

### Required Request Body
```json
{
  "courseCode": "CS101",
  "courseName": "Intro to CS",
  "examDate": "2026-03-15",
  "startTime": "09:00",
  "duration": 120,
  "venue": "Room 101",
  "invigilatorId": 1
}
```

### Required Response
```json
{
  "id": 1,
  "courseCode": "CS101",
  "courseName": "Intro to CS",
  "examDate": "2026-03-15",
  "startTime": "09:00",
  "endTime": "11:00",
  "duration": 120,
  "venue": "Room 101",
  "invigilatorId": 1,
  "status": "SCHEDULED"
}
```

---

## ✨ KEY THINGS TO IMPLEMENT

### 1. DTOs (Data Transfer Objects)
- `ExamSchedulerRequest` - For incoming requests
- `ExamSchedulerResponse` - For outgoing responses

### 2. Controller Endpoints
- POST create endpoint
- GET get all endpoint
- PUT update endpoint
- DELETE delete endpoint

### 3. Service Methods
- createExamSchedule()
- updateExamSchedule()
- deleteExamSchedule()
- Helper to convert Exam to Response

### 4. Validation
- Required fields check
- Date format validation
- Time format validation
- User exists check

---

## 🧪 HOW TO TEST

After implementation, run these curl commands:

```bash
# Create
curl -X POST http://localhost:8080/api/exams \
  -H "Content-Type: application/json" \
  -d '{"courseCode":"CS101","courseName":"Intro","examDate":"2026-03-15","startTime":"09:00","duration":120,"venue":"Room101","invigilatorId":1}'

# Get all
curl -X GET http://localhost:8080/api/exams

# Update (replace 1 with actual ID)
curl -X PUT http://localhost:8080/api/exams/1 \
  -H "Content-Type: application/json" \
  -d '{"courseCode":"CS101","courseName":"Updated","examDate":"2026-03-15","startTime":"10:00","duration":120,"venue":"Room102","invigilatorId":1}'

# Delete
curl -X DELETE http://localhost:8080/api/exams/1
```

---

## ✅ SUCCESS CHECKLIST

After implementation:
- [ ] POST /api/exams returns 201 Created
- [ ] GET /api/exams returns 200 OK with list
- [ ] PUT /api/exams/{id} returns 200 OK
- [ ] DELETE /api/exams/{id} returns 204 No Content
- [ ] Response includes all required fields
- [ ] Frontend can create exams
- [ ] Frontend can edit exams
- [ ] Frontend can delete exams
- [ ] Calendar displays created exams
- [ ] No console errors in frontend or backend

---

## 🎯 QUICK START (Pick One)

### For Speed (2 min):
1. Open `COPYPASTE_INTELLIJ_PROMPT.md`
2. Copy-paste into Copilot Chat
3. Generate code
4. Done!

### For Learning (45 min):
1. Open `BACKEND_IMPLEMENTATION_QUICK_GUIDE.md`
2. Follow Step 1 through Step 5
3. Test as you go
4. Done!

### For Reference (30 min):
1. Open `BACKEND_EXAM_SCHEDULER_PROMPT.md`
2. Review requirements
3. Use Copilot with the prompt
4. Test thoroughly
5. Done!

---

## 🚨 IF SOMETHING DOESN'T WORK

### POST returns 405 Method Not Allowed
- Check you added @PostMapping in controller
- Check method exists and is public

### GET returns 404
- Check endpoint path is exactly /api/exams
- Check @GetMapping annotation

### Response doesn't match frontend expectations
- Check all fields are returned (id, courseCode, endTime, status)
- Check date/time formatting is correct

### "Invigilator not found" error
- Make sure user with ID 1 exists in database
- Try using a valid invigilator ID

### Frontend still can't create exams
- Check backend is running on port 8080
- Test endpoint with curl first
- Check console logs for errors

---

## 📞 FILES LOCATION

All three files are in your project root:
- `COPYPASTE_INTELLIJ_PROMPT.md`
- `BACKEND_IMPLEMENTATION_QUICK_GUIDE.md`
- `BACKEND_EXAM_SCHEDULER_PROMPT.md`

---

## 🎓 SUMMARY

You now have everything needed to implement the backend ExamScheduler:

1. **Exact prompt** for Copilot Chat (fastest)
2. **Step-by-step guide** with code snippets (most detailed)
3. **Complete specification** with requirements (best reference)

Pick the one that matches your style and you'll have a working backend in 15-45 minutes.

The frontend is already ready - it's just waiting for these endpoints to exist!

---

## 💡 WHAT HAPPENS NEXT

Once you implement these endpoints:
1. Frontend can create exams (POST)
2. Frontend can list exams (GET)
3. Frontend can edit exams (PUT)
4. Frontend can delete exams (DELETE)
5. Calendar displays all exams
6. Conflict detection works
7. Filtering works

Everything in the frontend is already coded and waiting for these endpoints!

---

**You're all set! Pick a file and get started!** 🚀

