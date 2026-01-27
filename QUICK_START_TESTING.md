# 🚀 Quick Start Guide - Testing the Redesigned Frontend

## Prerequisites
- Backend must be running on `http://localhost:8080`
- Node.js installed
- npm installed

---

## 🏃 Starting the Application

### Step 1: Start Backend (If not already running)
```bash
cd C:\Users\sstac\OneDrive\Desktop\exam-invigilator-app-repo\backend
mvn spring-boot:run
```

Wait for: `Started ExamInvigilatorApplication in X seconds`

### Step 2: Start Frontend
```bash
cd C:\Users\sstac\OneDrive\Desktop\exam-invigilator-app-repo\frontend
npm start
```

Browser should open automatically at: `http://localhost:3000`

---

## ✅ Testing Checklist

### 1. TEST: Login & Navbar (2 minutes)

**Invigilator Login:**
```
Go to: http://localhost:3000/login
Username: [your invigilator username]
Password: [your invigilator password]
Click: Login
```

**Expected Result:**
- ✅ Redirected to Dashboard (/)
- ✅ Navbar shows: "Welcome, [Your Name] [INVIGILATOR]"
- ✅ Logout button visible on right

**Librarian Login:**
```
Logout → Login again
Username: [your librarian username]
Password: [your librarian password]
Click: Login
```

**Expected Result:**
- ✅ Redirected to Librarian Dashboard (/librarian)
- ✅ Navbar shows: "Welcome, [Your Name] [LIBRARIAN]"
- ✅ Different dashboard content

---

### 2. TEST: Dashboard (3 minutes)

**View Exam Cards:**
```
Should see exam cards with:
✅ Course Code (e.g., BSC121)
✅ Course Name (e.g., Software Engineering)
✅ Status badge (SCHEDULED/ONGOING/COMPLETED)
✅ Date (formatted nicely)
✅ Time (formatted separately)
✅ Venue (e.g., Hall A)
✅ Student Count (e.g., 45)
```

**Check Buttons:**
```
Each card should have 3 buttons:
✅ [Mark Attendance] - Green gradient
✅ [Report Incident] - Red gradient
✅ [View Reports] - Blue gradient
```

**Test Hover Effects:**
```
✅ Hover over button → Lifts up slightly
✅ Hover over card → Box shadow appears
✅ Hover over navbar logo → Opacity changes
```

---

### 3. TEST: Attendance Page (5 minutes)

**Navigate to Attendance:**
```
Dashboard → Click "Mark Attendance" on any exam
```

**Expected Result:**
- ✅ Navbar at top (consistent)
- ✅ Back button visible
- ✅ Exam info card shows course name and venue
- ✅ Exam timer visible (if exam is ongoing)

**Test Search Feature (NEW):**
```
1. Look at student table (should show all students)
2. Type in search box: "john"
3. ✅ Table filters to only show students with "john" in name/ID/program
4. Clear search → ✅ All students visible again
5. Type student ID (e.g., "BCS25") → ✅ Filters by ID
```

**Test Scanner UI (IMPROVED):**
```
1. Scanner should be CLOSED by default
   ✅ Just see heading "Barcode Scanner" and [📷 Open Scanner] button

2. Click [📷 Open Scanner]
   ✅ Scanner section expands
   ✅ See two methods: Manual Entry | Camera Scanner
   ✅ Button changes to [✗ Close Scanner]

3. Test Manual Entry:
   ✅ Input field is auto-focused
   ✅ Type student ID (e.g., BCS25165336)
   ✅ Press Enter or click [Mark Present]
   ✅ Success message appears
   ✅ Student row highlights green
   ✅ Status badge shows "PRESENT" in green

4. Check Scan History:
   ✅ "Recent Scans (1)" section appears
   ✅ Shows student ID, name, and timestamp

5. Click [✗ Close Scanner]
   ✅ Scanner section collapses
   ✅ Clean page view, table is prominent
```

**Test Manual Marking:**
```
1. Find unmarked student in table
2. Click [Present] button
   ✅ Status badge updates to "PRESENT" (green)
   ✅ Row highlights green
   ✅ Buttons disable

3. Find another student
4. Click [Late] button
   ✅ Status badge updates to "LATE" (orange)
   ✅ Row highlights
   ✅ Buttons disable

5. Find another student
6. Click [Absent] button
   ✅ Status badge updates to "ABSENT" (red)
   ✅ Row highlights
   ✅ Buttons disable
```

**Test Navbar Navigation:**
```
1. Click logo "📋 Exam Invigilator" in navbar
   ✅ Returns to dashboard
2. Click [Back to Dashboard] button
   ✅ Also returns to dashboard
```

---

### 4. TEST: Incident Page (2 minutes)

**Navigate to Incident:**
```
Dashboard → Click "Report Incident" on any exam
```

**Expected Result:**
- ✅ Navbar at top (consistent)
- ✅ Back button visible
- ✅ Exam info shows course name
- ✅ Form has: Student dropdown, Category, Severity, Description
- ✅ Incident history table below

**Test Incident Reporting:**
```
1. Select student (or leave as "General Incident")
2. Select category (e.g., CHEATING)
3. Select severity (e.g., HIGH)
4. Enter description
5. Click [Report Incident]
   ✅ Success message
   ✅ Form clears
   ✅ Incident appears in history table
```

---

### 5. TEST: Reports Page (1 minute)

**Navigate to Reports:**
```
Dashboard → Click "View Reports" on any exam
```

**Expected Result:**
- ✅ Navbar at top (consistent)
- ✅ Shows attendance statistics
- ✅ Shows incident summary
- ✅ Can navigate back to dashboard

---

### 6. TEST: Logout (30 seconds)

**Test Logout:**
```
Click [Logout] in navbar
✅ Redirected to login page
✅ sessionStorage cleared
✅ Cannot access protected routes without logging in
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Cannot connect to backend"
**Symptom:** Login fails with network error  
**Fix:**
```bash
# Check if backend is running
cd backend
mvn spring-boot:run

# Should see: "Started ExamInvigilatorApplication"
```

### Issue 2: "CORS error in console"
**Symptom:** API calls blocked by CORS policy  
**Fix:** Tell backend developer to enable CORS for `http://localhost:3000`

### Issue 3: "Course name not showing"
**Symptom:** Dashboard shows course code but no name  
**Fix:** Backend needs to include `courseName` field in exam response

### Issue 4: "Search doesn't work"
**Symptom:** Typing in search box does nothing  
**Check:**
- Look at browser console for errors
- Verify students array has data
- Try searching for known student name/ID

### Issue 5: "Scanner stays open"
**Symptom:** Can't close scanner  
**Fix:** Click [✗ Close Scanner] button (should be red when open)

---

## 📱 Mobile Testing (Optional)

### Test on Mobile Device:
```
1. Get your computer's local IP (e.g., 192.168.1.100)
2. Update frontend/src/config/environment.js:
   API_BASE_URL: 'http://192.168.1.100:8080/api'
3. Restart frontend
4. On mobile browser: http://192.168.1.100:3000
```

### Mobile Checklist:
- [ ] Dashboard cards stack vertically
- [ ] Navbar collapses properly
- [ ] Search input is tap-friendly
- [ ] Table scrolls horizontally
- [ ] Buttons are big enough to tap
- [ ] Scanner works with mobile camera

---

## 🎨 Visual Quality Checks

### Colors & Styling:
```
✅ Navbar is dark blue-gray (#2C3E50)
✅ Present badges are green (#27AE60)
✅ Absent badges are red (#E74C3C)
✅ Late badges are orange (#F39C12)
✅ Buttons have gradient backgrounds
✅ Hover effects work (lift up slightly)
✅ No random colors - all from theme
```

### Consistency:
```
✅ Navbar looks same on all pages
✅ Buttons have same style across pages
✅ Cards have same border radius (12px)
✅ Spacing is consistent (1.5rem gaps)
✅ Font sizes are consistent
```

### Professional Appearance:
```
✅ No excessive emojis in buttons
✅ Clean, readable text
✅ Good contrast (white text on dark backgrounds)
✅ Proper alignment (no crooked elements)
✅ Smooth animations (no janky transitions)
```

---

## 🔍 Browser Console Checks

### No Errors:
```
Press F12 → Console tab
✅ No red error messages
✅ No CORS errors
✅ No 404 errors (missing files)
✅ No React warnings
```

### Network Tab:
```
Press F12 → Network tab
Login → Should see:
✅ POST /api/auth/login → 200 OK
✅ GET /api/exams/my → 200 OK

Attendance page → Should see:
✅ GET /api/exams/:id → 200 OK
✅ GET /api/students/exam/:id → 200 OK
✅ GET /api/attendance/exam/:id → 200 OK
```

---

## 📊 Performance Checks

### Page Load Speed:
```
✅ Dashboard loads in < 2 seconds
✅ Attendance page loads in < 2 seconds
✅ Search filters instantly (no lag)
✅ Scanner opens/closes smoothly
```

### Responsiveness:
```
✅ Buttons respond immediately to clicks
✅ Hover effects are smooth
✅ No frozen UI during API calls
```

---

## ✅ Final Checklist

Before declaring "Done":

**Functionality:**
- [ ] Login works for both invigilator and librarian
- [ ] Dashboard shows all exams with correct info
- [ ] Search feature filters students correctly
- [ ] Scanner can be opened and closed
- [ ] Attendance marking works (scan and manual)
- [ ] Incident reporting works
- [ ] Reports page displays data
- [ ] Logout works and clears session

**Visual Quality:**
- [ ] Navbar consistent on all pages
- [ ] Colors match theme (no random colors)
- [ ] Buttons have proper hover effects
- [ ] Status badges are color-coded
- [ ] No layout issues or overlapping elements
- [ ] Text is readable (good contrast)

**Professional Appearance:**
- [ ] No excessive emojis
- [ ] Consistent spacing and alignment
- [ ] Smooth animations
- [ ] Clean, modern design
- [ ] Looks like a real product, not a prototype

---

## 🎉 Success Criteria

**You're done when:**
1. ✅ All functionality works (attendance, incidents, reports)
2. ✅ Visual design is consistent and professional
3. ✅ Search feature saves time finding students
4. ✅ Scanner UI is clean and collapsible
5. ✅ No console errors
6. ✅ Mobile responsive (if tested)
7. ✅ User can complete full workflow: Login → Mark Attendance → Report Incident → Logout

---

## 📸 Screenshots to Take

**For documentation/demo:**
1. Login page
2. Dashboard with exam cards
3. Attendance page with scanner closed
4. Attendance page with scanner open
5. Attendance page with search results
6. Table showing marked students (green/red/orange badges)
7. Incident reporting form
8. Reports page with statistics

---

## 🚨 If Something Breaks

**Don't Panic! Try these steps:**

1. **Refresh the page** (Ctrl+R or Cmd+R)
2. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check browser console** for error messages
4. **Verify backend is running** (check terminal)
5. **Restart frontend** (Ctrl+C then `npm start`)
6. **Check network requests** (F12 → Network tab)

**Still broken?** Check `BACKEND_COORDINATION_PROMPTS.md` for specific issues.

---

**End of Quick Start Guide**
Use this guide to test everything systematically.
Expect testing to take: 15-20 minutes for full workflow.
