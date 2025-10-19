// src/services/api.js - All backend API calls in one place
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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