package com.examapp.service;

import com.examapp.dto.LoginRequest;
import com.examapp.dto.LoginResponse;
import com.examapp.model.User;
import com.examapp.repository.UserRepository;
import com.examapp.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * AuthService - handles user authentication and registration.
 * Validates credentials, generates JWT tokens, and manages passwords.
 */
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Authenticate user and generate JWT token
     * @param loginRequest - contains username and password
     * @return LoginResponse with JWT token if successful, null otherwise
     */
    public LoginResponse login(LoginRequest loginRequest) {
        // Find user by username
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElse(null);

        // Check if user exists and password matches
        if (user != null && passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getUsername());

            // Return response with token and user details
            return new LoginResponse(token, user.getUsername(), user.getFullName(), user.getRole());
        }

        return null; // Login failed
    }

    /**
     * Register a new user (for admin purposes)
     * @param user - user object with plain password
     * @return saved user with hashed password
     */
    public User registerUser(User user) {
        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    /**
     * Validate JWT token and get user details
     * @param token - JWT token
     * @return User if token is valid, null otherwise
     */
    public User validateToken(String token) {
        try {
            String username = jwtUtil.extractUsername(token);
            User user = userRepository.findByUsername(username).orElse(null);

            if (user != null && jwtUtil.validateToken(token, username)) {
                return user;
            }
        } catch (Exception e) {
            return null;
        }
        return null;
    }

    /**
     * Check if username already exists
     * @param username - username to check
     * @return true if exists, false otherwise
     */
    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }
}