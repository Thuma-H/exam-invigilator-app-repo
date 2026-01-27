// src/pages/Dashboard.js - Invigilator Dashboard
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import apiService from '../services/apiService';
import './Dashboard.css';

const Dashboard = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadExams();
    }, []);

    const loadExams = async () => {
        try {
            setLoading(true);
            const response = await apiService.getMyExams();
            // apiService returns { data: ... }
            const payload = response && response.data ? response.data : response;
            setExams(Array.isArray(payload) ? payload : []);
            setError('');
        } catch (err) {
            setError('Failed to load exams: ' + err.message);
            console.error('Error loading exams:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="dashboard-container">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading exams...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-content">
                    <div className="page-hero">
                        <div className="hero-content">
                            <div className="hero-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <div className="hero-text">
                                <h1>Invigilator Dashboard</h1>
                                <p className="hero-subtitle">Monitor and manage exam sessions in real-time</p>
                            </div>
                        </div>
                        <div className="hero-stats">
                            <div className="stat-card">
                                <div className="stat-value">{exams.length}</div>
                                <div className="stat-label">Assigned Exams</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">
                                    {exams.filter(e => e.status === 'ONGOING').length}
                                </div>
                                <div className="stat-label">Active Now</div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="error-banner">
                            <span className="error-icon">⚠</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="exams-section">
                        <h2>My Assigned Exams</h2>

                        {exams.length === 0 ? (
                            <div className="no-exams">
                                <div className="no-exams-icon">📅</div>
                                <p>No exams assigned at this time.</p>
                                <span className="no-exams-hint">Check back later or contact your supervisor.</span>
                            </div>
                        ) : (
                            <div className="exams-grid">
                                {exams.map((exam) => (
                                    <div key={exam.id} className="exam-card">
                                        <div className="exam-header">
                                            <div className="exam-title">
                                                <h3>{exam.courseCode}</h3>
                                                <p className="course-name">{exam.courseName}</p>
                                            </div>
                                            <span className={`exam-status status-${exam.status?.toLowerCase()}`}>
                                                {exam.status}
                                            </span>
                                        </div>

                                        <div className="exam-details">
                                            <div className="detail-item">
                                                <span className="detail-label">Date</span>
                                                <span className="detail-value">{formatDate(exam.dateTime)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Time</span>
                                                <span className="detail-value">{formatTime(exam.dateTime)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Venue</span>
                                                <span className="detail-value">{exam.venue}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Students</span>
                                                <span className="detail-value">{exam.studentCount || 0}</span>
                                            </div>
                                        </div>

                                        <div className="exam-actions">
                                            <button
                                                className="btn-action btn-attendance"
                                                onClick={() => navigate(`/attendance/${exam.id}`)}
                                            >
                                                Mark Attendance
                                            </button>
                                            <button
                                                className="btn-action btn-incident"
                                                onClick={() => navigate(`/incident/${exam.id}`)}
                                            >
                                                Report Incident
                                            </button>
                                            <button
                                                className="btn-action btn-reports"
                                                onClick={() => navigate(`/reports/${exam.id}`)}
                                            >
                                                View Reports
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;