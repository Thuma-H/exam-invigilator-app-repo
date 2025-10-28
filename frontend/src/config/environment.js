// environment.js - Central configuration for the application
// Change these settings to match your network/deployment environment

// API Configuration
export const API_CONFIG = {
    // Change this IP address to match your backend server
    // For local development: 'http://localhost:8080/api'
    // For network deployment: 'http://192.168.X.X:8080/api' (replace X.X with your IP)
    BASE_URL: 'http://localhost:8080/api',

    // Request timeout in milliseconds
    TIMEOUT: 5000,

    // Enable/disable offline mode functionality
    OFFLINE_ENABLED: true
};

// Application Configuration
export const APP_CONFIG = {
    // Enable barcode scanner functionality
    SCAN_MODE_ENABLED: true,

    // Enable offline mode (saves data locally when no internet)
    OFFLINE_MODE_ENABLED: true,

    // Demo mode for presentations (auto-fills login, simulates features)
    DEMO_MODE: false
};

// Demo data (used when DEMO_MODE is true)
export const DEMO_DATA = {
    autoLogin: {
        username: 'invigilator1',
        password: 'password123'
    },
    simulateScanner: true
};