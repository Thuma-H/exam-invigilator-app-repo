package com.examapp.repository;

import com.examapp.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * RoomRepository - Data access layer for Room entities.
 * Provides methods to query rooms from the database.
 */
@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    /**
     * Find a room by its name
     * @param roomName - room name
     * @return room if found
     */
    Optional<Room> findByRoomName(String roomName);

    /**
     * Find all rooms in a specific building
     * @param building - building name
     * @return list of rooms
     */
    List<Room> findByBuilding(String building);

    /**
     * Find all rooms on a specific floor
     * @param floor - floor number
     * @return list of rooms
     */
    List<Room> findByFloor(Integer floor);
}

