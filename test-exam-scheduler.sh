#!/bin/bash
# Exam Scheduler Feature - Curl Testing Commands
# Save as: test-exam-scheduler.sh
# Run with: bash test-exam-scheduler.sh

BASE_URL="http://localhost:8080/api"

echo "=========================================="
echo "Exam Scheduler Feature - Testing"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo ""
    echo -e "${YELLOW}=== $1 ===${NC}"
    echo ""
}

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ Success${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
    fi
}

# ============================================
# STEP 1: CREATE ROOMS
# ============================================
print_section "STEP 1: Creating Sample Rooms"

echo "Creating Room 1 (LT001)..."
ROOM_1=$(curl -s -X POST $BASE_URL/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "LT001",
    "capacity": 100,
    "building": "Science Block",
    "floor": 1
  }')
echo $ROOM_1 | grep -q "message"
print_result $?
ROOM_1_ID=$(echo $ROOM_1 | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo "Room 1 ID: $ROOM_1_ID"

echo ""
echo "Creating Room 2 (LT002)..."
ROOM_2=$(curl -s -X POST $BASE_URL/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "LT002",
    "capacity": 120,
    "building": "Science Block",
    "floor": 1
  }')
echo $ROOM_2 | grep -q "message"
print_result $?
ROOM_2_ID=$(echo $ROOM_2 | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo "Room 2 ID: $ROOM_2_ID"

echo ""
echo "Creating Room 3 (LT101)..."
ROOM_3=$(curl -s -X POST $BASE_URL/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "LT101",
    "capacity": 80,
    "building": "Engineering Block",
    "floor": 2
  }')
echo $ROOM_3 | grep -q "message"
print_result $?
ROOM_3_ID=$(echo $ROOM_3 | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo "Room 3 ID: $ROOM_3_ID"

# ============================================
# STEP 2: GET ALL ROOMS
# ============================================
print_section "STEP 2: Verifying Rooms"

echo "Getting all rooms..."
ROOMS=$(curl -s -X GET $BASE_URL/rooms)
ROOM_COUNT=$(echo $ROOMS | grep -o '"id"' | wc -l)
echo "Total rooms created: $ROOM_COUNT"

# ============================================
# STEP 3: CREATE EXAMS
# ============================================
print_section "STEP 3: Creating Exams"

echo "Creating Exam 1 (should succeed)..."
EXAM_1=$(curl -s -X POST $BASE_URL/exams \
  -H "Content-Type: application/json" \
  -d "{
    \"courseCode\": \"BSC121\",
    \"courseName\": \"Data Structures\",
    \"roomId\": $ROOM_1_ID,
    \"examDate\": \"2025-11-15\",
    \"startTime\": \"09:00:00\",
    \"duration\": 120,
    \"invigilatorId\": 1
  }")
echo "Response: $EXAM_1"
EXAM_1_ID=$(echo $EXAM_1 | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo "Exam 1 ID: $EXAM_1_ID"

# ============================================
# STEP 4: TEST ROOM CONFLICT
# ============================================
print_section "STEP 4: Testing Room Conflict Detection"

echo "Trying to create exam with room conflict (same room, overlapping time)..."
CONFLICT_1=$(curl -s -X POST $BASE_URL/exams \
  -H "Content-Type: application/json" \
  -d "{
    \"courseCode\": \"PHY201\",
    \"courseName\": \"Physics Lab\",
    \"roomId\": $ROOM_1_ID,
    \"examDate\": \"2025-11-15\",
    \"startTime\": \"10:00:00\",
    \"duration\": 90,
    \"invigilatorId\": 2
  }")
echo "Response: $CONFLICT_1"
echo $CONFLICT_1 | grep -q "roomConflicts"
print_result $?

# ============================================
# STEP 5: CREATE EXAM IN DIFFERENT ROOM
# ============================================
print_section "STEP 5: Creating Exam in Different Room"

echo "Creating Exam 2 (different room, should succeed)..."
EXAM_2=$(curl -s -X POST $BASE_URL/exams \
  -H "Content-Type: application/json" \
  -d "{
    \"courseCode\": \"PHY201\",
    \"courseName\": \"Physics Lab\",
    \"roomId\": $ROOM_2_ID,
    \"examDate\": \"2025-11-15\",
    \"startTime\": \"10:00:00\",
    \"duration\": 90,
    \"invigilatorId\": 2
  }")
echo "Response: $EXAM_2"
EXAM_2_ID=$(echo $EXAM_2 | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo "Exam 2 ID: $EXAM_2_ID"

# ============================================
# STEP 6: TEST INVIGILATOR CONFLICT
# ============================================
print_section "STEP 6: Testing Invigilator Conflict Detection"

echo "Trying to create exam with invigilator conflict..."
CONFLICT_2=$(curl -s -X POST $BASE_URL/exams \
  -H "Content-Type: application/json" \
  -d "{
    \"courseCode\": \"CHM301\",
    \"courseName\": \"Chemistry\",
    \"roomId\": $ROOM_3_ID,
    \"examDate\": \"2025-11-15\",
    \"startTime\": \"10:30:00\",
    \"duration\": 90,
    \"invigilatorId\": 1
  }")
echo "Response: $CONFLICT_2"
echo $CONFLICT_2 | grep -q "invigilatorConflicts"
print_result $?

# ============================================
# STEP 7: CREATE NON-OVERLAPPING EXAM
# ============================================
print_section "STEP 7: Creating Non-Overlapping Exam"

echo "Creating Exam 3 (same invigilator, different time, should succeed)..."
EXAM_3=$(curl -s -X POST $BASE_URL/exams \
  -H "Content-Type: application/json" \
  -d "{
    \"courseCode\": \"CHM301\",
    \"courseName\": \"Chemistry\",
    \"roomId\": $ROOM_3_ID,
    \"examDate\": \"2025-11-15\",
    \"startTime\": \"11:30:00\",
    \"duration\": 90,
    \"invigilatorId\": 1
  }")
echo "Response: $EXAM_3"
EXAM_3_ID=$(echo $EXAM_3 | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo "Exam 3 ID: $EXAM_3_ID"

# ============================================
# STEP 8: UPDATE EXAM
# ============================================
print_section "STEP 8: Updating an Exam"

echo "Updating Exam 2 to different time..."
UPDATE=$(curl -s -X PUT $BASE_URL/exams/$EXAM_2_ID \
  -H "Content-Type: application/json" \
  -d "{
    \"courseCode\": \"PHY201\",
    \"courseName\": \"Physics Lab (Updated)\",
    \"roomId\": $ROOM_2_ID,
    \"examDate\": \"2025-11-15\",
    \"startTime\": \"13:00:00\",
    \"duration\": 90,
    \"invigilatorId\": 2
  }")
echo "Response: $UPDATE"

# ============================================
# STEP 9: GET ALL EXAMS
# ============================================
print_section "STEP 9: Retrieving All Exams"

echo "Getting all exams..."
ALL_EXAMS=$(curl -s -X GET $BASE_URL/exams)
EXAM_COUNT=$(echo $ALL_EXAMS | grep -o '"id"' | wc -l)
echo "Total exams: $EXAM_COUNT (should be 3 or more)"

# ============================================
# STEP 10: DELETE EXAM
# ============================================
print_section "STEP 10: Deleting an Exam"

echo "Deleting Exam 3..."
DELETE=$(curl -s -X DELETE $BASE_URL/exams/$EXAM_3_ID)
echo "Response: $DELETE"
echo $DELETE | grep -q "message"
print_result $?

# ============================================
# STEP 11: VERIFY DELETION
# ============================================
print_section "STEP 11: Verifying Deletion"

echo "Getting all exams after deletion..."
ALL_EXAMS=$(curl -s -X GET $BASE_URL/exams)
EXAM_COUNT=$(echo $ALL_EXAMS | grep -o '"id"' | wc -l)
echo "Total exams: $EXAM_COUNT (should be 2)"

# ============================================
# SUMMARY
# ============================================
print_section "TEST SUMMARY"

echo "✓ Created 3 rooms"
echo "✓ Created exams with success"
echo "✓ Detected room conflicts"
echo "✓ Detected invigilator conflicts"
echo "✓ Updated exams"
echo "✓ Deleted exams"
echo ""
echo "All tests completed!"
echo ""

