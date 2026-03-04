import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SpinningCrescents from '../components/SpinningCrescents';
import './NotificationsPage.css';

function NotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = () => {
        // Load from localStorage
        console.log('🔍 [NotificationsPage] Loading notifications from localStorage...');
        const stored = localStorage.getItem('notifications');
        console.log('📦 [NotificationsPage] Raw stored data:', stored);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                console.log('✅ [NotificationsPage] Parsed notifications:', parsed);
                console.log('📊 [NotificationsPage] Number of notifications:', parsed.length);
                setNotifications(parsed);
            } catch (e) {
                console.error('❌ [NotificationsPage] Error loading notifications:', e);
            }
        } else {
            console.log('⚠️ [NotificationsPage] No notifications found in localStorage');
        }
    };

    const clearAllNotifications = () => {
        localStorage.removeItem('notifications');
        setNotifications([]);
    };

    const deleteNotification = (id) => {
        const updated = notifications.filter(n => n.id !== id);
        setNotifications(updated);
        localStorage.setItem('notifications', JSON.stringify(updated));
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <Navbar />
            <div className="notifications-page">
                <div className="blurred-watermark" style={{ backgroundImage: `url('${process.env.PUBLIC_URL}/nextphases-swirl.png')` }} />
                <SpinningCrescents />
                <div className="page-content">
                    <div className="page-hero">
                        <div className="hero-content">
                            <div className="hero-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="hero-text">
                                <h1>Notifications</h1>
                                <p className="hero-subtitle">Student addition updates and system alerts</p>
                            </div>
                        </div>
                        {notifications.length > 0 && (
                            <button
                                className="btn-clear-all"
                                onClick={clearAllNotifications}
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="notifications-content">
                        {notifications.length === 0 ? (
                            <div className="no-notifications">
                                <div className="no-notifications-icon">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <h3>No notifications yet</h3>
                                <p>You'll be notified when new students are added to exams</p>
                            </div>
                        ) : (
                            <div className="notifications-list">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className="notification-card">
                                        <div className="notification-icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-message">
                                                {notification.message}
                                            </div>
                                            <div className="notification-meta">
                                                <span className="notification-time">
                                                    {formatDate(notification.timestamp)}
                                                </span>
                                                {notification.examName && (
                                                    <span className="notification-exam">
                                                        Exam: {notification.examName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            className="notification-delete"
                                            onClick={() => deleteNotification(notification.id)}
                                            title="Delete notification"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default NotificationsPage;
