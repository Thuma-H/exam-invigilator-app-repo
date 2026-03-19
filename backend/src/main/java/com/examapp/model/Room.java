package com.examapp.model;

import jakarta.persistence.*;

/**
 * Room entity represents physical exam venues.
 * Tracks room capacity and building location for exam scheduling.
 */
@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_name", nullable = false, unique = true)
    private String roomName; // e.g., "LT001", "LT002"

    @Column(nullable = false)
    private Integer capacity; // Maximum number of students

    @Column(name = "building", nullable = false)
    private String building; // e.g., "Science Building", "Engineering Block"

    @Column(name = "floor", nullable = true)
    private Integer floor; // Optional floor number

    // Constructors
    public Room() {}

    public Room(String roomName, Integer capacity, String building) {
        this.roomName = roomName;
        this.capacity = capacity;
        this.building = building;
    }

    public Room(String roomName, Integer capacity, String building, Integer floor) {
        this.roomName = roomName;
        this.capacity = capacity;
        this.building = building;
        this.floor = floor;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public Integer getFloor() {
        return floor;
    }

    public void setFloor(Integer floor) {
        this.floor = floor;
    }

    @Override
    public String toString() {
        return "Room{" +
                "id=" + id +
                ", roomName='" + roomName + '\'' +
                ", capacity=" + capacity +
                ", building='" + building + '\'' +
                ", floor=" + floor +
                '}';
    }
}

