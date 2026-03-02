// src/pages/IncidentPage.js - Report exam incidents (Glass Theme)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getExamById, getStudentsForExam, reportIncident, getIncidentsForExam, clearAllIncidents } from '../services/apiService';
import './IncidentPage.css';
import SpinningCrescents from '../components/SpinningCrescents';

function IncidentPage() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
    const [exam, setExam] = useState(null);
    const [students, setStudents] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [studentId, setStudentId] = useState('');
    const [category, setCategory] = useState('CHEATING');
    const [severity, setSeverity] = useState('MEDIUM');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Toast
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    // Clear All Modal
    const [showClearModal, setShowClearModal] = useState(false);
    const [clearUsername, setClearUsername] = useState('');
    const [clearPassword, setClearPassword] = useState('');
    const [clearError, setClearError] = useState('');
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        fetchData();
    }, [examId]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
    };

    const fetchData = async () => {
        try {
            const examRes = await getExamById(examId);
            setExam(examRes.data);

            const studentsRes = await getStudentsForExam(examId);
            setStudents(studentsRes.data);

            const incidentsRes = await getIncidentsForExam(examId);
            setIncidents(incidentsRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Quick report — 1-tap preset incidents
    const quickReport = async (presetCategory, presetSeverity, presetDesc) => {
        setSubmitting(true);
        try {
            await reportIncident(examId, studentId || null, presetCategory, presetSeverity, presetDesc);
            showToast(`${presetCategory.replace('_', ' ')} reported`, 'success');
            setStudentId('');
            fetchData();
        } catch (err) {
            showToast(err.message || 'Failed to report incident', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await reportIncident(examId, studentId || null, category, severity, description || `${getCategoryLabel(category)} incident reported`);
            showToast('Incident reported successfully', 'success');

            // Reset form
            setStudentId('');
            setCategory('CHEATING');
            setSeverity('MEDIUM');
            setDescription('');

            // Refresh incidents list
            fetchData();
        } catch (err) {
            showToast(err.message || 'Failed to report incident', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCategoryLabel = (cat) => {
        const labels = {
            CHEATING: 'Cheating',
            HEALTH_EMERGENCY: 'Health Emergency',
            DISRUPTION: 'Disruption',
            OTHER: 'Other'
        };
        return labels[cat] || cat;
    };

    const handleCloseClearModal = () => {
        setShowClearModal(false);
        setClearUsername('');
        setClearPassword('');
        setClearError('');
    };

    const handleClearAll = async () => {
        if (!clearUsername || !clearPassword) {
            setClearError('Please enter both username and password.');
            return;
        }
        setClearing(true);
        setClearError('');
        try {
            await clearAllIncidents(examId, clearUsername, clearPassword);
            showToast('All reports cleared successfully', 'success');
            handleCloseClearModal();
            fetchData();
        } catch (err) {
            setClearError(err.message || 'Failed to clear reports. Check your credentials.');
        } finally {
            setClearing(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="incident-container">
                    <div className="incident-loading">
                        <div className="spinner"></div>
                        <p>Loading incident data...</p>
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
                <div className={`incident-toast incident-toast-${toast.type}`}>
                    <div className="incident-toast-icon">
                        {toast.type === 'success' ? '✓' : '✗'}
                    </div>
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="incident-container" style={{
                backgroundImage: `url('${process.env.PUBLIC_URL}/nextphases-swirl.png')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: '550px 550px',
                backgroundAttachment: 'fixed'
            }}>
                <SpinningCrescents />
                <div className="incident-content">
                    {/* Back Button */}
                    <button onClick={() => navigate('/')} className="incident-btn-back">
                        ← Back to Dashboard
                    </button>

                    {/* Exam Info Header */}
                    {exam && (
                        <div className="incident-exam-card">
                            <div className="incident-exam-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                            </div>
                            <div className="incident-exam-info">
                                <h2>{exam.courseCode} - {exam.courseName}</h2>
                                <div className="incident-exam-meta">
                                    <span>Venue: {exam.venue}</span>
                                    <span>Date: {new Date(exam.examDate).toLocaleDateString()}</span>
                                    <span>Incidents: {incidents.length}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Two Column Layout */}
                    <div className="incident-layout">
                        {/* Report Form */}
                        <div className="incident-glass-card incident-form-card">
                            <div className="incident-card-title">
                                <div className="title-icon title-icon-report">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 20h9"/>
                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                    </svg>
                                </div>
                                <h3>Report Incident</h3>
                            </div>

                            {/* Student Selector — shared across quick + custom */}
                            <div className="incident-field" style={{ marginBottom: '1rem' }}>
                                <label>
                                    Student Involved
                                    <span className="optional-tag">(Optional)</span>
                                </label>
                                <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                                    <option value="">General Incident — No specific student</option>
                                    {students.map(student => (
                                        <option key={student.id} value={student.id}>
                                            {student.studentId} — {student.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Quick Report — 1 tap */}
                            <div className="quick-report-section">
                                <label className="quick-report-label">Quick Report</label>
                                <div className="quick-report-grid">
                                    <button
                                        type="button"
                                        className="quick-report-btn qr-cheating"
                                        disabled={submitting}
                                        onClick={() => quickReport('CHEATING', 'HIGH', 'Cheating incident observed')}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        Cheating
                                    </button>
                                    <button
                                        type="button"
                                        className="quick-report-btn qr-disruption"
                                        disabled={submitting}
                                        onClick={() => quickReport('DISRUPTION', 'MEDIUM', 'Disruptive behaviour reported')}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                                        Disruption
                                    </button>
                                    <button
                                        type="button"
                                        className="quick-report-btn qr-health"
                                        disabled={submitting}
                                        onClick={() => quickReport('HEALTH_EMERGENCY', 'HIGH', 'Health emergency — medical attention needed')}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                                        Health
                                    </button>
                                    <button
                                        type="button"
                                        className="quick-report-btn qr-other"
                                        disabled={submitting}
                                        onClick={() => quickReport('OTHER', 'LOW', 'Other incident reported')}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                        Other
                                    </button>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="incident-divider">
                                <span>or custom report</span>
                            </div>

                            {/* Custom Report Form — compact */}
                            <form onSubmit={handleSubmit} className="incident-form">
                                {/* Category + Severity on same row */}
                                <div className="incident-row">
                                    <div className="incident-field" style={{ flex: 1 }}>
                                        <label>Category</label>
                                        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                                            <option value="CHEATING">Cheating</option>
                                            <option value="HEALTH_EMERGENCY">Health Emergency</option>
                                            <option value="DISRUPTION">Disruption</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div className="incident-field" style={{ flex: 1 }}>
                                        <label>Severity</label>
                                        <div className="severity-chips severity-chips-compact">
                                            <button type="button" className={`severity-chip severity-chip-low ${severity === 'LOW' ? 'active' : ''}`} onClick={() => setSeverity('LOW')}>L</button>
                                            <button type="button" className={`severity-chip severity-chip-medium ${severity === 'MEDIUM' ? 'active' : ''}`} onClick={() => setSeverity('MEDIUM')}>M</button>
                                            <button type="button" className={`severity-chip severity-chip-high ${severity === 'HIGH' ? 'active' : ''}`} onClick={() => setSeverity('HIGH')}>H</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Description — optional */}
                                <div className="incident-field">
                                    <label>
                                        Description
                                        <span className="optional-tag">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Brief details..."
                                        rows="2"
                                    />
                                </div>

                                {/* Submit */}
                                <button type="submit" className="incident-submit-btn" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </form>
                        </div>

                        {/* Incident History */}
                        <div className="incident-glass-card incident-history-card">
                            <div className="incident-card-title" style={{ justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div className="title-icon title-icon-history">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"/>
                                            <polyline points="12 6 12 12 16 14"/>
                                        </svg>
                                    </div>
                                    <h3>Reported Incidents ({incidents.length})</h3>
                                </div>
                                {incidents.length > 0 && (
                                    <button
                                        className="clear-all-btn"
                                        onClick={() => setShowClearModal(true)}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        </svg>
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {incidents.length === 0 ? (
                                <div className="incident-history-empty">
                                    <div className="empty-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                    </div>
                                    <p>No incidents reported</p>
                                    <p className="empty-hint">All clear for this exam session</p>
                                </div>
                            ) : (
                                <div className="incident-list">
                                    {incidents.map((incident) => (
                                        <div
                                            key={incident.id}
                                            className={`incident-item severity-${incident.severity.toLowerCase()}`}
                                        >
                                            <div className="incident-item-header">
                                                <span className="incident-category">
                                                    {getCategoryLabel(incident.category)}
                                                </span>
                                                <span className={`incident-severity-badge badge-${incident.severity.toLowerCase()}`}>
                                                    {incident.severity}
                                                </span>
                                            </div>
                                            <p className="incident-item-desc">
                                                {incident.description}
                                            </p>
                                            <div className="incident-item-footer">
                                                {incident.student ? (
                                                    <div className="incident-student-info">
                                                        <span className="incident-student-tag">
                                                            {incident.student.studentId}
                                                        </span>
                                                        <span className="incident-student-name-tag">
                                                            {incident.student.fullName}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>
                                                        General incident
                                                    </span>
                                                )}
                                                <span>{formatTime(incident.reportedAt)}</span>
                                            </div>
                                            <div className="incident-logged-by">
                                                Logged by: {incident.reportedBy?.fullName || incident.invigilator?.fullName || user.fullName || 'Invigilator'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Clear All Reports Modal */}
            {showClearModal && (
                <div className="clear-modal-overlay" onClick={handleCloseClearModal}>
                    <div className="clear-modal-glass" onClick={(e) => e.stopPropagation()}>
                        <div className="clear-modal-header">
                            <div className="clear-modal-icon-danger">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                            </div>
                            <h3>Clear All Reports</h3>
                            <p>This action is irreversible. Verify your identity to proceed.</p>
                        </div>

                        {clearError && (
                            <div className="clear-modal-error">{clearError}</div>
                        )}

                        <div className="clear-modal-field">
                            <label>Username</label>
                            <input
                                type="text"
                                value={clearUsername}
                                onChange={(e) => setClearUsername(e.target.value)}
                                placeholder="Enter your username"
                                autoFocus
                            />
                        </div>
                        <div className="clear-modal-field">
                            <label>Password</label>
                            <input
                                type="password"
                                value={clearPassword}
                                onChange={(e) => setClearPassword(e.target.value)}
                                placeholder="Enter your password"
                                onKeyDown={(e) => e.key === 'Enter' && handleClearAll()}
                            />
                        </div>

                        <div className="clear-modal-actions">
                            <button className="clear-modal-cancel" onClick={handleCloseClearModal}>
                                Cancel
                            </button>
                            <button
                                className="clear-modal-confirm"
                                onClick={handleClearAll}
                                disabled={clearing}
                            >
                                {clearing ? 'Verifying...' : 'Confirm & Clear All'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default IncidentPage;

