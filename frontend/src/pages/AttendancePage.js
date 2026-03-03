// src/pages/AttendancePage.js - Mark student attendance
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BarcodeScanner from '../components/BarcodeScanner';
import { getExamById, getStudentsForExam, getAttendanceForExam, markAttendance, removeStudentFromExam, undoAttendance } from '../services/apiService';
import './AttendancePage.css';
import SpinningCrescents from '../components/SpinningCrescents';
import ExamTimer from '../components/ExamTimer';
import { offlineStorage } from '../services/offlineStorage';

function AttendancePage() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [undoReasons, setUndoReasons] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [scanMode, setScanMode] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const [scanHistory, setScanHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const manualInputRef = useRef(null);

    // Undo re-authentication modal state
    const [showUndoModal, setShowUndoModal] = useState(false);
    const [undoTarget, setUndoTarget] = useState(null); // { studentId, studentName, reason }
    const [undoUsername, setUndoUsername] = useState('');
    const [undoPassword, setUndoPassword] = useState('');
    const [undoError, setUndoError] = useState('');
    const [undoLoading, setUndoLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [examId]);

    // Listen for when connection is restored
    useEffect(() => {
        const handleOnline = () => {
            if (offlineStorage.hasUnsyncedData()) {
                setMessage('🔄 Back online! Syncing data...');
                offlineStorage.syncWhenOnline();
                setTimeout(() => {
                    setMessage('✅ Data synced successfully!');
                    fetchData(); // Refresh from server
                }, 2000);
            }
        };

        const handleOffline = () => {
            setMessage('📡 You are offline - changes will be saved locally');
            setTimeout(() => setMessage(''), 3000);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const fetchData = async () => {
        try {
            // Fetch exam details
            const examRes = await getExamById(examId);
            setExam(examRes.data);

            // Fetch students for this exam
            const studentsRes = await getStudentsForExam(examId);
            setStudents(studentsRes.data);

            // Fetch existing attendance
            const attendanceRes = await getAttendanceForExam(examId);
            const attendanceMap = {};
            attendanceRes.data.forEach(record => {
                attendanceMap[record.student.id] = record.status;
            });
            setAttendance(attendanceMap);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async (studentId, status) => {
        const isOnline = navigator.onLine;

        try {
            if (isOnline) {
                await markAttendance(examId, studentId, status, 'MANUAL');
                setAttendance({ ...attendance, [studentId]: status });
                setMessage(`✓ Attendance marked as ${status}`);
            } else {
                offlineStorage.saveAttendance(examId, studentId, status);
                setAttendance({ ...attendance, [studentId]: status });
                setMessage(`📦 Saved offline: ${status} (will sync when online)`);
            }
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            offlineStorage.saveAttendance(examId, studentId, status);
            setAttendance({ ...attendance, [studentId]: status });
            setMessage('⚠ Saved offline - will sync later');
        }
    };

    const handleUndoAttendance = async (studentId, reason, studentName) => {
        if (!reason) {
            setMessage('⚠ Please select a reason to undo');
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        // Open re-auth modal instead of directly undoing
        setUndoTarget({ studentId, studentName, reason });
        setUndoUsername('');
        setUndoPassword('');
        setUndoError('');
        setShowUndoModal(true);
    };

    const handleConfirmUndo = async (e) => {
        e.preventDefault();
        if (!undoUsername || !undoPassword) {
            setUndoError('Please enter your credentials');
            return;
        }
        setUndoLoading(true);
        setUndoError('');

        try {
            await undoAttendance(
                examId,
                undoTarget.studentId,
                undoTarget.reason,
                undoUsername,
                undoPassword
            );
            // Success — remove from local state
            const updated = { ...attendance };
            delete updated[undoTarget.studentId];
            setAttendance(updated);
            setUndoReasons((prev) => ({ ...prev, [undoTarget.studentId]: '' }));
            setMessage(`↺ Undo: ${undoTarget.studentName} (reason: ${undoTarget.reason})`);
            setTimeout(() => setMessage(''), 5000);
            setShowUndoModal(false);
        } catch (err) {
            setUndoError(err.message || 'Failed to undo. Check credentials and try again.');
        } finally {
            setUndoLoading(false);
        }
    };

    // Handle barcode scan
    const handleBarcodeScan = async (scannedCode) => {
        console.log('Scanned barcode:', scannedCode);

        const student = students.find(s => s.studentId === scannedCode);

        if (!student) {
            setMessage(`✗ Student ID ${scannedCode} not found in this exam`);
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        if (attendance[student.id]) {
            setMessage(`⚠ ${student.fullName} already marked as ${attendance[student.id]}`);
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        const isOnline = navigator.onLine;

        try {
            if (isOnline) {
                await markAttendance(examId, student.id, 'PRESENT', 'SCAN');
                setAttendance({ ...attendance, [student.id]: 'PRESENT' });
                setMessage(`✓ ${student.fullName} marked PRESENT via scan`);

                setScanHistory([...scanHistory, {
                    studentId: student.studentId,
                    name: student.fullName,
                    time: new Date().toLocaleTimeString()
                }]);
            } else {
                offlineStorage.saveAttendance(examId, student.id, 'PRESENT');
                setAttendance({ ...attendance, [student.id]: 'PRESENT' });
                setMessage(`📦 ${student.fullName} - Saved offline`);
            }

            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error marking attendance:', err);
            setMessage(`✗ Error marking attendance for ${student.fullName}`);
        }
    };

    const handleManualInput = (e) => {
        e.preventDefault();
        if (manualInput.trim()) {
            handleBarcodeScan(manualInput.trim());
            setManualInput('');
        }
    };

    const toggleScanMode = () => {
        setScanMode(!scanMode);
        if (!scanMode) {
            setTimeout(() => {
                manualInputRef.current?.focus();
            }, 100);
        }
    };

    const handleDeleteStudent = async (studentId, studentName) => {
        if (!window.confirm(`Are you sure you want to remove ${studentName} from this exam?`)) {
            return;
        }

        try {
            await removeStudentFromExam(examId, studentId);
            setMessage(`✓ ${studentName} has been removed from the exam`);

            // Refresh the student list
            await fetchData();

            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error removing student:', err);
            setMessage(`✗ Failed to remove ${studentName}: ${err.message}`);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    // Filter students based on search query
    const filteredStudents = students.filter(student =>
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.program?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="attendance-container" style={{
                    backgroundImage: `url('${process.env.PUBLIC_URL}/nextphases-swirl.png')`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'contain',
                    backgroundAttachment: 'fixed'
                }}>
                    <SpinningCrescents />
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading attendance data...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="attendance-container" style={{
                backgroundImage: `url('${process.env.PUBLIC_URL}/nextphases-swirl.png')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: '550px 550px',
                backgroundAttachment: 'fixed'
            }}>
                <SpinningCrescents />
                <div className="attendance-content">
                    {/* Back Button */}
                    <button onClick={() => navigate('/')} className="btn-back">
                        ← Back to Dashboard
                    </button>

                    {/* Exam Info Card */}
                    {exam && (
                        <div className="exam-info-card">
                            <div className="exam-info-header">
                                <div>
                                    <h2>{exam.courseCode} - {exam.courseName}</h2>
                                    <div className="exam-meta">
                                        <span><strong>Venue:</strong> {exam.venue}</span>
                                        <span><strong>Date:</strong> {new Date(exam.examDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Message Banner */}
                    {message && (
                        <div className={`message-banner ${
                            message.includes('✓') ? 'success' : 
                            message.includes('✗') ? 'error' : 
                            'info'
                        }`}>
                            {message}
                        </div>
                    )}

                    {/* Scanner Section */}
                    <div className="scanner-card">
                        <div className="scanner-header">
                            <h3>Barcode Scanner</h3>
                            <button
                                className={`btn-toggle-scanner ${scanMode ? 'active' : ''}`}
                                onClick={toggleScanMode}
                            >
                                {scanMode ? '✗ Close Scanner' : '📷 Open Scanner'}
                            </button>
                        </div>

                        {scanMode && (
                            <div className="scanner-content">
                                {/* Manual/Barcode Gun Input */}
                                <div className="scanner-method">
                                    <h4>Manual Entry / Barcode Gun</h4>
                                    <p className="method-description">Type student ID or use barcode scanner gun</p>
                                    <form onSubmit={handleManualInput} className="manual-input-form">
                                        <input
                                            ref={manualInputRef}
                                            type="text"
                                            value={manualInput}
                                            onChange={(e) => setManualInput(e.target.value)}
                                            placeholder="Enter Student ID (e.g., BCS25165336)"
                                            className="input-barcode"
                                            autoFocus
                                        />
                                        <button type="submit" className="btn-submit">
                                            Mark Present
                                        </button>
                                    </form>
                                </div>

                                {/* Camera Scanner */}
                                <div className="scanner-method">
                                    <h4>Camera Scanner</h4>
                                    <p className="method-description">Use device camera to scan barcode</p>
                                    <div className="camera-scanner-wrapper">
                                        <BarcodeScanner
                                            onScan={handleBarcodeScan}
                                            onError={(err) => setMessage(`✗ Scanner error: ${err.message}`)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scan History */}
                        {scanHistory.length > 0 && (
                            <div className="scan-history">
                                <h4>Recent Scans ({scanHistory.length})</h4>
                                <div className="history-list">
                                    {scanHistory.slice(-5).reverse().map((scan, idx) => (
                                        <div key={idx} className="history-item">
                                            <span className="history-badge">{scan.studentId}</span>
                                            <span className="history-name">{scan.name}</span>
                                            <span className="history-time">{scan.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Student Attendance Table */}
                    <div className="attendance-table-card">
                        <div className="table-header">
                            <h3>Student Attendance ({filteredStudents.length})</h3>
                            <input
                                type="text"
                                placeholder="Search by name, ID, or program..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="table-wrapper">
                            <table className="attendance-table">
                                <thead>
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Full Name</th>
                                        <th>Program</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id} className={attendance[student.id] ? 'marked' : ''}>
                                            <td className="student-id">{student.studentId}</td>
                                            <td className="student-name">{student.fullName}</td>
                                            <td>{student.program}</td>
                                            <td>
                                                {attendance[student.id] ? (
                                                    <span className={`status-badge status-${attendance[student.id].toLowerCase()}`}>
                                                        {attendance[student.id]}
                                                    </span>
                                                ) : (
                                                    <span className="status-badge status-unmarked">Not Marked</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    {!attendance[student.id] && (
                                                        <>
                                                            <button
                                                                className="btn-action btn-present"
                                                                onClick={() => handleMarkAttendance(student.id, 'PRESENT')}
                                                                disabled={attendance[student.id]}
                                                            >
                                                                Present
                                                            </button>
                                                            <button
                                                                className="btn-action btn-late"
                                                                onClick={() => handleMarkAttendance(student.id, 'LATE')}
                                                                disabled={attendance[student.id]}
                                                            >
                                                                Late
                                                            </button>
                                                            <button
                                                                className="btn-action btn-absent"
                                                                onClick={() => handleMarkAttendance(student.id, 'ABSENT')}
                                                                disabled={attendance[student.id]}
                                                            >
                                                                Absent
                                                            </button>
                                                            <button
                                                                className="btn-action btn-delete"
                                                                onClick={() => handleDeleteStudent(student.id, student.fullName)}
                                                                title="Remove student from exam"
                                                            >
                                                                Remove
                                                            </button>
                                                        </>
                                                    )}

                                                    {attendance[student.id] && (
                                                        <div className="undo-controls">
                                                            <select
                                                                value={undoReasons[student.id] || ''}
                                                                onChange={(e) => setUndoReasons((prev) => ({ ...prev, [student.id]: e.target.value }))}
                                                            >
                                                                <option value="">Reason to undo…</option>
                                                                <option value="Wrong student">Wrong student</option>
                                                                <option value="Scanner misread">Scanner misread</option>
                                                                <option value="Manual correction">Manual correction</option>
                                                                <option value="Duplicate entry">Duplicate entry</option>
                                                                <option value="Other">Other</option>
                                                            </select>
                                                            <button
                                                                className="btn-action btn-delete"
                                                                onClick={() => handleUndoAttendance(student.id, undoReasons[student.id], student.fullName)}
                                                                disabled={!undoReasons[student.id]}
                                                            >
                                                                Undo
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exam Timer - rendered at top level to avoid stacking context issues */}
            {exam && <ExamTimer exam={exam} />}

            {/* Undo Re-Authentication Modal */}
            {showUndoModal && (
                <div className="undo-modal-overlay" onClick={() => setShowUndoModal(false)}>
                    <div className="undo-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="undo-modal-header">
                            <h3>Verify Identity to Undo</h3>
                            <button className="undo-modal-close" onClick={() => setShowUndoModal(false)}>×</button>
                        </div>
                        <div className="undo-modal-info">
                            <p>Undoing attendance for <strong>{undoTarget?.studentName}</strong></p>
                            <p className="undo-reason-label">Reason: <span>{undoTarget?.reason}</span></p>
                        </div>
                        <form onSubmit={handleConfirmUndo} className="undo-modal-form">
                            {undoError && <div className="undo-modal-error">{undoError}</div>}
                            <div className="undo-form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={undoUsername}
                                    onChange={(e) => setUndoUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="undo-form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={undoPassword}
                                    onChange={(e) => setUndoPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                            <div className="undo-modal-actions">
                                <button type="button" className="btn-undo-cancel" onClick={() => setShowUndoModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-undo-confirm" disabled={undoLoading}>
                                    {undoLoading ? 'Verifying...' : 'Confirm Undo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default AttendancePage;
