package com.examapp.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * User entity represents system users: invigilators, admins, and librarians.
 * Stores authentication credentials and profile information.
 * The 'role' column discriminates between INVIGILATOR, ADMIN, and LIBRARIAN.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    @JsonIgnore
    private String password; // BCrypt hashed

    @Column(name = "full_name", nullable = false)
    private String fullName;

    // Contact email — used for notifications and scheduling confirmations
    @Column
    private String email;

    // Academic department the invigilator belongs to (e.g. "Computer Science")
    @Column
    private String department;

    @Column(nullable = false)
    private String role; // "INVIGILATOR", "ADMIN", or "LIBRARIAN"

    // Constructors
    public User() {}

    public User(String username, String password, String fullName, String role) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}