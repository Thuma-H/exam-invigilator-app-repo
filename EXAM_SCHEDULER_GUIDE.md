# ExamScheduler - Quick Start Guide

## 🎯 Overview
The ExamScheduler is a powerful calendar-based tool for managing exam schedules with automatic conflict detection. It's designed for librarians to create, edit, and manage exam schedules efficiently.

## 📍 How to Access
1. Login as a **LIBRARIAN** user
2. Click the **"Schedule"** button in the navigation bar (calendar icon)
3. You'll be taken to the Exam Scheduler page

## 📅 Calendar Views
Click the view buttons in the toolbar to switch between:
- **Month**: See all exams for the entire month at a glance
- **Week**: Focused view of the current week
- **Day**: Detailed view of a single day
- **Agenda**: List view of all exams in chronological order

## ➕ Creating an Exam

### Method 1: Click Empty Calendar Slot
1. Click on any empty time slot in the calendar
2. A modal will open with the date/time pre-filled
3. Enter the exam details:
   - **Course Code**: Unique identifier (e.g., CS101)
   - **Course Name**: Full course title
   - **Date**: Exam date (auto-filled from clicked slot)
   - **Start Time**: When the exam begins
   - **End Time**: When the exam ends
   - **Duration**: Auto-calculated in minutes
   - **Venue/Room**: Location of the exam (e.g., Room 101)
   - **Invigilator ID**: Who will invigilate (required)
4. Click **"Create Exam"** to save

### Method 2: Use the Modal Directly
1. Click on any existing exam to open it
2. Edit the fields as needed
3. Click **"Update Exam"** to save changes

## ✏️ Editing an Exam
1. Click on an exam event in the calendar
2. The exam modal will open with all current details
3. Update any fields you want to change
4. Click **"Update Exam"** to save
5. Or click **"Delete Exam"** to remove it

## 🗑️ Deleting an Exam
1. Click on the exam you want to delete
2. Click **"Delete Exam"** button in the modal
3. Confirm the deletion in the popup dialog
4. The exam will be removed from the calendar

## 🔍 Filtering Exams

The filter bar allows you to narrow down the displayed exams:

### By Date
- Click the date input
- Select a specific date
- Calendar will show only exams on that date

### By Room/Venue
- Type the room name or number
- Calendar updates in real-time
- Partial matches work (e.g., "101" finds "Room 101")

### By Invigilator
- Type the invigilator ID
- Calendar shows only exams assigned to that invigilator
- Partial matches work

### By Subject/Course
- Type the course code or name
- Calendar filters by course matching
- Example: "CS101" or "Computer Science"

### Clear All Filters
- Click **"Clear Filters"** button to reset all filters at once

## ⚠️ Conflict Detection

The system automatically detects scheduling conflicts:

### What Triggers a Conflict?
- **Same Invigilator**: One person assigned to overlapping exams
- **Same Venue**: One room booked for overlapping exams

### How to Identify Conflicts
- **Red Events**: Any exam highlighted in red has a conflict
- **Banner Alert**: A yellow banner shows "⚠️ Scheduling Conflicts Detected!"
- **Count**: The banner shows how many conflict pairs exist

### Example Conflict Scenarios
❌ **Conflict**: Invigilator A assigned to:
- Room 101, 9:00-11:00
- Room 102, 10:00-12:00
- (Overlapping times, same person)

❌ **Conflict**: Room 101 booked for:
- CS101, 9:00-11:00
- CS102, 10:00-12:00
- (Overlapping times, same room)

✅ **No Conflict**: Invigilator A assigned to:
- Room 101, 9:00-11:00
- Room 101, 11:00-13:00
- (No overlap)

## 📋 Form Validation

The system validates all exam data:

### Required Fields (marked with *)
- Course Code
- Course Name
- Date
- Start Time
- End Time
- Venue/Room
- Invigilator ID

### Validation Rules
- All required fields must be filled
- End Time must be after Start Time
- Date must be valid
- Time format: HH:MM (24-hour)

### Error Handling
- Invalid fields show red borders
- Error messages appear below each field
- Form won't submit until all errors are resolved

## 🎨 Color Coding

- **Blue Events**: Normal exams (no conflicts)
- **Red Events**: Exams with scheduling conflicts
- **Light Blue Background**: Today's date in month view

## 💡 Tips & Tricks

1. **Quick Create**: Double-click a time slot to create an exam faster
2. **Drag to Reschedule**: (If enabled) Drag exams to new time slots
3. **Keyboard Navigation**: Use arrow keys to navigate months/weeks
4. **Mobile Friendly**: Works on tablets and phones with touch support
5. **Filter Combinations**: Combine multiple filters (e.g., date + venue)
6. **Search as You Type**: Filters update in real-time as you type

## ⌨️ Keyboard Shortcuts

- **←/→ arrows**: Navigate to previous/next period
- **T key**: Jump to today
- **Delete**: Remove selected exam (in some browsers)

## 🔐 Access Control

- Only **LIBRARIAN** users can access the ExamScheduler
- Other users will see "Access Denied" message
- Each librarian can manage their institution's exam schedule

## 🚀 Common Workflows

### Workflow 1: Schedule a New Semester
1. Open ExamScheduler
2. Click on first exam date/time
3. Enter exam details
4. Repeat for all exams
5. Check red conflicts and resolve them
6. Done!

### Workflow 2: Check for Conflicts
1. Open ExamScheduler
2. Look for red highlighted exams
3. Click conflicting exam
4. Check "Invigilator ID" and "Venue"
5. Adjust time or assignment to resolve

### Workflow 3: Find Available Slots
1. Filter by room/invigilator
2. Look for gaps in the calendar
3. Click empty slot to create exam
4. Schedule in the available time

### Workflow 4: Reschedule an Exam
1. Click the exam to open modal
2. Change date, time, or venue
3. Check if new slot has conflicts
4. Click "Update Exam"

## ❓ FAQ

**Q: Can I delete exams with students registered?**
A: This depends on backend configuration. If deletion fails, you may need to remove students first.

**Q: Do exams sync in real-time?**
A: The calendar fetches data when loaded. Refresh to see other users' changes.

**Q: Can I print the schedule?**
A: Use your browser's print function (Ctrl+P or Cmd+P) to print the calendar view.

**Q: What if I make a mistake?**
A: You can always edit the exam again or delete and recreate it. There's no undo, so be careful with deletions!

**Q: Can students see this schedule?**
A: No, ExamScheduler is only for librarians. Students see exams through their own interface.

## 🆘 Troubleshooting

### Calendar Not Loading
- Check your internet connection
- Refresh the page (F5 or Cmd+R)
- Clear browser cache and cookies

### Exams Not Appearing
- Use filters to search for specific exams
- Switch to different calendar views
- Check if exams are in the past

### Conflicts Not Showing
- Refresh the page
- Check the invigilator IDs match exactly
- Verify rooms are spelled identically

### Modal Won't Close
- Click the X button in the top-right
- Press Escape key
- Click outside the modal (if enabled)

### Changes Not Saving
- Check if you have permission (LIBRARIAN role)
- Verify all required fields are filled
- Check internet connection
- Try refreshing and try again

## 📞 Support
If you encounter issues:
1. Take a screenshot of the error
2. Note the time and exam details
3. Contact your system administrator
4. Check browser console for error messages (F12)

---

**Version**: 1.0  
**Last Updated**: March 2026  
**For**: NextPhases Exam Invigilator System

