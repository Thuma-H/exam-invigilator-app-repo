// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './Dashboard.css';

const Dashboard = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    useEffect(() => {
        loadExams();
    }, []);

    const loadExams = async () => {
        try {
            setLoading(true);
            const data = await apiService.getMyExams();
            setExams(data);
            setError('');
        } catch (err) {
            setError('Failed to load exams: ' + err.message);
            console.error('Error loading exams:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading">Loading exams...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>📋 Exam Invigilator Dashboard</h1>
                    <p className="welcome-text">Welcome, <strong>{username}</strong></p>
                </div>
                <div className="header-actions">
                    {/* NEW: Librarian Dashboard Button */}
                    <button
                        className="btn-librarian"
                        onClick={() => navigate('/librarian')}
                    >
                        📚 Librarian
                    </button>
                    <button className="btn-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            {error && (
                <div className="error-message">
                    ❌ {error}
                </div>
            )}

            <div className="exams-section">
                <h2>My Assigned Exams</h2>

                {exams.length === 0 ? (
                    <div className="no-exams">
                        <p>No exams assigned at this time.</p>
                    </div>
                ) : (
                    <div className="exams-grid">
                        {exams.map((exam) => (
                            <div key={exam.id} className="exam-card">
                                <div className="exam-header">
                                    <h3>{exam.courseCode}</h3>
                                    <span className={`exam-status ${exam.status}`}>
                    {exam.status}
                  </span>
                                </div>

                                <div className="exam-details">
                                    <p className="exam-name">{exam.courseName}</p>
                                    <div className="exam-info">
                                        <div className="info-item">
                                            <span className="icon">📅</span>
                                            <span>{formatDateTime(exam.dateTime)}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="icon">📍</span>
                                            <span>{exam.venue}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="icon">👥</span>
                                            <span>{exam.studentCount || 0} Students</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="exam-actions">
                                    <button
                                        className="btn-action btn-attendance"
                                        onClick={() => navigate(`/attendance/${exam.id}`)}
                                    >
                                        ✅ Mark Attendance
                                    </button>
                                    <button
                                        className="btn-action btn-incident"
                                        onClick={() => navigate(`/incident/${exam.id}`)}
                                    >
                                        🚨 Report Incident
                                    </button>
                                    <button
                                        className="btn-action btn-reports"
                                        onClick={() => navigate(`/reports/${exam.id}`)}
                                    >
                                        📊 View Reports
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;