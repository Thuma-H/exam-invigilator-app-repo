// src/components/Navbar.js - Modern navigation bar
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/apiService';
import '../styles/Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(
        JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}')
    );
    const role = sessionStorage.getItem('role') || localStorage.getItem('role');

    // Profile edit state
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [editName, setEditName] = useState(user.fullName || '');
    const [editEmail, setEditEmail] = useState(user.email || '');

    const handleLogout = async () => {
        try {
            await logout();
            sessionStorage.clear();
            localStorage.clear();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            sessionStorage.clear();
            localStorage.clear();
            navigate('/login');
        }
    };

    const handleDashboardClick = () => {
        if (role === 'LIBRARIAN') {
            navigate('/librarian');
        } else {
            navigate('/');
        }
    };

    const openProfileModal = () => {
        setEditName(user.fullName || '');
        setEditEmail(user.email || '');
        setShowProfileModal(true);
    };

    const handleProfileSave = () => {
        const updatedUser = {
            ...user,
            fullName: editName.trim() || user.fullName,
            email: editEmail.trim()
        };

        // Persist to both storages
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setShowProfileModal(false);
    };

    return (
        <>
            <nav className="modern-navbar">
                <div className="navbar-brand" onClick={handleDashboardClick}>
                    <div className="brand-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <div className="brand-text">
                        <span className="brand-title">ExamGuard</span>
                        <span className="brand-subtitle">Invigilation System</span>
                    </div>
                </div>

                <div className="navbar-actions">
                    {/* Schedule button for all authenticated users */}
                    <button
                        onClick={() => navigate('/exam-scheduler')}
                        className="scheduler-btn"
                        title="Manage Exam Schedule"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>Schedule</span>
                    </button>

                    {role === 'LIBRARIAN' && (
                        <button
                            onClick={() => navigate('/notifications')}
                            className="notifications-btn"
                            title="View Notifications"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Notifications</span>
                        </button>
                    )}

                    <div className="user-profile" onClick={openProfileModal} title="Click to edit profile">
                        <div className="user-avatar">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user.fullName || 'User'}</span>
                            <span className={`user-role role-${role?.toLowerCase()}`}>
                                {role || 'INVIGILATOR'}
                            </span>
                        </div>
                        <svg className="profile-edit-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>

                    <button onClick={handleLogout} className="logout-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 16L21 12M21 12L17 8M21 12H7M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>
            </nav>

            {/* Profile Edit Modal */}
            {showProfileModal && (
                <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="profile-modal-header">
                            <h3>Edit Profile</h3>
                            <button className="profile-modal-close" onClick={() => setShowProfileModal(false)}>✕</button>
                        </div>

                        <div className="profile-modal-avatar">
                            <div className="profile-avatar-large">
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className={`profile-role-badge role-${role?.toLowerCase()}`}>
                                {role || 'INVIGILATOR'}
                            </span>
                        </div>

                        <div className="profile-modal-body">
                            <div className="profile-field">
                                <label htmlFor="profile-name">Full Name</label>
                                <input
                                    id="profile-name"
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="profile-field">
                                <label htmlFor="profile-email">Email</label>
                                <input
                                    id="profile-email"
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                />
                            </div>

                            <div className="profile-field">
                                <label>Username</label>
                                <div className="profile-readonly">
                                    {user.username || 'N/A'}
                                </div>
                            </div>

                            <div className="profile-field">
                                <label>Role</label>
                                <div className="profile-readonly">
                                    {role || 'INVIGILATOR'}
                                </div>
                            </div>
                        </div>

                        <div className="profile-modal-actions">
                            <button className="profile-btn-cancel" onClick={() => setShowProfileModal(false)}>
                                Cancel
                            </button>
                            <button className="profile-btn-save" onClick={handleProfileSave}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Navbar;
