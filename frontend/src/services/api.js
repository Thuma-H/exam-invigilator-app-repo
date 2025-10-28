// src/services/api.js - Fixed version with proper token handling
import axios from 'axios';

import { API_CONFIG } from '../config/environment';

// Create axios instance
const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
});

// Add token to ALL requests automatically
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔑 Sending request with token:', token.substring(0, 20) + '...');
        } else {
            console.warn('⚠️ No token found in sessionStorage');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        console.log('✅ Response received:', response.status);
        return response;
    },
    (error) => {
        console.error('❌ Request failed:', error.response?.status, error.message);

        // If 401, clear token and redirect to login
        if (error.response?.status === 401) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

// ============ AUTH APIs ============
export const login = (username, password) => {
    return api.post('/auth/login', { username, password });
};

export const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    return api.post('/auth/logout');
};

// ============ EXAM APIs ============
export const getMyExams = () => {
    console.log('📋 Fetching exams...');
    return api.get('/exams');
};

export const getExamById = (examId) => {
    return api.get(`/exams/${examId}`);
};

export const getStudentsForExam = (examId) => {
    return api.get(`/exams/${examId}/students`);
};

// ============ ATTENDANCE APIs ============
export const markAttendance = (examId, studentId, status, method) => {
    return api.post('/attendance', { examId, studentId, status, method });
};

export const getAttendanceForExam = (examId) => {
    return api.get(`/attendance/exam/${examId}`);
};

export const getAttendanceSummary = (examId) => {
    return api.get(`/attendance/exam/${examId}/summary`);
};

// ============ INCIDENT APIs ============
export const reportIncident = (examId, studentId, category, severity, description) => {
    return api.post('/incidents', { examId, studentId, category, severity, description });
};

export const getIncidentsForExam = (examId) => {
    return api.get(`/incidents/exam/${examId}`);
};

export const getIncidentCount = (examId) => {
    return api.get(`/incidents/exam/${examId}/count`);
};

export default api;