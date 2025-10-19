package com.examapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * CorsConfig - Configures Cross-Origin Resource Sharing (CORS).
 * Allows React frontend (localhost:3000) to make requests to Spring Boot backend (localhost:8080).
 */
@Configuration
public class CorsConfig {

    /**
     * Configure CORS to allow frontend-backend communication
     * - Allow requests from http://localhost:3000 (React dev server)
     * - Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
     * - Allow Authorization header (for JWT tokens)
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow React development server
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));

        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Allow all headers (including Authorization for JWT)
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // Apply CORS configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }
}