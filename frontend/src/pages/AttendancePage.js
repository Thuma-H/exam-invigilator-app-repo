// src/pages/AttendancePage.js - Mark student attendance
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
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

                <div className="card">
                    <h3>Student Attendance</h3>
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