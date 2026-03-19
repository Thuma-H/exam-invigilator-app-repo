# Exam Scheduler Feature - Quick Testing Guide

## Prerequisites
- Backend running on `http://localhost:8080`
- Have access to invigilator user IDs (from User table)

## Test Scenario: Complete Workflow

### Step 1: Create Sample Rooms
Create 3 rooms for testing:

```bash
# Room 1
curl -X POST http://localhost:8080/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "LT001",
    "capacity": 100,
    "building": "Science Block",
    "floor": 1
  }'

# Room 2
curl -X POST http://localhost:8080/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "LT002",
    "capacity": 120,
    "building": "Science Block",
    "floor": 1
  }'

# Room 3
curl -X POST http://localhost:8080/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "LT101",
    "capacity": 80,
    "building": "Engineering Block",
    "floor": 2
  }'
```

### Step 2: Verify Rooms Created
```bash
curl http://localhost:8080/api/rooms
```

Expected: Array of 3 rooms with IDs (assume IDs are 1, 2, 3)

### Step 3: Create First Exam (Should Succeed)
```bash
curl -X POST http://localhost:8080/api/exams \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "BSC121",
    "courseName": "Data Structures",
    "roomId": 1,
    "examDate": "2025-11-15",
    "startTime": "09:00:00",
    "duration": 120,
    "invigilatorId": 1
  }'
```

Expected: 201 Created
```json
{
  "hasConflict": false,
  "message": "Exam created successfully with ID: 1"
}
```

### Step 4: Try to Create Room Conflict (Should Fail)
Try to create another exam in **same room** at **overlapping time**:

```bash
curl -X POST http://localhost:8080/api/exams \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "PHY201",
    "courseName": "Physics Lab",
    "roomId": 1,
    "examDate": "2025-11-15",
    "startTime": "10:00:00",
    "duration": 90,
    "invigilatorId": 2
  }'
```

Expected: 409 Conflict
```json
{
  "hasConflict": true,
  "roomConflicts": [
    "Room LT001 already has Data Structures (BSC121) from 09:00 to 11:00"
  ],
  "invigilatorConflicts": [],
  "message": "Scheduling conflict detected..."
}
```

### Step 5: Create Exam in Different Room (Should Succeed)
```bash
curl -X POST http://localhost:8080/api/exams \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "PHY201",
    "courseName": "Physics Lab",
    "roomId": 2,
    "examDate": "2025-11-15",
    "startTime": "10:00:00",
    "duration": 90,
    "invigilatorId": 2
  }'
```

Expected: 201 Created (Exam ID: 2)

### Step 6: Try to Create Invigilator Conflict (Should Fail)
Try to assign **same invigilator** to exam at **overlapping time**:

```bash
curl -X POST http://localhost:8080/api/exams \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "CHM301",
    "courseName": "Chemistry",
    "roomId": 3,
    "examDate": "2025-11-15",
    "startTime": "10:30:00",
    "duration": 90,
    "invigilatorId": 1
  }'
```

Expected: 409 Conflict
```json
{
  "hasConflict": true,
  "roomConflicts": [],
  "invigilatorConflicts": [
    "user1 is already assigned to Data Structures (BSC121) from 09:00 to 11:00"
  ],
  "message": "Scheduling conflict detected..."
}
```

### Step 7: Create Non-Overlapping Exam for Same Invigilator (Should Succeed)
```bash
curl -X POST http://localhost:8080/api/exams \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "CHM301",
    "courseName": "Chemistry",
    "roomId": 3,
    "examDate": "2025-11-15",
    "startTime": "11:30:00",
    "duration": 90,
    "invigilatorId": 1
  }'
```

Expected: 201 Created (Exam ID: 3)

### Step 8: Update an Exam (Should Succeed)
Update Exam 2 to different time:

```bash
curl -X PUT http://localhost:8080/api/exams/2 \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "PHY201",
    "courseName": "Physics Lab (Updated)",
    "roomId": 2,
    "examDate": "2025-11-15",
    "startTime": "13:00:00",
    "duration": 90,
    "invigilatorId": 2
  }'
```

Expected: 200 OK
```json
{
  "hasConflict": false,
  "message": "Exam updated successfully with ID: 2"
}
```

### Step 9: Verify All Exams
```bash
curl http://localhost:8080/api/exams
```

Expected: Array of 3 exams

### Step 10: Delete an Exam
```bash
curl -X DELETE http://localhost:8080/api/exams/3
```

Expected: 200 OK
```json
{
  "message": "Exam deleted successfully"
}
```

### Step 11: Verify Exam Deleted
```bash
curl http://localhost:8080/api/exams
```

Expected: Array of 2 exams (Exam 3 is gone)

## Error Testing

### Test: Missing Required Field
```bash
curl -X POST http://localhost:8080/api/exams \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "TEST101",
    "courseName": "Test Course"
    # Missing roomId, examDate, startTime, duration, invigilatorId
  }'
```

Expected: 400 Bad Request
```json
{
  "error": "Room ID is required"
}
```

### Test: Invalid Room ID
```bash
curl -X POST http://localhost:8080/api/exams \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "TEST101",
    "courseName": "Test Course",
    "roomId": 999,
    "examDate": "2025-11-15",
    "startTime": "09:00:00",
    "duration": 120,
    "invigilatorId": 1
  }'
```

Expected: 404 Not Found
```json
{
  "error": "Room not found with ID: 999"
}
```

### Test: Invalid Invigilator ID
```bash
curl -X POST http://localhost:8080/api/exams \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "TEST101",
    "courseName": "Test Course",
    "roomId": 1,
    "examDate": "2025-11-15",
    "startTime": "09:00:00",
    "duration": 120,
    "invigilatorId": 999
  }'
```

Expected: 404 Not Found
```json
{
  "error": "Invigilator not found with ID: 999"
}
```

## Room Management Testing

### Get All Rooms
```bash
curl http://localhost:8080/api/rooms
```

### Get Rooms by Building
```bash
curl "http://localhost:8080/api/rooms/building/Science%20Block"
```

### Get Rooms by Floor
```bash
curl http://localhost:8080/api/rooms/floor/1
```

### Get Specific Room
```bash
curl http://localhost:8080/api/rooms/1
```

### Update Room
```bash
curl -X PUT http://localhost:8080/api/rooms/1 \
  -H "Content-Type: application/json" \
  -d '{
    "capacity": 150
  }'
```

### Delete Room
```bash
curl -X DELETE http://localhost:8080/api/rooms/3
```

## Checklist for Success

- [ ] All 3 rooms created successfully
- [ ] First exam created without conflict
- [ ] Room conflict detected correctly
- [ ] Exam in different room created successfully
- [ ] Invigilator conflict detected correctly
- [ ] Non-overlapping exam for same invigilator created
- [ ] Exam updated successfully
- [ ] All exams retrievable
- [ ] Exam deleted successfully
- [ ] Missing field validation works
- [ ] Invalid room/invigilator detection works
- [ ] Room CRUD operations work

## Notes
- Replace `invigilatorId` values (1, 2) with actual user IDs from your database
- Replace room IDs with actual IDs returned from room creation
- All dates should be in YYYY-MM-DD format
- All times should be in HH:MM:SS format
- Duration is in minutes

