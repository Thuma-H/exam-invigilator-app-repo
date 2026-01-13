import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './LibrarianDashboard.css';

const LibrarianDashboard = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [pendingRequests, setPendingRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('pending'); // pending, search, all

    useEffect(() => {
        loadStudents();
        loadPendingRequests();
    }, []);

    useEffect(() => {
        handleSearch();
    }, [searchTerm, students]);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const data = await apiService.getAllStudents();
            // Normalize backend objects (backend uses fullName/program, may not include email)
            const normalized = Array.isArray(data) ? data.map(s => ({
                id: s.id,
                studentId: s.studentId || '',
                name: s.fullName || s.name || '',
                email: s.email || '',
                program: s.program || ''
            })) : [];
            console.debug('LibrarianDashboard: loaded students (normalized sample)', normalized.slice(0, 10));
            setStudents(normalized);
            setFilteredStudents(normalized);
            setError('');
        } catch (err) {
            setError('Failed to load students: ' + err.message);
            console.error('Error loading students:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadPendingRequests = () => {
        // Simulate pending requests - in production, this would come from backend
        const mockPendingRequests = [
            {
                id: 1,
                studentId: 'BCS25165336',
                studentName: 'Alice Johnson',
                email: 'alice.johnson@example.com',
                requestDate: '2025-01-13T10:30:00',
                status: 'pending'
            },
            {
                id: 2,
                studentId: 'BCS25165337',
                studentName: 'Bob Smith',
                email: 'bob.smith@example.com',
                requestDate: '2025-01-13T09:15:00',
                status: 'pending'
            }
        ];
        setPendingRequests(mockPendingRequests);
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setFilteredStudents(students);
            return;
        }

        const term = searchTerm.toLowerCase();
        let filtered = [];
        try {
            filtered = students.filter(student => {
                // Guard against missing fields and check both frontend/back-end names
                const studentId = (student && student.studentId) ? String(student.studentId).toLowerCase() : '';
                const name = (student && student.name) ? String(student.name).toLowerCase() : '';
                const fullName = (student && student.fullName) ? String(student.fullName).toLowerCase() : '';
                const email = (student && student.email) ? String(student.email).toLowerCase() : '';
                const program = (student && student.program) ? String(student.program).toLowerCase() : '';
                return studentId.includes(term) || name.includes(term) || fullName.includes(term) || email.includes(term) || program.includes(term);
            });
        } catch (err) {
            // Log detailed debug info to browser console so you can paste it here if the error persists
            console.error('Error during student search:', err, { searchTerm, studentsSample: students.slice(0, 10) });
            filtered = [];
        }

        setFilteredStudents(filtered);
    };

    const handleDownloadBarcode = async (studentId) => {
        try {
            setSuccessMessage('');
            setError('');

            const blob = await apiService.downloadBarcode(studentId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `barcode_${studentId}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setSuccessMessage(`Barcode downloaded for ${studentId}`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Failed to download barcode: ' + err.message);
            console.error('Error downloading barcode:', err);
        }
    };

    const handleMarkAsPrinted = (requestId) => {
        // Update the pending request status
        setPendingRequests(prev =>
            prev.map(req =>
                req.id === requestId
                    ? { ...req, status: 'printed' }
                    : req
            )
        );
        setSuccessMessage('Request marked as printed');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderPendingRequests = () => (
        <div className="pending-requests-section">
            <h3>📬 Pending ID Card Requests</h3>
            {pendingRequests.filter(req => req.status === 'pending').length === 0 ? (
                <div className="empty-state">
                    <p>✅ No pending requests</p>
                </div>
            ) : (
                <div className="requests-grid">
                    {pendingRequests
                        .filter(req => req.status === 'pending')
                        .map(request => (
                            <div key={request.id} className="request-card">
                                <div className="request-header">
                                    <span className="student-id-badge">{request.studentId}</span>
                                    <span className="request-time">{formatDate(request.requestDate)}</span>
                                </div>
                                <div className="request-body">
                                    <h4>{request.studentName}</h4>
                                    <p className="student-email">{request.email}</p>
                                </div>
                                <div className="request-actions">
                                    <button
                                        className="btn-download"
                                        onClick={() => handleDownloadBarcode(request.studentId)}
                                    >
                                        📥 Download Barcode
                                    </button>
                                    <button
                                        className="btn-mark-printed"
                                        onClick={() => handleMarkAsPrinted(request.id)}
                                    >
                                        ✅ Mark as Printed
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );

    const renderSearchSection = () => (
        <div className="search-section">
            <h3>🔍 Search Students</h3>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by Student ID, Name, or Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button
                    className="btn-clear-search"
                    onClick={() => setSearchTerm('')}
                    disabled={!searchTerm}
                >
                    Clear
                </button>
            </div>

            {searchTerm && (
                <p className="search-results-info">
                    Found {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                </p>
            )}

            <div className="students-table-container">
                <table className="students-table">
                    <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredStudents.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="no-results">
                                {searchTerm ? 'No students found' : 'No students available'}
                            </td>
                        </tr>
                    ) : (
                        filteredStudents.map(student => (
                            <tr key={student.id}>
                                <td>
                                    <span className="student-id-cell">{student.studentId}</span>
                                </td>
                                <td>{student.name}</td>
                                <td>{student.email}</td>
                                <td>
                                    <button
                                        className="btn-download-small"
                                        onClick={() => handleDownloadBarcode(student.studentId)}
                                        title="Download Barcode"
                                    >
                                        📥 Barcode
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAllStudents = () => (
        <div className="all-students-section">
            <h3>👥 All Registered Students ({students.length})</h3>
            <div className="students-table-container">
                <table className="students-table">
                    <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {students.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="no-results">No students registered</td>
                        </tr>
                    ) : (
                        students.map(student => (
                            <tr key={student.id}>
                                <td>
                                    <span className="student-id-cell">{student.studentId}</span>
                                </td>
                                <td>{student.name}</td>
                                <td>{student.email}</td>
                                <td>
                                    <button
                                        className="btn-download-small"
                                        onClick={() => handleDownloadBarcode(student.studentId)}
                                        title="Download Barcode"
                                    >
                                        📥 Barcode
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="librarian-dashboard">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading students...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="librarian-dashboard">
            <div className="dashboard-header">
                <button className="btn-back" onClick={() => navigate('/')}>
                    ← Back to Dashboard
                </button>
                <h1>📚 Librarian Dashboard</h1>
            </div>

            {error && (
                <div className="alert alert-error">
                    ❌ {error}
                </div>
            )}

            {successMessage && (
                <div className="alert alert-success">
                    ✅ {successMessage}
                </div>
            )}

            <div className="tabs-container">
                <button
                    className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    📬 Pending Requests
                    {pendingRequests.filter(r => r.status === 'pending').length > 0 && (
                        <span className="badge">{pendingRequests.filter(r => r.status === 'pending').length}</span>
                    )}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
                    onClick={() => setActiveTab('search')}
                >
                    🔍 Search Students
                </button>
                <button
                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    👥 All Students ({students.length})
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'pending' && renderPendingRequests()}
                {activeTab === 'search' && renderSearchSection()}
                {activeTab === 'all' && renderAllStudents()}
            </div>
        </div>
    );
};

export default LibrarianDashboard;

