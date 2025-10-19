// src/pages/ReportsPage.js - View attendance and incident reports
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getExamById, getAttendanceSummary, getIncidentCount } from '../services/api';

function ReportsPage() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [summary, setSummary] = useState(null);
    const [incidentCount, setIncidentCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [examId]);

    const fetchData = async () => {
        try {
            const examRes = await getExamById(examId);
            setExam(examRes.data);

            const summaryRes = await getAttendanceSummary(examId);
            setSummary(summaryRes.data);

            const countRes = await getIncidentCount(examId);
            setIncidentCount(countRes.data);
        } catch (err) {
            console.error('Error fetching reports:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div><Navbar /><div className="loading">Loading reports...</div></div>;

    return (
        <div>
            <Navbar />
            <div className="container">
                <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginBottom: '1rem' }}>
                    ← Back to Dashboard
                </button>

                {exam && (
                    <div className="card">
                        <h2>{exam.courseCode} - {exam.courseName}</h2>
                        <p><strong>Venue:</strong> {exam.venue}</p>
                        <p><strong>Date:</strong> {new Date(exam.examDate).toLocaleDateString()}</p>
                    </div>
                )}

                {summary && (
                    <div className="card">
                        <h3>Attendance Summary</h3>
                        <div className="grid">
                            <div style={{ background: '#d4edda', padding: '1rem', borderRadius: '4px', textAlign: 'center' }}>
                                <h4>Total Students</h4>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                                    {summary.totalStudents}
                                </p>
                            </div>

                            <div style={{ background: '#d1ecf1', padding: '1rem', borderRadius: '4px', textAlign: 'center' }}>
                                <h4>Present</h4>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#155724' }}>
                                    {summary.presentCount}
                                </p>
                            </div>

                            <div style={{ background: '#f8d7da', padding: '1rem', borderRadius: '4px', textAlign: 'center' }}>
                                <h4>Absent</h4>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#721c24' }}>
                                    {summary.absentCount}
                                </p>
                            </div>

                            <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '4px', textAlign: 'center' }}>
                                <h4>Late</h4>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#856404' }}>
                                    {summary.lateCount}
                                </p>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#e7f3ff', borderRadius: '4px' }}>
                            <h4>Attendance Rate</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ flex: 1, height: '30px', background: '#ddd', borderRadius: '15px', overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            width: `${summary.attendancePercentage}%`,
                                            height: '100%',
                                            background: summary.attendancePercentage >= 75 ? '#27ae60' : summary.attendancePercentage >= 50 ? '#f39c12' : '#e74c3c',
                                            transition: 'width 0.3s'
                                        }}
                                    />
                                </div>
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {summary.attendancePercentage.toFixed(1)}%
                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="card">
                    <h3>Incidents Summary</h3>
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <h4>Total Incidents Reported</h4>
                        <p style={{ fontSize: '3rem', fontWeight: 'bold', color: incidentCount > 0 ? '#e74c3c' : '#27ae60' }}>
                            {incidentCount}
                        </p>
                        {incidentCount > 0 && (
                            <button
                                className="btn btn-danger"
                                onClick={() => navigate(`/incident/${examId}`)}
                            >
                                View Incident Details
                            </button>
                        )}
                    </div>
                </div>

                <div className="card">
                    <h3>Actions</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/attendance/${examId}`)}
                        >
                            Mark Attendance
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={() => navigate(`/incident/${examId}`)}
                        >
                            Report Incident
                        </button>
                        <button
                            className="btn btn-success"
                            onClick={() => window.print()}
                        >
                            Print Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReportsPage;