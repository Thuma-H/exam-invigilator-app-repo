package com.examapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * SecurityConfig - Configures Spring Security for the application.
 * Disables default login page, enables JWT-based authentication.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Configure security filter chain
     * - Disable CSRF (not needed for stateless JWT APIs)
     * - Allow /api/auth/login without authentication (public endpoint)
     * - Require authentication for all other /api/** endpoints
     * - Use stateless session (no cookies, only JWT tokens)
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF protection (not needed for REST APIs with JWT)
                .csrf(csrf -> csrf.disable())

                // Configure authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints (no authentication required)
                        .requestMatchers("/api/auth/login", "/api/auth/logout").permitAll()

                        // All other /api/** endpoints require authentication
                        .requestMatchers("/api/**").authenticated()

                        // Allow all other requests (if any)
                        .anyRequest().permitAll()
                )

                // Use stateless session (no cookies, JWT tokens only)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Disable default form login (we use JWT)
                .formLogin(form -> form.disable())

                // Disable HTTP Basic authentication
                .httpBasic(basic -> basic.disable());

        return http.build();
    }

    /**
     * BCrypt password encoder bean
     * Used for hashing passwords during registration and validating during login
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}