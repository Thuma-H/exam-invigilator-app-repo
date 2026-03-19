# Exam Scheduler Feature - Complete Implementation Guide

## Overview
The Exam Scheduler feature enables administrators to create, manage, and schedule exams with intelligent conflict detection. It prevents double-booking of rooms and invigilators while managing exam venues and timing.

## Architecture

### Backend Components

#### 1. **Models**

##### Room Model
```java
- id: Long (Primary Key)
- roomName: String (Unique, e.g., "LT001")
- capacity: Integer (Max students)
- building: String (Building location)
- floor: Integer (Optional floor number)
```

##### Exam Model (Enhanced)
```java
- id: Long
- courseCode: String
- courseName: String
- room: Room (Many-to-One relationship) ← NEW
- examDate: LocalDate
- startTime: LocalTime
- duration: Integer (minutes)
- invigilator: User (Many-to-One)
- students: List<Student> (Many-to-Many)
- venue: String (Backward compatibility)
```

#### 2. **DTOs**

##### ExamCreateRequest
Used for creating/updating exams with validation:
```json
{
  "courseCode": "BSC121",
  "courseName": "Data Structures",
  "roomId": 1,
  "examDate": "2025-11-15",
  "startTime": "09:00:00",
  "duration": 120,
  "invigilatorId": 5
}
```

##### ConflictDetectionResponse
Returns conflict detection results:
```json
{
  "hasConflict": false,
  "roomConflicts": [],
  "invigilatorConflicts": [],
  "message": "Exam created successfully with ID: 42"
}
```

#### 3. **Services**

##### ExamService (Enhanced)
- `createExamWithConflictDetection(request)` - Creates exam with validation
- `updateExamWithConflictDetection(id, request)` - Updates exam with validation
- `deleteExam(id)` - Deletes an exam
- `getExamsInRoomByDate(roomId, date)` - Gets exams in a room on a date
- Existing methods: `getExamsForInvigilator()`, `getStudentsForExam()`, etc.

##### RoomService (New)
- `getAllRooms()` - Get all available rooms
- `getRoomById(id)` - Get specific room
- `getRoomByName(name)` - Get room by name
- `getRoomsByBuilding(building)` - Get rooms in a building
- `getRoomsByFloor(floor)` - Get rooms on a floor
- `createRoom(room)` - Create new room
- `updateRoom(room)` - Update room details
- `deleteRoom(id)` - Delete a room

#### 4. **Repositories**

##### ExamRepository (Enhanced)
**New Query Methods:**
- `findByRoomAndExamDate(room, examDate)` - Find exams in room on date
- `findConflictingExamsInRoom(room, date, startTime, endTime)` - Detect room conflicts
- `findConflictingExamsForInvigilator(invigilator, date, startTime, endTime)` - Detect invigilator conflicts

##### RoomRepository (New)
- `findByRoomName(roomName)`
- `findByBuilding(building)`
- `findByFloor(floor)`

#### 5. **Controllers**

##### ExamController (Enhanced)

**NEW ENDPOINTS:**

1. **POST /api/exams** - Create new exam with conflict detection
   - Request: ExamCreateRequest
   - Response: ConflictDetectionResponse or error
   - Status: 201 Created (success) | 409 Conflict (scheduling conflict) | 400 Bad Request | 404 Not Found

2. **PUT /api/exams/{examId}** - Update exam with conflict detection
   - Path Parameter: examId (Long)
   - Request: ExamCreateRequest
   - Response: ConflictDetectionResponse or error
   - Status: 200 OK (success) | 409 Conflict (scheduling conflict) | 400 Bad Request | 404 Not Found

3. **DELETE /api/exams/{examId}** - Delete an exam
   - Path Parameter: examId (Long)
   - Response: { "message": "Exam deleted successfully" }
   - Status: 200 OK | 404 Not Found

**EXISTING ENDPOINTS:**
- GET /api/exams - Get all exams (or user's exams if authenticated)
- GET /api/exams/{examId} - Get exam details
- GET /api/exams/date/{date} - Get exams for a date
- GET /api/exams/{examId}/students - Get students in exam
- GET /api/exams/course/{courseCode} - Get exams for a course
- POST /api/exams/{examId}/students/{studentId} - Add student to exam
- DELETE /api/exams/{examId}/students/{studentId} - Remove student from exam

##### RoomController (New)

1. **GET /api/rooms** - Get all available rooms
   - Response: Array of Room objects
   - Status: 200 OK

2. **GET /api/rooms/{id}** - Get room by ID
   - Path Parameter: id (Long)
   - Response: Room object
   - Status: 200 OK | 404 Not Found

3. **GET /api/rooms/building/{building}** - Get rooms in a building
   - Path Parameter: building (String)
   - Response: Array of Room objects
   - Status: 200 OK

4. **GET /api/rooms/floor/{floor}** - Get rooms on a floor
   - Path Parameter: floor (Integer)
   - Response: Array of Room objects
   - Status: 200 OK

5. **POST /api/rooms** - Create new room
   - Request: { "roomName": "LT001", "capacity": 100, "building": "Science Block", "floor": 1 }
   - Response: { "message": "Room created successfully", "room": {...} }
   - Status: 201 Created | 400 Bad Request

6. **PUT /api/rooms/{id}** - Update room
   - Path Parameter: id (Long)
   - Request: Room object (partial updates allowed)
   - Response: { "message": "Room updated successfully", "room": {...} }
   - Status: 200 OK | 404 Not Found

7. **DELETE /api/rooms/{id}** - Delete room
   - Path Parameter: id (Long)
   - Response: { "message": "Room deleted successfully" }
   - Status: 200 OK | 404 Not Found

## Conflict Detection Logic

### Room Conflicts
Prevents two exams in the same room with overlapping times:
```
If newExam.room == existingExam.room AND
   newExam.date == existingExam.date AND
   time ranges overlap
   → CONFLICT
```

Time overlap check:
```
newStart < existingEnd AND existingStart < newEnd → OVERLAP
```

### Invigilator Conflicts
Prevents an invigilator from being assigned to multiple exams at the same time:
```
If newExam.invigilator == existingExam.invigilator AND
   newExam.date == existingExam.date AND
   time ranges overlap
   → CONFLICT
```

## Usage Examples

### 1. Create a Room
```bash
curl -X POST http://localhost:8080/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "LT001",
    "capacity": 100,
    "building": "Science Block",
    "floor": 1
  }'
```

### 2. Create an Exam with Conflict Detection
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
    "invigilatorId": 5
  }'
```

**Success Response (201 Created):**
```json
{
  "hasConflict": false,
  "roomConflicts": [],
  "invigilatorConflicts": [],
  "message": "Exam created successfully with ID: 42"
}
```

**Conflict Response (409 Conflict):**
```json
{
  "hasConflict": true,
  "roomConflicts": [
    "Room LT001 already has Physics Lab (PHY201) from 09:00 to 11:00"
  ],
  "invigilatorConflicts": [],
  "message": "Scheduling conflict detected. Please resolve conflicts before creating exam."
}
```

### 3. Update an Exam
```bash
curl -X PUT http://localhost:8080/api/exams/42 \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "BSC121",
    "courseName": "Data Structures (Updated)",
    "roomId": 2,
    "examDate": "2025-11-15",
    "startTime": "13:00:00",
    "duration": 120,
    "invigilatorId": 6
  }'
```

### 4. Delete an Exam
```bash
curl -X DELETE http://localhost:8080/api/exams/42
```

### 5. Get All Available Rooms
```bash
curl http://localhost:8080/api/rooms
```

### 6. Get Rooms in a Building
```bash
curl http://localhost:8080/api/rooms/building/Science%20Block
```

## Files Created/Modified

### New Files Created:
1. `backend/src/main/java/com/examapp/model/Room.java` - Room entity
2. `backend/src/main/java/com/examapp/repository/RoomRepository.java` - Room data access
3. `backend/src/main/java/com/examapp/service/RoomService.java` - Room business logic
4. `backend/src/main/java/com/examapp/controller/RoomController.java` - Room REST endpoints
5. `backend/src/main/java/com/examapp/dto/ExamCreateRequest.java` - Exam creation DTO
6. `backend/src/main/java/com/examapp/dto/ConflictDetectionResponse.java` - Conflict response DTO

### Files Modified:
1. `backend/src/main/java/com/examapp/model/Exam.java` - Added Room relationship
2. `backend/src/main/java/com/examapp/repository/ExamRepository.java` - Added conflict detection queries
3. `backend/src/main/java/com/examapp/service/ExamService.java` - Added CRUD and conflict detection
4. `backend/src/main/java/com/examapp/controller/ExamController.java` - Added POST, PUT, DELETE endpoints

## Database Schema Changes

### New Table: rooms
```sql
CREATE TABLE rooms (
  id LONG PRIMARY KEY,
  room_name VARCHAR(255) UNIQUE NOT NULL,
  capacity INTEGER NOT NULL,
  building VARCHAR(255) NOT NULL,
  floor INTEGER
);
```

### Modified Table: exams
```sql
ALTER TABLE exams ADD COLUMN room_id LONG NOT NULL;
ALTER TABLE exams ADD FOREIGN KEY (room_id) REFERENCES rooms(id);
-- Note: venue column kept for backward compatibility
```

## Error Handling

All endpoints return appropriate HTTP status codes:

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | Update/Delete successful |
| 201 | Created | New exam/room created |
| 400 | Bad Request | Missing required fields |
| 404 | Not Found | Exam/Room/User not found |
| 409 | Conflict | Scheduling conflict detected |
| 500 | Server Error | Unexpected error |

## Best Practices

1. **Always validate input**: Required fields are checked before processing
2. **Use async/await**: All database operations use proper async handling
3. **Clear error messages**: Conflicts describe exactly what's wrong
4. **Backward compatibility**: Venue field still works for existing code
5. **Role-based access**: Consider adding role checks in controllers for production

## Next Steps for Frontend Integration

The frontend should:
1. Fetch all rooms via GET /api/rooms
2. Show room selection in exam creation form
3. Display conflict detection results to user
4. Provide clear error messages for scheduling conflicts
5. Allow retry with different room/time/invigilator when conflicts occur

## Testing the Feature

1. **Create multiple rooms** with different buildings/floors
2. **Create exams** that should succeed (different times/rooms)
3. **Try to create conflicting exams** - should get 409 error
4. **Update exams** to resolve conflicts
5. **Delete exams** and verify they're removed from the system

---
**Feature Status**: ✅ Complete - All backend APIs implemented with conflict detection
**Database Status**: Schema updated with Room entity
**Frontend Status**: Ready for integration (separate feature implementation)

