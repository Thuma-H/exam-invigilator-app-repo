// src/pages/Dashboard.js - Invigilator Dashboard
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AddStudentModal from '../components/AddStudentModal';
import apiService, { addStudentToExam, removeStudentFromExam } from '../services/apiService';
import './Dashboard.css';
import SpinningCrescents from '../components/SpinningCrescents';

const Dashboard = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const navigate = useNavigate();

    const activeCount = exams.filter(e => e.status === 'ONGOING').length;

    const scrollToActiveExam = () => {
        if (activeCount === 0) return;
        const activeCard = document.querySelector('.exam-card-active');
        if (activeCard) {
            activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            activeCard.classList.add('exam-card-highlight');
            setTimeout(() => activeCard.classList.remove('exam-card-highlight'), 2000);
        }
    };

    useEffect(() => {
        loadExams();
    }, []);

    // Recompute statuses every 30 seconds so exams go ONGOING/COMPLETED in real time
    useEffect(() => {
        const interval = setInterval(() => {
            setExams(prev => prev.map(exam => ({
                ...exam,
                status: computeExamStatus(exam)
            })));
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' });
        }, 5000); // Extended to 5 seconds
    };

    const addNotification = (message, examName) => {
        console.log('💾 Saving notification to localStorage...');
        const notification = {
            id: Date.now(),
            message,
            examName,
            timestamp: Date.now()
        };
        console.log('📝 Notification object:', notification);

        const existing = JSON.parse(localStorage.getItem('notifications') || '[]');
        console.log('📦 Existing notifications:', existing);
        existing.unshift(notification);
        localStorage.setItem('notifications', JSON.stringify(existing));
        console.log('✅ Saved! Total notifications:', existing.length);
    };

    const handleAddStudent = async (studentData) => {
        console.log('🎯 [Dashboard] handleAddStudent called with:', studentData);
        try {
            console.log('📤 [Dashboard] Calling addStudentToExam API...');
            await addStudentToExam(studentData);
            console.log('✅ [Dashboard] API call successful');

            const examName = `${selectedExam.courseCode} - ${selectedExam.courseName}`;
            const message = `${studentData.fullName} was successfully added to ${examName}`;
            console.log('📝 [Dashboard] Notification message:', message);

            showToast(message, 'success');
            console.log('🔔 [Dashboard] Calling addNotification...');
            addNotification(message, examName);

            // Reload exams to update student count
            await loadExams();
        } catch (err) {
            console.error('❌ [Dashboard] Error in handleAddStudent:', err);
            showToast('Failed to add student: ' + err.message, 'error');
            throw err;
        }
    };

    const handleOpenAddModal = (exam) => {
        setSelectedExam(exam);
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
        setSelectedExam(null);
    };

    // Compute exam status from date, startTime, and duration
    const computeExamStatus = (exam) => {
        if (exam.status) return exam.status; // If backend already provides it

        try {
            const now = new Date();

            // Parse examDate and startTime
            // examDate = "2026-02-26", startTime = "09:00:00" or "09:00"
            const dateParts = exam.examDate;
            const timeParts = exam.startTime;

            if (!dateParts || !timeParts) return 'SCHEDULED';

            const examStart = new Date(`${dateParts}T${timeParts}`);
            const durationMs = (exam.duration || 120) * 60 * 1000; // default 2hrs
            const examEnd = new Date(examStart.getTime() + durationMs);

            if (now < examStart) return 'SCHEDULED';
            if (now >= examStart && now <= examEnd) return 'ONGOING';
            return 'COMPLETED';
        } catch (e) {
            console.error('Error computing exam status:', e);
            return 'SCHEDULED';
        }
    };

    const loadExams = async () => {
        try {
            setLoading(true);
            const response = await apiService.getMyExams();
            // apiService returns { data: ... } or raw array
            const payload = response && response.data ? response.data : response;
            const examList = Array.isArray(payload) ? payload : [];

            // Compute status and fetch student counts for each exam
            const examsWithStatus = await Promise.all(
                examList.map(async (exam) => {
                    let studentCount = exam.studentCount || 0;
                    try {
                        const studentsRes = await apiService.getStudentsForExam(exam.id);
                        const students = studentsRes?.data || studentsRes || [];
                        studentCount = Array.isArray(students) ? students.length : 0;
                    } catch (e) {
                        // Silently fail — just use 0
                    }
                    return {
                        ...exam,
                        status: computeExamStatus(exam),
                        studentCount
                    };
                })
            );

            setExams(examsWithStatus);
            setError('');
        } catch (err) {
            setError('Failed to load exams: ' + err.message);
            console.error('Error loading exams:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (examDate) => {
        if (!examDate) return 'No date set';
        try {
            // examDate comes as "2026-02-26" from the backend
            const date = new Date(examDate + 'T00:00:00');
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return examDate;
        }
    };

    const formatTime = (startTime, duration) => {
        if (!startTime) return 'No time set';
        try {
            // startTime comes as "09:00:00" or "09:00" from backend
            const [h, m] = startTime.split(':').map(Number);
            const start = new Date();
            start.setHours(h, m, 0, 0);

            const startStr = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            if (duration) {
                const end = new Date(start.getTime() + duration * 60 * 1000);
                const endStr = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                return `${startStr} - ${endStr}`;
            }
            return startStr;
        } catch {
            return startTime;
        }
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

            {/* Toast Notification */}
            {toast.show && (
                <div className={`toast-notification toast-${toast.type}`}>
                    <div className="toast-icon">
                        {toast.type === 'success' ? '✓' : '✗'}
                    </div>
                    <div className="toast-message">{toast.message}</div>
                </div>
            )}

            {/* Add Student Modal */}
            <AddStudentModal
                isOpen={showAddModal}
                onClose={handleCloseAddModal}
                onAddStudent={handleAddStudent}
                examId={selectedExam?.id}
                examName={selectedExam ? `${selectedExam.courseCode} - ${selectedExam.courseName}` : ''}
            />

            <div className="dashboard-container" style={{
                backgroundImage: `url('${process.env.PUBLIC_URL}/nextphases-swirl.png')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: '550px 550px',
                backgroundAttachment: 'fixed'
            }}>
                <SpinningCrescents />
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
                            <div
                                className={`stat-card ${activeCount > 0 ? 'stat-card-clickable stat-card-active' : ''}`}
                                onClick={scrollToActiveExam}
                                title={activeCount > 0 ? 'Click to jump to active exams' : ''}
                            >
                                <div className="stat-value">{activeCount}</div>
                                <div className="stat-label">Active Now</div>
                                {activeCount > 0 && <div className="stat-pulse"></div>}
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
                                    <div key={exam.id} className={`exam-card ${exam.status === 'ONGOING' ? 'exam-card-active' : ''}`}>
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
                                                <span className="detail-value">{formatDate(exam.examDate)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Time</span>
                                                <span className="detail-value">{formatTime(exam.startTime, exam.duration)}</span>
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
                                                className="btn-action btn-add-student"
                                                onClick={() => handleOpenAddModal(exam)}
                                                title="Add a new student to this exam"
                                            >
                                                Add Student
                                            </button>
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

                    {/* Sponsor Footer */}
                    <div className="sponsor-footer">
                        <img src={`${process.env.PUBLIC_URL}/nextphases-logo.png`} alt="NextPhases.dev" className="sponsor-logo" />
                        <div className="sponsor-text">
                            <span>Powered by</span>
                            <span className="sponsor-divider">•</span>
                            <span>NextPhases.dev</span>
                            <span className="sponsor-divider">•</span>
                            <em className="sponsor-heart">♥</em>
                        </div>
                        <span className="sponsor-year">© {new Date().getFullYear()} All rights reserved</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;