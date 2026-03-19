# 🚀 QUICK REFERENCE CARD

## ExamScheduler Feature - Quick Start

### 📥 Installation
```bash
npm install react-big-calendar moment --save
```

### 🏃 Start Services
```bash
# Terminal 1: Backend
java -jar target/exam-invigilator-1.0.0.jar

# Terminal 2: Frontend  
npm start
```

### 🔗 Access
- **URL**: http://localhost:3000/exam-scheduler
- **Button**: "Schedule" in navbar (librarians only)
- **Role**: LIBRARIAN required

### 📋 Files Created/Modified
✅ 4 files created (ExamSchedulerPage, Modal, Styles)
✅ 4 files modified (App, Navbar, CSS, apiService)
✅ 4 documentation files created

### 🎯 Main Features
- 📅 Calendar view (Month/Week/Day/Agenda)
- ➕ Create exams (click calendar slot)
- ✏️ Edit exams (click existing exam)
- 🗑️ Delete exams (with confirmation)
- 🚨 Conflict detection (red highlighting)
- 🔍 Filtering (date, room, invigilator, course)
- ✅ Form validation
- 📱 Responsive design

### 🧪 Quick Test
1. Login as LIBRARIAN
2. Click "Schedule" button
3. Click empty calendar slot
4. Fill form and create exam
5. Click exam to edit
6. Delete exam to test

### ⚙️ API Endpoints
- `GET /api/exams` - Get all exams
- `POST /api/exams` - Create exam
- `PUT /api/exams/{id}` - Update exam
- `DELETE /api/exams/{id}` - Delete exam

### 🎨 Form Fields Required
- Course Code (text)
- Course Name (text)
- Exam Date (date)
- Start Time (time)
- End Time (time)
- Venue/Room (text)
- Invigilator ID (text/number)

### 🚨 Conflict Detection
Red exams = Conflict detected:
- Same invigilator with overlapping times
- Same venue with overlapping times

### 📚 Documentation
1. **EXAM_SCHEDULER_IMPLEMENTATION.md** - Technical details
2. **EXAM_SCHEDULER_GUIDE.md** - User guide
3. **EXAM_SCHEDULER_READY.md** - Deployment guide
4. **EXAM_SCHEDULER_TESTING_CHECKLIST.md** - Testing steps

### 🆘 Common Issues
| Issue | Solution |
|-------|----------|
| Module not found | Run `npm install react-big-calendar moment` |
| Calendar not loading | Check backend running, refresh page |
| Can't create exam | Fill all required fields, check librarian role |
| Conflicts not showing | Refresh page, verify invigilator IDs match |

### 💡 Pro Tips
- Click calendar toolbar buttons to change views
- Filters update in real-time as you type
- Combine multiple filters for precise search
- Red exams indicate scheduling conflicts
- Click X button to close modal

### ✨ Status
✅ Implementation Complete
✅ Ready for Testing
✅ Ready for Deployment

---

For detailed information, see documentation files.
Created: March 6, 2026

