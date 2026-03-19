package com.examapp.service;

import com.examapp.model.Room;
import com.examapp.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * RoomService - handles room-related business logic.
 * Manages exam venues and room availability.
 */
@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    /**
     * Get all rooms
     * @return list of all rooms
     */
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    /**
     * Get room by ID
     * @param roomId - room ID
     * @return room if found
     */
    public Optional<Room> getRoomById(Long roomId) {
        return roomRepository.findById(roomId);
    }

    /**
     * Get room by name
     * @param roomName - room name
     * @return room if found
     */
    public Optional<Room> getRoomByName(String roomName) {
        return roomRepository.findByRoomName(roomName);
    }

    /**
     * Get all rooms in a specific building
     * @param building - building name
     * @return list of rooms in that building
     */
    public List<Room> getRoomsByBuilding(String building) {
        return roomRepository.findByBuilding(building);
    }

    /**
     * Get all rooms on a specific floor
     * @param floor - floor number
     * @return list of rooms on that floor
     */
    public List<Room> getRoomsByFloor(Integer floor) {
        return roomRepository.findByFloor(floor);
    }

    /**
     * Create a new room
     * @param room - room object to save
     * @return saved room
     */
    public Room createRoom(Room room) {
        return roomRepository.save(room);
    }

    /**
     * Update an existing room
     * @param room - room object to update
     * @return updated room
     */
    public Room updateRoom(Room room) {
        return roomRepository.save(room);
    }

    /**
     * Delete a room
     * @param roomId - room ID to delete
     */
    public void deleteRoom(Long roomId) {
        roomRepository.deleteById(roomId);
    }
}

