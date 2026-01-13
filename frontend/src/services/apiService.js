// src/services/apiService.js
const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

const apiService = {
    // ==================== AUTH ENDPOINTS ====================

    login: async (username, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!response.ok) {
            throw new Error('Login failed');
        }
        return response.json();
    },

    logout: async () => {
        // Optional: If backend has a logout endpoint
        // For now, just clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        return Promise.resolve();
    },

    // ==================== EXAM ENDPOINTS ====================

    getMyExams: async () => {
        const response = await fetch(`${API_BASE_URL}/exams`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to load exams');
        }
        return response.json();
    },

    getExamById: async (examId) => {
        const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to load exam details');
        }
        return response.json();
    },

    getStudentsForExam: async (examId) => {
        const response = await fetch(`${API_BASE_URL}/exams/${examId}/students`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to load students');
        }
        return response.json();
    },

    // ==================== ATTENDANCE ENDPOINTS ====================

    getAttendanceForExam: async (examId) => {
        const response = await fetch(`${API_BASE_URL}/attendance/exam/${examId}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to load attendance');
        }
        return response.json();
    },

    markAttendance: async (attendanceData) => {
        const response = await fetch(`${API_BASE_URL}/attendance`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(attendanceData),
        });
        if (!response.ok) {
            throw new Error('Failed to mark attendance');
        }
        return response.json();
    },

    getAttendanceSummary: async (examId) => {
        const response = await fetch(`${API_BASE_URL}/attendance/exam/${examId}/summary`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to load attendance summary');
        }
        return response.json();
    },

    // ==================== INCIDENT ENDPOINTS ====================

    reportIncident: async (incidentData) => {
        const response = await fetch(`${API_BASE_URL}/incidents`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(incidentData),
        });
        if (!response.ok) {
            throw new Error('Failed to report incident');
        }
        return response.json();
    },

    getExamIncidents: async (examId) => {
        const response = await fetch(`${API_BASE_URL}/incidents/exam/${examId}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to load incidents');
        }
        return response.json();
    },

    getIncidentCount: async (examId) => {
        const response = await fetch(`${API_BASE_URL}/incidents/exam/${examId}/count`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to load incident count');
        }
        const data = await response.json();
        return data.count || 0;
    },

    // ==================== STUDENT ENDPOINTS (For Librarian Dashboard) ====================

    getAllStudents: async () => {
        const response = await fetch(`${API_BASE_URL}/students`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to load students');
        }
        return response.json();
    },

    searchStudent: async (studentId) => {
        const response = await fetch(`${API_BASE_URL}/students/search?studentId=${encodeURIComponent(studentId)}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Student not found');
        }
        return response.json();
    },

    // ==================== BARCODE ENDPOINTS (For Librarian Dashboard) ====================

    downloadBarcode: async (studentId) => {
        const response = await fetch(`${API_BASE_URL}/barcode/download/${encodeURIComponent(studentId)}`, {
            headers: {
                'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to download barcode');
        }
        return response.blob();
    },
};

export default apiService;