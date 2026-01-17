// src/services/apiService.js
const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
    // Prefer sessionStorage (Login.js stores token in sessionStorage), fall back to localStorage
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

// Helper to parse JSON responses and return { data }
async function handleJsonResponse(response) {
    if (!response.ok) {
        const text = await response.text().catch(() => null);
        throw new Error(text || response.statusText || 'Request failed');
    }
    const json = await response.json().catch(() => null);
    return { data: json };
}

// Helper to parse blob responses (for downloads). Returns raw blob.
async function handleBlobResponse(response) {
    if (!response.ok) {
        const text = await response.text().catch(() => null);
        throw new Error(text || response.statusText || 'Request failed');
    }
    const blob = await response.blob();
    return blob;
}

const apiService = {
    // ==================== AUTH ENDPOINTS ====================

    login: async (username, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        return handleJsonResponse(response);
    },

    logout: async () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        return { data: 'Logged out' };
    },

    // ==================== EXAM ENDPOINTS ====================

    getMyExams: async () => {
        const response = await fetch(`${API_BASE_URL}/exams`, { headers: getAuthHeaders() });
        if (!response.ok) {
            const text = await response.text().catch(() => null);
            throw new Error(text || response.statusText || 'Request failed');
        }
        const json = await response.json().catch(() => []);
        // Return raw array for compatibility with Dashboard
        return json;
    },

    getExamById: async (examId) => {
        const response = await fetch(`${API_BASE_URL}/exams/${examId}`, { headers: getAuthHeaders() });
        return handleJsonResponse(response);
    },

    getStudentsForExam: async (examId) => {
        const response = await fetch(`${API_BASE_URL}/exams/${examId}/students`, { headers: getAuthHeaders() });
        return handleJsonResponse(response);
    },

    // ==================== ATTENDANCE ENDPOINTS ====================

    getAttendanceForExam: async (examId) => {
        const response = await fetch(`${API_BASE_URL}/attendance/exam/${examId}`, { headers: getAuthHeaders() });
        return handleJsonResponse(response);
    },

    markAttendance: async (attendanceData) => {
        const response = await fetch(`${API_BASE_URL}/attendance`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(attendanceData),
        });
        return handleJsonResponse(response);
    },

    getAttendanceSummary: async (examId) => {
        const response = await fetch(`${API_BASE_URL}/attendance/exam/${examId}/summary`, { headers: getAuthHeaders() });
        return handleJsonResponse(response);
    },

    // ==================== INCIDENT ENDPOINTS ====================

    reportIncident: async (incidentData) => {
        const response = await fetch(`${API_BASE_URL}/incidents`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(incidentData),
        });
        return handleJsonResponse(response);
    },

    getExamIncidents: async (examId) => {
        const response = await fetch(`${API_BASE_URL}/incidents/exam/${examId}`, { headers: getAuthHeaders() });
        return handleJsonResponse(response);
    },

    getIncidentCount: async (examId) => {
        const response = await fetch(`${API_BASE_URL}/incidents/exam/${examId}/count`, { headers: getAuthHeaders() });
        if (!response.ok) {
            const text = await response.text().catch(() => null);
            throw new Error(text || response.statusText || 'Request failed');
        }
        const data = await response.json().catch(() => ({}));
        return { data: data.count || 0 };
    },

    // ==================== STUDENT ENDPOINTS (For Librarian Dashboard) ====================

    getAllStudents: async () => {
        const response = await fetch(`${API_BASE_URL}/students`, { headers: getAuthHeaders() });
        return handleJsonResponse(response);
    },

    searchStudent: async (studentId) => {
        const response = await fetch(`${API_BASE_URL}/students/search?studentId=${encodeURIComponent(studentId)}`, { headers: getAuthHeaders() });
        return handleJsonResponse(response);
    },

    // ==================== BARCODE ENDPOINTS (For Librarian Dashboard) ====================

    downloadBarcode: async (studentId) => {
        const response = await fetch(`${API_BASE_URL}/barcode/download/${encodeURIComponent(studentId)}`, { headers: getAuthHeaders() });
        // Return raw blob (frontend code expects a Blob)
        return handleBlobResponse(response);
    },
};

export default apiService;

// Named exports (aliases) for components that import specific functions
// Some components expect different names (e.g. getIncidentsForExam) — provide aliases
export const login = (username, password) => apiService.login(username, password);
export const logout = () => apiService.logout();
export const getExamById = (examId) => apiService.getExamById(examId);
export const getStudentsForExam = (examId) => apiService.getStudentsForExam(examId);
// alias: components expect getIncidentsForExam but this file originally named it getExamIncidents
export const getIncidentsForExam = (examId) => apiService.getExamIncidents(examId);
export const reportIncident = (incidentData) => apiService.reportIncident(incidentData);

// Attendance-related named exports
export const getAttendanceForExam = (examId) => apiService.getAttendanceForExam(examId);
// Mark attendance helper: accept parameters (examId, studentId, status, method) and forward as object
export const markAttendance = (examId, studentId, status, method = 'MANUAL') => apiService.markAttendance({ examId, studentId, status, method });
export const getAttendanceSummary = (examId) => apiService.getAttendanceSummary(examId);
export const getIncidentCount = (examId) => apiService.getIncidentCount(examId);

// Additional named exports used by librarian dashboard
export const getAllStudents = () => apiService.getAllStudents();
export const searchStudent = (studentId) => apiService.searchStudent(studentId);
export const downloadBarcode = (studentId) => apiService.downloadBarcode(studentId);

