// src/pages/AttendancePage.js - Mark student attendance
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BarcodeScanner from '../components/BarcodeScanner';
import { getExamById, getStudentsForExam, getAttendanceForExam, markAttendance } from '../services/apiService';
import './AttendancePage.css';
import ExamTimer from '../components/ExamTimer';
import { offlineStorage } from '../services/offlineStorage';

function AttendancePage() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [scanMode, setScanMode] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const [scanHistory, setScanHistory] = useState([]);
    const manualInputRef = useRef(null);

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
        // Check if online
        const isOnline = navigator.onLine;

        try {
            if (isOnline) {
                // Normal online flow
                await markAttendance(examId, studentId, status, 'MANUAL');
                setAttendance({ ...attendance, [studentId]: status });
                setMessage(`✅ Attendance marked as ${status}`);
            } else {
                // Offline mode - save locally
                offlineStorage.saveAttendance(examId, studentId, status);
                setAttendance({ ...attendance, [studentId]: status });
                setMessage(`📦 Saved offline: ${status} (will sync when online)`);
            }
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            // If online but API fails, save offline as backup
            offlineStorage.saveAttendance(examId, studentId, status);
            setAttendance({ ...attendance, [studentId]: status });
            setMessage('⚠️ Saved offline - will sync later');
        }
    };

    // Handle barcode scan
    const handleBarcodeScan = async (scannedCode) => {
        console.log('Scanned barcode:', scannedCode);

        // Find student by studentId (barcode contains studentId)
        const student = students.find(s => s.studentId === scannedCode);

        if (!student) {
            setMessage(`❌ Student ID ${scannedCode} not found in this exam`);
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        // Check if already marked
        if (attendance[student.id]) {
            setMessage(`⚠️ ${student.fullName} already marked as ${attendance[student.id]}`);
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        // Mark as present via scan
        const isOnline = navigator.onLine;

        try {
            if (isOnline) {
                await markAttendance(examId, student.id, 'PRESENT', 'SCAN');
                setAttendance({ ...attendance, [student.id]: 'PRESENT' });
                setMessage(`✅ ${student.fullName} marked PRESENT via scan`);

                // Add to scan history
                setScanHistory([...scanHistory, {
                    studentId: student.studentId,
                    name: student.fullName,
                    time: new Date().toLocaleTimeString()
                }]);
            } else {
                offlineStorage.saveAttendance(examId, student.id, 'PRESENT');
                setAttendance({ ...attendance, [student.id]: 'PRESENT' });
                setMessage(`📦 ${student.fullName} - Saved offline (will sync when online)`);
            }

            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error marking attendance:', err);
            setMessage(`❌ Error marking attendance for ${student.fullName}`);
        }
    };

    // Handle manual barcode input
    const handleManualInput = (e) => {
        e.preventDefault();
        if (manualInput.trim()) {
            handleBarcodeScan(manualInput.trim());
            setManualInput('');
        }
    };

    // Toggle scan mode
    const toggleScanMode = () => {
        setScanMode(!scanMode);
        if (!scanMode) {
            setTimeout(() => {
                manualInputRef.current?.focus();
            }, 100);
        }
    };

    if (loading) return <div><div className="loading">Loading...</div></div>;

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

                {/* Exam Timer - Always visible during attendance */}
                {exam && <ExamTimer exam={exam} />}

                {message && <div style={{ padding: '1rem', background: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '1rem' }}>{message}</div>}

                {/* Barcode Scanning Section */}
                <div className="card scan-section">
                    <div className="scan-header">
                        <h3>📱 Attendance Marking</h3>
                        <button
                            className={`btn ${scanMode ? 'btn-danger' : 'btn-primary'}`}
                            onClick={toggleScanMode}
                        >
                            {scanMode ? '❌ Close Scanner' : '📷 Open Scanner'}
                        </button>
                    </div>

                    {scanMode && (
                        <div className="scan-modes">
                            {/* Manual Input Method */}
                            <div className="manual-scan-section">
                                <h4>🔤 Manual Entry / Barcode Gun</h4>
                                <p className="scan-instruction">Type or scan student ID with barcode scanner gun</p>
                                <form onSubmit={handleManualInput} className="manual-input-form">
                                    <input
                                        ref={manualInputRef}
                                        type="text"
                                        value={manualInput}
                                        onChange={(e) => setManualInput(e.target.value)}
                                        placeholder="Enter Student ID (e.g., BCS25165336)"
                                        className="manual-input"
                                        autoFocus
                                    />
                                    <button type="submit" className="btn btn-success">
                                        ✓ Mark Present
                                    </button>
                                </form>
                            </div>

                            {/* Camera Scanner Method */}
                            <div className="camera-scan-section">
                                <h4>📷 Camera Scanner</h4>
                                <p className="scan-instruction">Use device camera to scan student ID barcode</p>
                                <BarcodeScanner
                                    onScan={handleBarcodeScan}
                                    onError={(err) => setMessage(`❌ Scanner error: ${err.message}`)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Scan History */}
                    {scanHistory.length > 0 && (
                        <div className="scan-history">
                            <h4>📋 Recent Scans ({scanHistory.length})</h4>
                            <div className="history-items">
                                {scanHistory.slice(-5).reverse().map((scan, idx) => (
                                    <div key={idx} className="history-item">
                                        <span className="history-id">{scan.studentId}</span>
                                        <span className="history-name">{scan.name}</span>
                                        <span className="history-time">{scan.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Manual Attendance Table */}
                <div className="card">
                    <h3>👥 Student Attendance - Manual Override</h3>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '1rem' }}>
                        Use buttons below to manually mark or change attendance status
                    </p>
                    <table className="table">
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
                        {students.map((student) => (
                            <tr key={student.id}>
                                <td>{student.studentId}</td>
                                <td>{student.fullName}</td>
                                <td>{student.program}</td>
                                <td>
                                    {attendance[student.id] ? (
                                        <span className={`badge badge-${attendance[student.id].toLowerCase()}`}>
                        {attendance[student.id]}
                      </span>
                                    ) : (
                                        <span style={{ color: '#999' }}>Not Marked</span>
                                    )}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-success"
                                            style={{ padding: '0.25rem 0.5rem' }}
                                            onClick={() => handleMarkAttendance(student.id, 'PRESENT')}
                                            disabled={attendance[student.id]}
                                        >
                                            Present
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            style={{ padding: '0.25rem 0.5rem' }}
                                            onClick={() => handleMarkAttendance(student.id, 'ABSENT')}
                                            disabled={attendance[student.id]}
                                        >
                                            Absent
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ padding: '0.25rem 0.5rem', background: '#f39c12', color: 'white' }}
                                            onClick={() => handleMarkAttendance(student.id, 'LATE')}
                                            disabled={attendance[student.id]}
                                        >
                                            Late
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AttendancePage;