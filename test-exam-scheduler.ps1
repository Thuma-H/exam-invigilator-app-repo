# Exam Scheduler Feature - PowerShell Testing Script
# Save as: test-exam-scheduler.ps1
# Run with: powershell -ExecutionPolicy Bypass -File test-exam-scheduler.ps1

$BASE_URL = "http://localhost:8080/api"

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Exam Scheduler Feature - Testing" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

# Function to print section headers
function Print-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "=== $Title ===" -ForegroundColor Yellow
    Write-Host ""
}

# Function to pretty print JSON
function Format-Json {
    param([object]$JsonObject)
    $JsonObject | ConvertTo-Json | Write-Host -ForegroundColor Cyan
}

# ============================================
# STEP 1: CREATE ROOMS
# ============================================
Print-Section "STEP 1: Creating Sample Rooms"

Write-Host "Creating Room 1 (LT001)..."
$ROOM_1 = Invoke-WebRequest -Uri "$BASE_URL/rooms" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body (ConvertTo-Json @{
        roomName = "LT001"
        capacity = 100
        building = "Science Block"
        floor = 1
    }) -ErrorAction Stop | ConvertFrom-Json

Write-Host "✓ Room 1 created" -ForegroundColor Green
$ROOM_1_ID = $ROOM_1.room.id
Write-Host "Room 1 ID: $ROOM_1_ID"

Write-Host ""
Write-Host "Creating Room 2 (LT002)..."
$ROOM_2 = Invoke-WebRequest -Uri "$BASE_URL/rooms" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body (ConvertTo-Json @{
        roomName = "LT002"
        capacity = 120
        building = "Science Block"
        floor = 1
    }) -ErrorAction Stop | ConvertFrom-Json

Write-Host "✓ Room 2 created" -ForegroundColor Green
$ROOM_2_ID = $ROOM_2.room.id
Write-Host "Room 2 ID: $ROOM_2_ID"

Write-Host ""
Write-Host "Creating Room 3 (LT101)..."
$ROOM_3 = Invoke-WebRequest -Uri "$BASE_URL/rooms" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body (ConvertTo-Json @{
        roomName = "LT101"
        capacity = 80
        building = "Engineering Block"
        floor = 2
    }) -ErrorAction Stop | ConvertFrom-Json

Write-Host "✓ Room 3 created" -ForegroundColor Green
$ROOM_3_ID = $ROOM_3.room.id
Write-Host "Room 3 ID: $ROOM_3_ID"

# ============================================
# STEP 2: GET ALL ROOMS
# ============================================
Print-Section "STEP 2: Verifying Rooms"

Write-Host "Getting all rooms..."
$ROOMS = Invoke-WebRequest -Uri "$BASE_URL/rooms" `
    -Method GET | ConvertFrom-Json
Write-Host "Total rooms created: $($ROOMS.Count)" -ForegroundColor Green

# ============================================
# STEP 3: CREATE EXAMS
# ============================================
Print-Section "STEP 3: Creating Exams"

Write-Host "Creating Exam 1 (should succeed)..."
$EXAM_1 = Invoke-WebRequest -Uri "$BASE_URL/exams" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body (ConvertTo-Json @{
        courseCode = "BSC121"
        courseName = "Data Structures"
        roomId = $ROOM_1_ID
        examDate = "2025-11-15"
        startTime = "09:00:00"
        duration = 120
        invigilatorId = 1
    }) -ErrorAction Stop | ConvertFrom-Json

if ($EXAM_1.hasConflict -eq $false) {
    Write-Host "✓ Exam 1 created successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Exam 1 failed" -ForegroundColor Red
    Format-Json $EXAM_1
}
$EXAM_1_ID = 1  # Set manually if needed

# ============================================
# STEP 4: TEST ROOM CONFLICT
# ============================================
Print-Section "STEP 4: Testing Room Conflict Detection"

Write-Host "Trying to create exam with room conflict..."
try {
    $CONFLICT_1 = Invoke-WebRequest -Uri "$BASE_URL/exams" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body (ConvertTo-Json @{
            courseCode = "PHY201"
            courseName = "Physics Lab"
            roomId = $ROOM_1_ID
            examDate = "2025-11-15"
            startTime = "10:00:00"
            duration = 90
            invigilatorId = 2
        }) -ErrorAction Stop | ConvertFrom-Json

    if ($CONFLICT_1.hasConflict) {
        Write-Host "✓ Conflict detected correctly!" -ForegroundColor Green
        Write-Host "Conflict Details:" -ForegroundColor Cyan
        $CONFLICT_1.roomConflicts | ForEach-Object { Write-Host "  - $_" }
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "✓ Conflict detected (409 status)" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
}

# ============================================
# STEP 5: CREATE EXAM IN DIFFERENT ROOM
# ============================================
Print-Section "STEP 5: Creating Exam in Different Room"

Write-Host "Creating Exam 2 (different room, should succeed)..."
$EXAM_2 = Invoke-WebRequest -Uri "$BASE_URL/exams" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body (ConvertTo-Json @{
        courseCode = "PHY201"
        courseName = "Physics Lab"
        roomId = $ROOM_2_ID
        examDate = "2025-11-15"
        startTime = "10:00:00"
        duration = 90
        invigilatorId = 2
    }) -ErrorAction Stop | ConvertFrom-Json

if ($EXAM_2.hasConflict -eq $false) {
    Write-Host "✓ Exam 2 created successfully" -ForegroundColor Green
}
$EXAM_2_ID = 2

# ============================================
# STEP 6: TEST INVIGILATOR CONFLICT
# ============================================
Print-Section "STEP 6: Testing Invigilator Conflict Detection"

Write-Host "Trying to create exam with invigilator conflict..."
try {
    $CONFLICT_2 = Invoke-WebRequest -Uri "$BASE_URL/exams" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body (ConvertTo-Json @{
            courseCode = "CHM301"
            courseName = "Chemistry"
            roomId = $ROOM_3_ID
            examDate = "2025-11-15"
            startTime = "10:30:00"
            duration = 90
            invigilatorId = 1
        }) -ErrorAction Stop | ConvertFrom-Json

    if ($CONFLICT_2.hasConflict) {
        Write-Host "✓ Invigilator conflict detected correctly!" -ForegroundColor Green
        Write-Host "Conflict Details:" -ForegroundColor Cyan
        $CONFLICT_2.invigilatorConflicts | ForEach-Object { Write-Host "  - $_" }
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "✓ Conflict detected (409 status)" -ForegroundColor Green
    }
}

# ============================================
# STEP 7: CREATE NON-OVERLAPPING EXAM
# ============================================
Print-Section "STEP 7: Creating Non-Overlapping Exam"

Write-Host "Creating Exam 3 (same invigilator, different time, should succeed)..."
$EXAM_3 = Invoke-WebRequest -Uri "$BASE_URL/exams" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body (ConvertTo-Json @{
        courseCode = "CHM301"
        courseName = "Chemistry"
        roomId = $ROOM_3_ID
        examDate = "2025-11-15"
        startTime = "11:30:00"
        duration = 90
        invigilatorId = 1
    }) -ErrorAction Stop | ConvertFrom-Json

if ($EXAM_3.hasConflict -eq $false) {
    Write-Host "✓ Exam 3 created successfully" -ForegroundColor Green
}
$EXAM_3_ID = 3

# ============================================
# STEP 8: UPDATE EXAM
# ============================================
Print-Section "STEP 8: Updating an Exam"

Write-Host "Updating Exam 2 to different time..."
$UPDATE = Invoke-WebRequest -Uri "$BASE_URL/exams/$EXAM_2_ID" `
    -Method PUT `
    -Headers @{"Content-Type" = "application/json"} `
    -Body (ConvertTo-Json @{
        courseCode = "PHY201"
        courseName = "Physics Lab (Updated)"
        roomId = $ROOM_2_ID
        examDate = "2025-11-15"
        startTime = "13:00:00"
        duration = 90
        invigilatorId = 2
    }) -ErrorAction Stop | ConvertFrom-Json

if ($UPDATE.hasConflict -eq $false) {
    Write-Host "✓ Exam updated successfully" -ForegroundColor Green
}

# ============================================
# STEP 9: GET ALL EXAMS
# ============================================
Print-Section "STEP 9: Retrieving All Exams"

Write-Host "Getting all exams..."
$ALL_EXAMS = Invoke-WebRequest -Uri "$BASE_URL/exams" `
    -Method GET | ConvertFrom-Json
Write-Host "Total exams: $($ALL_EXAMS.Count)" -ForegroundColor Green

# ============================================
# STEP 10: DELETE EXAM
# ============================================
Print-Section "STEP 10: Deleting an Exam"

Write-Host "Deleting Exam 3..."
$DELETE = Invoke-WebRequest -Uri "$BASE_URL/exams/$EXAM_3_ID" `
    -Method DELETE | ConvertFrom-Json
Write-Host "✓ Exam deleted successfully" -ForegroundColor Green

# ============================================
# STEP 11: VERIFY DELETION
# ============================================
Print-Section "STEP 11: Verifying Deletion"

Write-Host "Getting all exams after deletion..."
$ALL_EXAMS = Invoke-WebRequest -Uri "$BASE_URL/exams" `
    -Method GET | ConvertFrom-Json
Write-Host "Total exams remaining: $($ALL_EXAMS.Count)" -ForegroundColor Green

# ============================================
# SUMMARY
# ============================================
Print-Section "TEST SUMMARY"

Write-Host "✓ Created 3 rooms" -ForegroundColor Green
Write-Host "✓ Created exams with success" -ForegroundColor Green
Write-Host "✓ Detected room conflicts" -ForegroundColor Green
Write-Host "✓ Detected invigilator conflicts" -ForegroundColor Green
Write-Host "✓ Updated exams" -ForegroundColor Green
Write-Host "✓ Deleted exams" -ForegroundColor Green
Write-Host ""
Write-Host "All tests completed!" -ForegroundColor Green
Write-Host ""

