package com.examapp.repository;

import com.examapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * UserRepository handles database operations for User entity.
 * Spring Data JPA automatically implements these methods.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by username (used for login authentication)
     * @param username - the username to search for
     * @return Optional<User> - user if found, empty otherwise
     */
    Optional<User> findByUsername(String username);

    /**
     * Check if username already exists (for registration validation)
     * @param username - the username to check
     * @return boolean - true if exists, false otherwise
     */
    boolean existsByUsername(String username);
}