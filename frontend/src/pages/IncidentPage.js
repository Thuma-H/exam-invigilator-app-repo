// src/pages/IncidentPage.js - Report exam incidents
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getExamById, getStudentsForExam, reportIncident, getIncidentsForExam } from '../services/apiService';

function IncidentPage() {
    const { examId } = useParams();
    const navigate = useNavigate();
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

    useEffect(() => {
        fetchData();
    }, [examId]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await reportIncident(
                examId,
                studentId || null,
                category,
                severity,
                description
            );

            alert('Incident reported successfully!');

            // Reset form
            setStudentId('');
            setCategory('CHEATING');
            setSeverity('MEDIUM');
            setDescription('');

            // Refresh incidents list
            fetchData();
        } catch (err) {
            alert(err.response?.data || 'Failed to report incident');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div><Navbar /><div className="loading">Loading...</div></div>;

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
                    </div>
                )}

                <div className="card">
                    <h3>Report New Incident</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Student Involved (Optional)</label>
                            <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                                <option value="">-- General Incident (No specific student) --</option>
                                {students.map(student => (
                                    <option key={student.id} value={student.id}>
                                        {student.studentId} - {student.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Category *</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                                <option value="CHEATING">Cheating</option>
                                <option value="HEALTH_EMERGENCY">Health Emergency</option>
                                <option value="DISRUPTION">Disruption</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Severity *</label>
                            <select value={severity} onChange={(e) => setSeverity(e.target.value)} required>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Description *</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the incident in detail..."
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-danger" disabled={submitting}>
                            {submitting ? 'Reporting...' : 'Report Incident'}
                        </button>
                    </form>
                </div>

                <div className="card">
                    <h3>Reported Incidents ({incidents.length})</h3>
                    {incidents.length === 0 ? (
                        <p style={{ color: '#999' }}>No incidents reported yet.</p>
                    ) : (
                        <table className="table">
                            <thead>
                            <tr>
                                <th>Time</th>
                                <th>Student</th>
                                <th>Category</th>
                                <th>Severity</th>
                                <th>Description</th>
                            </tr>
                            </thead>
                            <tbody>
                            {incidents.map((incident) => (
                                <tr key={incident.id}>
                                    <td>{new Date(incident.reportedAt).toLocaleTimeString()}</td>
                                    <td>{incident.student ? incident.student.fullName : 'General'}</td>
                                    <td>{incident.category}</td>
                                    <td>
                      <span className={`badge badge-${incident.severity.toLowerCase()}`}>
                        {incident.severity}
                      </span>
                                    </td>
                                    <td>{incident.description.substring(0, 50)}...</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default IncidentPage;