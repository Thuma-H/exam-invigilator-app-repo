// src/pages/ReportsPage.js - View attendance and incident reports (Glass Theme)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getExamById, getAttendanceSummary, getIncidentCount } from '../services/apiService';
import './ReportsPage.css';
import SpinningCrescents from '../components/SpinningCrescents';

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

    const exportReport = () => {
        const report = {
            examInfo: {
                code: exam.courseCode,
                name: exam.courseName,
                date: exam.examDate,
                venue: exam.venue,
                duration: exam.duration
            },
            attendance: {
                totalStudents: summary.totalStudents,
                present: summary.presentCount,
                absent: summary.absentCount,
                late: summary.lateCount,
                attendanceRate: summary.attendancePercentage.toFixed(1) + '%'
            },
            incidents: {
                total: incidentCount,
                details: 'View in system for full incident reports'
            },
            exportedAt: new Date().toISOString(),
            exportedBy: JSON.parse(sessionStorage.getItem('user')).fullName
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Exam_Report_${exam.courseCode}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // SVG circle progress calculations
    const getCircleProgress = (percentage) => {
        const radius = 65;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        return { circumference, offset };
    };

    const getRateClass = (pct) => {
        if (pct >= 75) return 'rate-high';
        if (pct >= 50) return 'rate-mid';
        return 'rate-low';
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="reports-container">
                    <div className="reports-loading">
                        <div className="spinner"></div>
                        <p>Loading reports...</p>
                    </div>
                </div>
            </>
        );
    }

    const attendancePct = summary ? summary.attendancePercentage : 0;
    const { circumference, offset } = getCircleProgress(attendancePct);

    return (
        <>
            <Navbar />
            <div className="reports-container">
                <div className="blurred-watermark" style={{ backgroundImage: `url('${process.env.PUBLIC_URL}/nextphases-swirl.png')` }} />
                <SpinningCrescents />
                <div className="reports-content">
                    {/* Back Button */}
                    <button onClick={() => navigate('/')} className="reports-btn-back">
                        ← Back to Dashboard
                    </button>

                    {/* Exam Hero */}
                    {exam && (
                        <div className="reports-hero">
                            <div className="reports-hero-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                    <polyline points="10 9 9 9 8 9"/>
                                </svg>
                            </div>
                            <div className="reports-hero-info">
                                <h2>{exam.courseCode} - {exam.courseName}</h2>
                                <div className="reports-hero-meta">
                                    <span>Venue: {exam.venue}</span>
                                    <span>Date: {new Date(exam.examDate).toLocaleDateString()}</span>
                                    {exam.duration && <span>Duration: {exam.duration} min</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards Row */}
                    {summary && (
                        <div className="reports-stats-grid">
                            <div className="report-stat">
                                <div className="report-stat-icon stat-icon-total">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                </div>
                                <div className="report-stat-value">{summary.totalStudents}</div>
                                <div className="report-stat-label">Total Students</div>
                            </div>
                            <div className="report-stat">
                                <div className="report-stat-icon stat-icon-present">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                    </svg>
                                </div>
                                <div className="report-stat-value">{summary.presentCount}</div>
                                <div className="report-stat-label">Present</div>
                            </div>
                            <div className="report-stat">
                                <div className="report-stat-icon stat-icon-absent">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="15" y1="9" x2="9" y2="15"/>
                                        <line x1="9" y1="9" x2="15" y2="15"/>
                                    </svg>
                                </div>
                                <div className="report-stat-value">{summary.absentCount}</div>
                                <div className="report-stat-label">Absent</div>
                            </div>
                            <div className="report-stat">
                                <div className="report-stat-icon stat-icon-late">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                </div>
                                <div className="report-stat-value">{summary.lateCount}</div>
                                <div className="report-stat-label">Late</div>
                            </div>
                        </div>
                    )}

                    {/* Two Column — Rate + Incidents */}
                    <div className="reports-layout">
                        {/* Attendance Rate */}
                        <div className="reports-glass-card reports-rate-card">
                            <div className="reports-card-title">
                                <div className="card-title-icon card-title-icon-rate">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="20" x2="18" y2="10"/>
                                        <line x1="12" y1="20" x2="12" y2="4"/>
                                        <line x1="6" y1="20" x2="6" y2="14"/>
                                    </svg>
                                </div>
                                <h3>Attendance Rate</h3>
                            </div>

                            {summary && (
                                <div className="attendance-rate-wrapper">
                                    {/* Circular Progress */}
                                    <div className="rate-circle">
                                        <svg viewBox="0 0 160 160">
                                            <circle className="rate-circle-bg" cx="80" cy="80" r="65"/>
                                            <circle
                                                className={`rate-circle-fill ${getRateClass(attendancePct)}`}
                                                cx="80" cy="80" r="65"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={offset}
                                            />
                                        </svg>
                                        <div className="rate-text">
                                            <div className="rate-percentage">{attendancePct.toFixed(1)}%</div>
                                            <div className="rate-label">Attendance</div>
                                        </div>
                                    </div>

                                    {/* Linear Bar */}
                                    <div className="rate-bar-visual">
                                        <div
                                            className={`rate-bar-fill ${getRateClass(attendancePct)}`}
                                            style={{ width: `${attendancePct}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Incidents Summary */}
                        <div className="reports-glass-card reports-incident-card">
                            <div className="reports-card-title">
                                <div className="card-title-icon card-title-icon-incident">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                        <line x1="12" y1="9" x2="12" y2="13"/>
                                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                                    </svg>
                                </div>
                                <h3>Incidents Summary</h3>
                            </div>

                            <div className="incidents-summary-center">
                                <div className={`incidents-count-circle ${incidentCount > 0 ? 'has-incidents' : 'no-incidents'}`}>
                                    <span className={`incidents-count-number ${incidentCount > 0 ? 'has-incidents' : 'no-incidents'}`}>
                                        {incidentCount}
                                    </span>
                                </div>
                                <p className="incidents-summary-label">
                                    {incidentCount === 0
                                        ? 'No incidents reported for this exam'
                                        : `${incidentCount} incident${incidentCount > 1 ? 's' : ''} reported`
                                    }
                                </p>
                                {incidentCount > 0 && (
                                    <button
                                        className="btn-view-incidents"
                                        onClick={() => navigate(`/incident/${examId}`)}
                                    >
                                        View Incident Details
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="reports-glass-card reports-actions-card">
                        <div className="reports-card-title">
                            <div className="card-title-icon card-title-icon-rate">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="7" height="7"/>
                                    <rect x="14" y="3" width="7" height="7"/>
                                    <rect x="14" y="14" width="7" height="7"/>
                                    <rect x="3" y="14" width="7" height="7"/>
                                </svg>
                            </div>
                            <h3>Quick Actions</h3>
                        </div>

                        <div className="reports-actions-bar">
                            <button
                                className="reports-action-btn btn-action-attendance"
                                onClick={() => navigate(`/attendance/${examId}`)}
                            >
                                Mark Attendance
                            </button>
                            <button
                                className="reports-action-btn btn-action-download"
                                onClick={exportReport}
                            >
                                Download Report
                            </button>
                            <button
                                className="reports-action-btn btn-action-incident"
                                onClick={() => navigate(`/incident/${examId}`)}
                            >
                                Report Incident
                            </button>
                            <button
                                className="reports-action-btn btn-action-print"
                                onClick={() => window.print()}
                            >
                                Print Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ReportsPage;

