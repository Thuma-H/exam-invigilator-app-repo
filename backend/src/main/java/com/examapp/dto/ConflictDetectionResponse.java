package com.examapp.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * ConflictDetectionResponse - Response DTO for conflict detection
 * Contains details about scheduling conflicts found
 */
public class ConflictDetectionResponse {
    private boolean hasConflict;
    private List<String> roomConflicts = new ArrayList<>(); // Conflicts with other exams in same room
    private List<String> invigilatorConflicts = new ArrayList<>(); // Conflicts with invigilator's other exams
    private String message;

    // Constructors
    public ConflictDetectionResponse() {
        this.hasConflict = false;
    }

    public ConflictDetectionResponse(boolean hasConflict, String message) {
        this.hasConflict = hasConflict;
        this.message = message;
    }

    // Getters and Setters
    public boolean hasConflict() {
        return hasConflict || !roomConflicts.isEmpty() || !invigilatorConflicts.isEmpty();
    }

    public void setHasConflict(boolean hasConflict) {
        this.hasConflict = hasConflict;
    }

    public List<String> getRoomConflicts() {
        return roomConflicts;
    }

    public void setRoomConflicts(List<String> roomConflicts) {
        this.roomConflicts = roomConflicts;
    }

    public void addRoomConflict(String conflict) {
        this.roomConflicts.add(conflict);
    }

    public List<String> getInvigilatorConflicts() {
        return invigilatorConflicts;
    }

    public void setInvigilatorConflicts(List<String> invigilatorConflicts) {
        this.invigilatorConflicts = invigilatorConflicts;
    }

    public void addInvigilatorConflict(String conflict) {
        this.invigilatorConflicts.add(conflict);
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

