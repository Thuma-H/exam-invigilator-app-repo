// src/pages/Dashboard.js - Dashboard showing assigned exams
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getMyExams } from '../services/api';

function Dashboard() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            console.log('📋 Fetching exams from dashboard...');

            // Check if token exists
            const token = sessionStorage.getItem('token');
            console.log('🔑 Token present:', !!token);

            if (!token) {
                console.error('❌ No token found, redirecting to login...');
                navigate('/login');
                return;
            }

            const response = await getMyExams();
            console.log('✅ Exams fetched successfully:', response.data);

            setExams(response.data);
            setError(''); // Clear any previous errors
        } catch (err) {
            console.error('❌ Error fetching exams:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });

            setError('Failed to load exams: ' + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    if (loading) return <div><Navbar /><div className="loading">Loading exams...</div></div>;
    if (error) return <div><Navbar /><div className="error-message">{error}</div></div>;

    return (
        <div>
            <Navbar />
            <div className="container">
                <h2>My Assigned Exams</h2>

                {exams.length === 0 ? (
                    <div className="card">
                        <p>No exams assigned to you yet.</p>
                    </div>
                ) : (
                    <div className="grid">
                        {exams.map((exam) => (
                            <div key={exam.id} className="card">
                                <h3>{exam.courseCode} - {exam.courseName}</h3>
                                <p><strong>Date:</strong> {formatDate(exam.examDate)}</p>
                                <p><strong>Time:</strong> {formatTime(exam.startTime)}</p>
                                <p><strong>Duration:</strong> {exam.duration} minutes</p>
                                <p><strong>Venue:</strong> {exam.venue}</p>

                                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate(`/attendance/${exam.id}`)}
                                    >
                                        Mark Attendance
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => navigate(`/incident/${exam.id}`)}
                                    >
                                        Report Incident
                                    </button>
                                    <button
                                        className="btn btn-success"
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
    );
}

export default Dashboard;