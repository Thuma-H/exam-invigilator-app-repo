// src/services/apiService.js
import { API_CONFIG } from '../config/environment.js';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Log the API configuration on startup
console.log('🚀 API Service initialized with BASE_URL:', API_BASE_URL);
console.log('   Full auth endpoint would be:', `${API_BASE_URL}/auth/login`);

const getAuthHeaders = () => {
    // Prefer sessionStorage (Login.js stores token in sessionStorage), fall back to localStorage
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

// Auto-clear bad auth and redirect to login
function handleAuthError(errorText) {
    const isAuthError = errorText && (
        errorText.includes('JWT') ||
        errorText.includes('token') ||
        errorText.includes('Unauthorized') ||
        errorText.includes('Access Denied')
    );
    if (isAuthError) {
        console.warn('Auth error detected — clearing session and redirecting to login');
        sessionStorage.clear();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.href = '/login';
    }
}

// Helper to parse JSON responses and return { data }
async function handleJsonResponse(response) {
    if (!response.ok) {
        const text = await response.text().catch(() => null);
        // If it's a 401/403 or JWT error, auto-logout
        if (response.status === 401 || response.status === 403) {
            handleAuthError(text || 'Unauthorized');
        }
        if (text) handleAuthError(text);
        // Try to parse JSON error response from backend (e.g., {"error":"...", "timestamp":"..."})
        let errorMessage = text || response.statusText || 'Request failed';
        try {
            const parsed = JSON.parse(text);
            if (parsed.error) errorMessage = parsed.error;
            else if (parsed.message) errorMessage = parsed.message;
        } catch (e) { /* not JSON, use raw text */ }
        throw new Error(errorMessage);
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
        try {
            const loginUrl = `${API_BASE_URL}/auth/login`;
            console.log(`🔗 Attempting to connect to ${loginUrl}`);
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            console.log(`✅ Got response status: ${response.status}`);
            return handleJsonResponse(response);
        } catch (error) {
            console.error(`❌ Fetch error: ${error.message}`);
            console.error(`💡 Backend URL: ${API_BASE_URL}`);
            console.error(`💡 Full error object:`, error);
            throw new Error(`Failed to fetch: ${error.message}. Make sure backend is running on ${API_BASE_URL}`);
        }
    },

    logout: async () => {
        sessionStorage.clear();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        return { data: 'Logged out' };
    },

    // ==================== EXAM ENDPOINTS ====================

    getMyExams: async () => {
        const response = await fetch(`${API_BASE_URL}/exams`, { headers: getAuthHeaders() });
        if (!response.ok) {
            const text = await response.text().catch(() => null);
            if (response.status === 401 || response.status === 403) {
                handleAuthError(text || 'Unauthorized');
            }
            if (text) handleAuthError(text);
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

    createExam: async (examData) => {
        const response = await fetch(`${API_BASE_URL}/exams`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(examData),
        });
        return handleJsonResponse(response);
    },

    updateExam: async (examId, examData) => {
        const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(examData),
        });
        return handleJsonResponse(response);
    },

    deleteExam: async (examId) => {
        const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return handleJsonResponse(response);
    },

    clearPastExams: async () => {
        const response = await fetch(`${API_BASE_URL}/exams/past`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
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

    getInvigilators: async () => {
        const response = await fetch(`${API_BASE_URL}/auth/invigilators`, { headers: getAuthHeaders() });
        return handleJsonResponse(response);
    },

    // ==================== ADD/DELETE STUDENT TO/FROM EXAM ====================

    addStudentToExam: async (studentData) => {
        // First, create or verify the student exists
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                studentId: studentData.studentId,
                fullName: studentData.fullName,
                program: studentData.program,
                email: studentData.email
            }),
        });

        if (!response.ok) {
            const text = await response.text().catch(() => null);
            throw new Error(text || 'Failed to create student');
        }

        const student = await response.json();

        // Now add the student to the exam
        const addToExamResponse = await fetch(`${API_BASE_URL}/exams/${studentData.examId}/students/${student.id}`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        return handleJsonResponse(addToExamResponse);
    },

    removeStudentFromExam: async (examId, studentId) => {
        const response = await fetch(`${API_BASE_URL}/exams/${examId}/students/${studentId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return handleJsonResponse(response);
    },

    // ==================== UNDO ATTENDANCE (requires re-auth) ====================

    undoAttendance: async (examId, studentId, reason, username, password) => {
        // Re-authenticate first
        const authResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!authResponse.ok) {
            throw new Error('Authentication failed. Incorrect credentials.');
        }

        // Use the fresh token from re-auth for the delete call
        const authData = await authResponse.json();
        const freshToken = authData.token;

        const response = await fetch(`${API_BASE_URL}/attendance/undo`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${freshToken}`,
            },
            body: JSON.stringify({ examId, studentId, reason }),
        });
        return handleJsonResponse(response);
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
export const reportIncident = (examId, studentId, category, severity, description) =>
    apiService.reportIncident({ examId, studentId, category, severity, description });

// Attendance-related named exports
export const getAttendanceForExam = (examId) => apiService.getAttendanceForExam(examId);
// Mark attendance helper: accept parameters (examId, studentId, status, method, reason) and forward as object
export const markAttendance = (examId, studentId, status, method = 'MANUAL', reason = '') =>
    apiService.markAttendance({ examId, studentId, status, method, reason });
export const getAttendanceSummary = (examId) => apiService.getAttendanceSummary(examId);
export const getIncidentCount = (examId) => apiService.getIncidentCount(examId);

// Exam CRUD operations
export const createExam = (examData) => apiService.createExam(examData);
export const updateExam = (examId, examData) => apiService.updateExam(examId, examData);
export const deleteExam = (examId) => apiService.deleteExam(examId);

// Additional named exports used by librarian dashboard
export const getAllStudents = () => apiService.getAllStudents();
export const searchStudent = (studentId) => apiService.searchStudent(studentId);
export const downloadBarcode = (studentId) => apiService.downloadBarcode(studentId);

// Add/Remove student from exam
export const addStudentToExam = (studentData) => apiService.addStudentToExam(studentData);
export const removeStudentFromExam = (examId, studentId) => apiService.removeStudentFromExam(examId, studentId);

// Undo attendance (re-auth required)
export const undoAttendance = (examId, studentId, reason, username, password) =>
    apiService.undoAttendance(examId, studentId, reason, username, password);

// Clear all incidents for an exam (re-auth required)
export const clearAllIncidents = async (examId, username, password) => {
    // Re-authenticate to verify identity
    const authResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!authResponse.ok) {
        throw new Error('Authentication failed. Incorrect credentials.');
    }

    const authData = await authResponse.json();
    const freshToken = authData.token;

    const response = await fetch(`${API_BASE_URL}/incidents/exam/${examId}/clear`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${freshToken}`,
        },
    });
    return handleJsonResponse(response);
};

