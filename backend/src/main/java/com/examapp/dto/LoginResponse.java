package com.examapp.dto;

/**
 * LoginResponse DTO - data sent back to frontend after successful login.
 * Contains JWT token and user details (but NOT password).
 */
public class LoginResponse {

    private String token; // JWT token for authentication
    private String username;
    private String fullName;
    private String role;

    // Constructors
    public LoginResponse() {}

    public LoginResponse(String token, String username, String fullName, String role) {
        this.token = token;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}