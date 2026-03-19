package com.examapp.controller;

import com.examapp.model.Room;
import com.examapp.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * RoomController - REST API endpoints for room management.
 * Handles retrieving and managing exam venues.
 */
@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomController {

    @Autowired
    private RoomService roomService;

    /**
     * Get all available rooms
     * GET /api/rooms
     */
    @GetMapping
    public ResponseEntity<?> getAllRooms() {
        try {
            List<Room> rooms = roomService.getAllRooms();
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching rooms: " + e.getMessage());
        }
    }

    /**
     * Get room by ID
     * GET /api/rooms/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getRoomById(@PathVariable Long id) {
        try {
            return roomService.getRoomById(id)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Room not found with ID: " + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching room: " + e.getMessage());
        }
    }

    /**
     * Get rooms by building
     * GET /api/rooms/building/{building}
     */
    @GetMapping("/building/{building}")
    public ResponseEntity<?> getRoomsByBuilding(@PathVariable String building) {
        try {
            List<Room> rooms = roomService.getRoomsByBuilding(building);
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching rooms: " + e.getMessage());
        }
    }

    /**
     * Get rooms by floor
     * GET /api/rooms/floor/{floor}
     */
    @GetMapping("/floor/{floor}")
    public ResponseEntity<?> getRoomsByFloor(@PathVariable Integer floor) {
        try {
            List<Room> rooms = roomService.getRoomsByFloor(floor);
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching rooms: " + e.getMessage());
        }
    }

    /**
     * Create a new room
     * POST /api/rooms
     * Body: { "roomName": "LT001", "capacity": 100, "building": "Science Block", "floor": 1 }
     */
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody Room room) {
        try {
            // Validate required fields
            if (room.getRoomName() == null || room.getRoomName().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Room name is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            if (room.getCapacity() == null || room.getCapacity() <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Capacity must be greater than 0");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            if (room.getBuilding() == null || room.getBuilding().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Building is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            Room savedRoom = roomService.createRoom(room);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Room created successfully");
            response.put("room", savedRoom);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error creating room: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Update an existing room
     * PUT /api/rooms/{id}
     * Body: { "roomName": "LT001", "capacity": 120, "building": "Science Block", "floor": 1 }
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoom(@PathVariable Long id, @RequestBody Room roomDetails) {
        try {
            Room existingRoom = roomService.getRoomById(id)
                    .orElseThrow(() -> new RuntimeException("Room not found with ID: " + id));

            // Update fields
            if (roomDetails.getRoomName() != null && !roomDetails.getRoomName().isEmpty()) {
                existingRoom.setRoomName(roomDetails.getRoomName());
            }
            if (roomDetails.getCapacity() != null && roomDetails.getCapacity() > 0) {
                existingRoom.setCapacity(roomDetails.getCapacity());
            }
            if (roomDetails.getBuilding() != null && !roomDetails.getBuilding().isEmpty()) {
                existingRoom.setBuilding(roomDetails.getBuilding());
            }
            if (roomDetails.getFloor() != null) {
                existingRoom.setFloor(roomDetails.getFloor());
            }

            Room updatedRoom = roomService.updateRoom(existingRoom);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Room updated successfully");
            response.put("room", updatedRoom);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error updating room: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Delete a room
     * DELETE /api/rooms/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
        try {
            Room room = roomService.getRoomById(id)
                    .orElseThrow(() -> new RuntimeException("Room not found with ID: " + id));

            roomService.deleteRoom(id);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Room deleted successfully");
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error deleting room: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}

