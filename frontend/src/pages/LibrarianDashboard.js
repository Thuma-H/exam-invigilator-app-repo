import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { API_CONFIG } from '../config/environment';
import './LibrarianDashboard.css';
import SpinningCrescents from '../components/SpinningCrescents';

function LibrarianDashboard() {
    const navigate = useNavigate();

    // Students state
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProgram, setFilterProgram] = useState('ALL');

    // Notifications state
    const [notifications, setNotifications] = useState([]);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchStudents();
        loadNotifications();

        const interval = setInterval(() => {
            loadNotifications();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const loadNotifications = () => {
        const stored = localStorage.getItem('notifications');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setNotifications(parsed);
            } catch (e) {
                setNotifications([]);
            }
        } else {
            setNotifications([]);
        }
    };

    const clearNotification = (notificationId) => {
        const updated = notifications.filter(n => n.id !== notificationId);
        setNotifications(updated);
        localStorage.setItem('notifications', JSON.stringify(updated));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
        localStorage.removeItem('notifications');
        showMessage('success', 'All notifications cleared');
    };

    const fetchStudents = async () => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const response = await axios.get(`${API_CONFIG.BASE_URL}/students`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStudents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            setLoading(false);
        }
    };

    const downloadBarcode = async (studentId) => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/barcode/download/${studentId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${studentId}_barcode.png`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            showMessage('success', `Barcode downloaded for ${studentId}`);
        } catch (error) {
            console.error('Error downloading barcode:', error);
            showMessage('error', 'Error downloading barcode');
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const programs = ['ALL', ...new Set(students.map(s => s.program))];

    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesProgram =
            filterProgram === 'ALL' || student.program === filterProgram;

        return matchesSearch && matchesProgram;
    });

    return (
        <>
            <Navbar />
            <div className="librarian-dashboard" style={{
                backgroundImage: `url('${process.env.PUBLIC_URL}/nextphases-swirl.png')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: '550px 550px',
                backgroundAttachment: 'fixed'
            }}>
                <SpinningCrescents />
                <div className="dashboard-content">
                    {/* Hero Section */}
                    <div className="page-hero">
                        <div className="hero-content">
                            <div className="hero-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="hero-text">
                                <h1>Librarian Dashboard</h1>
                                <p className="hero-subtitle">Student Barcode Management System</p>
                            </div>
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat-pill">
                                <span className="hero-stat-value">{students.length}</span>
                                <span className="hero-stat-label">Students</span>
                            </div>
                            <div className="hero-stat-pill">
                                <span className="hero-stat-value">{notifications.length}</span>
                                <span className="hero-stat-label">Notifications</span>
                            </div>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`lib-message-banner ${message.type}`}>
                            {message.type === 'success' ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                            )}
                            {message.text}
                        </div>
                    )}

                    {/* Notifications Section */}
                    {notifications.length > 0 && (
                        <div className="lib-notifications-card">
                            <div className="lib-notif-header">
                                <div className="lib-notif-title">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Recent Additions</span>
                                    <span className="lib-notif-count">{notifications.length}</span>
                                </div>
                                <button className="lib-notif-clear-all" onClick={clearAllNotifications}>
                                    Clear All
                                </button>
                            </div>
                            <div className="lib-notif-list">
                                {notifications.slice(0, 5).map((notif) => (
                                    <div key={notif.id} className="lib-notif-item">
                                        <div className="lib-notif-dot"></div>
                                        <div className="lib-notif-body">
                                            <p className="lib-notif-message">{notif.message}</p>
                                            <span className="lib-notif-time">{new Date(notif.timestamp).toLocaleString()}</span>
                                        </div>
                                        <button className="lib-notif-dismiss" onClick={() => clearNotification(notif.id)}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                                        </button>
                                    </div>
                                ))}
                                {notifications.length > 5 && (
                                    <button className="lib-notif-view-all" onClick={() => navigate('/notifications')}>
                                        View all {notifications.length} notifications
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Filters Card */}
                    <div className="lib-glass-card">
                        <div className="lib-filters">
                            <div className="lib-search-wrap">
                                <svg className="lib-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search by name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="lib-search-input"
                                />
                            </div>
                            <select
                                value={filterProgram}
                                onChange={(e) => setFilterProgram(e.target.value)}
                                className="lib-filter-select"
                            >
                                {programs.map(prog => (
                                    <option key={prog}>{prog}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Students Table */}
                    <div className="lib-glass-card lib-table-card">
                        <div className="lib-table-header">
                            <h2>Student Register</h2>
                            <span className="lib-table-count">{filteredStudents.length} students</span>
                        </div>
                        <div className="lib-table-wrap">
                            <table className="lib-table">
                                <thead>
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Full Name</th>
                                        <th>Program</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="lib-table-empty">
                                        <div className="lib-spinner"></div>
                                        <span>Loading students...</span>
                                    </td></tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr><td colSpan="5" className="lib-table-empty">No students found</td></tr>
                                ) : (
                                    filteredStudents.map(student => (
                                        <tr key={student.id}>
                                            <td><span className="lib-mono">{student.studentId}</span></td>
                                            <td className="lib-name">{student.fullName}</td>
                                            <td><span className="lib-program-badge">{student.program}</span></td>
                                            <td className="lib-email">{student.email || '—'}</td>
                                            <td>
                                                <button
                                                    className="lib-download-btn"
                                                    onClick={() => downloadBarcode(student.studentId)}
                                                    title="Download Barcode"
                                                >
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                    Download
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
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
}

export default LibrarianDashboard;