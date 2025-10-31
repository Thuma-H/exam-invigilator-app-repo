// environment.js - Network-aware configuration

// INSTRUCTIONS FOR NETWORK DEPLOYMENT:
// 1. Find your IP: Run 'ipconfig' (Windows) or 'ifconfig' (Mac)
// 2. Update BACKEND_IP below with your IPv4 address (e.g., '192.168.1.100')
// 3. Restart frontend: Ctrl+C then 'npm start'

const BACKEND_IP = '192.168.8.119'; // ⚠️ CHANGE THIS TO YOUR IP
const BACKEND_PORT = '8080';

// Auto-detect if running on same machine or different device
const isLocalhost = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

const API_BASE = isLocalhost
    ? `http://localhost:${BACKEND_PORT}/api`  // Same machine
    : `http://${BACKEND_IP}:${BACKEND_PORT}/api`; // Network devices

export const API_CONFIG = {
    BASE_URL: API_BASE,
    TIMEOUT: 5000,
    OFFLINE_ENABLED: true
};

export const APP_CONFIG = {
    SCAN_MODE_ENABLED: false, // Scanner not working
    OFFLINE_MODE_ENABLED: true,
    DEMO_MODE: false
};

export const DEMO_DATA = {
    autoLogin: {
        username: 'invigilator1',
        password: 'password123'
    }
};

// Display current config in console for debugging
console.log('🌐 API Configuration:', {
    baseURL: API_CONFIG.BASE_URL,
    isLocalhost: isLocalhost,
    hostname: window.location.hostname
});