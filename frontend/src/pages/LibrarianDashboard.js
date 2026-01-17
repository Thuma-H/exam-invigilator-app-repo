import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { API_CONFIG } from '../config/environment';
import './LibrarianDashboard.css';

function LibrarianDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('students');

    // Students state
    const [students, setStudents] = useState([]);
    const [pendingStudents, setPendingStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProgram, setFilterProgram] = useState('ALL');
    const [printQueue, setPrintQueue] = useState([]);

    // Courses state
    const [courses, setCourses] = useState([]);
    const [exams, setExams] = useState([]);
    const [courseSearch, setCourseSearch] = useState('');
    const [newCourse, setNewCourse] = useState({
        courseCode: '',
        courseName: '',
        department: '',
        creditHours: '',
        instructor: ''
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchStudents();
        fetchPendingStudents();
        fetchCourses();
        fetchExams();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`${API_CONFIG.BASE_URL}/students`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStudents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            setLoading(false);
        }
    };

    const fetchPendingStudents = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`${API_CONFIG.BASE_URL}/students/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setPendingStudents(response.data);
        } catch (error) {
            console.error('Error fetching pending students:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`${API_CONFIG.BASE_URL}/courses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchExams = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`${API_CONFIG.BASE_URL}/exams`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setExams(response.data);
        } catch (error) {
            console.error('Error fetching exams:', error);
        }
    };

    const handleVerifyStudent = async (studentId) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.put(`${API_CONFIG.BASE_URL}/students/${studentId}/verify`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showMessage('success', '✅ Student verified successfully');
            fetchStudents();
            fetchPendingStudents();
        } catch (error) {
            showMessage('error', '❌ Error verifying student');
        }
    };

    const handleSendBarcodeEmail = async (studentId, studentName) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.post(`${API_CONFIG.BASE_URL}/students/${studentId}/send-barcode-email`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showMessage('success', `✅ Barcode email sent to ${studentName}`);
        } catch (error) {
            showMessage('error', '❌ Error sending email: ' + (error.response?.data || error.message));
        }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            await axios.post(`${API_CONFIG.BASE_URL}/courses`, newCourse, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showMessage('success', '✅ Course added successfully');
            setNewCourse({ courseCode: '', courseName: '', department: '', creditHours: '', instructor: '' });
            fetchCourses();
        } catch (error) {
            showMessage('error', '❌ Error adding course: ' + (error.response?.data || error.message));
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                const token = sessionStorage.getItem('token');
                await axios.delete(`${API_CONFIG.BASE_URL}/courses/${courseId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                showMessage('success', '✅ Course deleted successfully');
                fetchCourses();
            } catch (error) {
                showMessage('error', '❌ Error deleting course');
            }
        }
    };

    const handleAddToPrintQueue = (student) => {
        if (!printQueue.find(s => s.id === student.id)) {
            setPrintQueue([...printQueue, student]);
            showMessage('success', `✅ ${student.fullName} added to print queue`);
        } else {
            showMessage('error', '⚠️ Student already in print queue');
        }
    };

    const handleRemoveFromQueue = (studentId) => {
        setPrintQueue(printQueue.filter(s => s.id !== studentId));
    };

    const handlePrintBatch = async () => {
        if (printQueue.length === 0) {
            showMessage('error', '⚠️ Print queue is empty');
            return;
        }

        showMessage('success', `🖨️ Downloading ${printQueue.length} barcodes...`);

        for (const student of printQueue) {
            await downloadBarcode(student.studentId);
        }

        showMessage('success', `✅ Downloaded ${printQueue.length} barcodes. Ready to print!`);
        setPrintQueue([]);
    };

    const downloadBarcode = async (studentId) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(
                `${API_CONFIG.BASE_URL}/barcode/download/${studentId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${studentId}_barcode.png`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading barcode:', error);
        }
    };

    const handleViewBarcode = (studentId) => {
        window.open(`${API_CONFIG.BASE_URL}/barcode/${studentId}`, '_blank');
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const programs = ['ALL', ...new Set(students.map(s => s.program))];
    const departments = [...new Set(courses.map(c => c.department))];

    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesProgram =
            filterProgram === 'ALL' || student.program === filterProgram;

        return matchesSearch && matchesProgram;
    });

    const filteredCourses = courses.filter(course =>
        course.courseCode?.toLowerCase().includes(courseSearch.toLowerCase()) ||
        course.courseName?.toLowerCase().includes(courseSearch.toLowerCase()) ||
        course.department?.toLowerCase().includes(courseSearch.toLowerCase())
    );

    return (
        <div className="librarian-dashboard">
            <Navbar />
            <div className="container">
                <div className="dashboard-header">
                    <div className="header-left">
                        <button className="btn-back" onClick={() => navigate('/')}>
                            ← Back to Invigilator Dashboard
                        </button>
                    </div>
                    <h1>📚 Librarian Dashboard</h1>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Tabs */}
                <div className="tabs-container">
                    <button
                        className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
                        onClick={() => setActiveTab('students')}
                    >
                        👥 Students <span className="badge">{students.length}</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'verification' ? 'active' : ''}`}
                        onClick={() => setActiveTab('verification')}
                    >
                        ✅ Verification <span className="badge">{pendingStudents.length}</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('courses')}
                    >
                        📖 Course Register <span className="badge">{courses.length}</span>
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'exams' ? 'active' : ''}`}
                        onClick={() => setActiveTab('exams')}
                    >
                        📝 Exams <span className="badge">{exams.length}</span>
                    </button>
                </div>

                {/* Students Tab */}
                {activeTab === 'students' && (
                    <div className="tab-content">
                        {/* Stats */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>{students.length}</h3>
                                <p>Total Students</p>
                            </div>
                            <div className="stat-card">
                                <h3>{printQueue.length}</h3>
                                <p>In Print Queue</p>
                            </div>
                            <div className="stat-card">
                                <h3>{filteredStudents.length}</h3>
                                <p>Filtered Results</p>
                            </div>
                            <div className="stat-card">
                                <h3>{students.filter(s => s.verified).length}</h3>
                                <p>Verified Students</p>
                            </div>
                        </div>

                        {/* Print Queue */}
                        {printQueue.length > 0 && (
                            <div className="print-queue-card">
                                <div className="print-queue-header">
                                    <h3>🖨️ Print Queue ({printQueue.length} cards)</h3>
                                    <div className="print-queue-actions">
                                        <button className="btn btn-success" onClick={handlePrintBatch}>
                                            Print All
                                        </button>
                                        <button className="btn btn-danger" onClick={() => setPrintQueue([])}>
                                            Clear Queue
                                        </button>
                                    </div>
                                </div>
                                <div className="print-queue-items">
                                    {printQueue.map(student => (
                                        <span key={student.id} className="queue-item">
                                            {student.studentId} - {student.fullName}
                                            <button onClick={() => handleRemoveFromQueue(student.id)}>✕</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Filters */}
                        <div className="card">
                            <div className="filters">
                                <input
                                    type="text"
                                    placeholder="🔍 Search by name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                                <select
                                    value={filterProgram}
                                    onChange={(e) => setFilterProgram(e.target.value)}
                                    className="filter-select"
                                >
                                    {programs.map(prog => (
                                        <option key={prog}>{prog}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Students Table */}
                        <div className="card">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Full Name</th>
                                        <th>Program</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{textAlign: 'center'}}>Loading...</td></tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr><td colSpan="6" style={{textAlign: 'center'}}>No students found</td></tr>
                                ) : (
                                    filteredStudents.map(student => (
                                        <tr key={student.id}>
                                            <td className="mono-text">{student.studentId}</td>
                                            <td>{student.fullName}</td>
                                            <td><span className="badge badge-info">{student.program}</span></td>
                                            <td>{student.email || 'N/A'}</td>
                                            <td>
                                                {student.verified ?
                                                    <span className="badge badge-success">✓ Verified</span> :
                                                    <span className="badge badge-warning">⏳ Pending</span>
                                                }
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="btn btn-sm btn-primary"
                                                            onClick={() => handleViewBarcode(student.studentId)}
                                                            title="View Barcode">
                                                        👁️
                                                    </button>
                                                    <button className="btn btn-sm btn-success"
                                                            onClick={() => downloadBarcode(student.studentId)}
                                                            title="Download Barcode">
                                                        📥
                                                    </button>
                                                    <button className="btn btn-sm btn-warning"
                                                            onClick={() => handleAddToPrintQueue(student)}
                                                            disabled={printQueue.find(s => s.id === student.id)}
                                                            title="Add to Print Queue">
                                                        {printQueue.find(s => s.id === student.id) ? '✓' : '🖨️'}
                                                    </button>
                                                    {student.email && (
                                                        <button className="btn btn-sm btn-info"
                                                                onClick={() => handleSendBarcodeEmail(student.id, student.fullName)}
                                                                title="Send Email">
                                                            ✉️
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Verification Tab */}
                {activeTab === 'verification' && (
                    <div className="tab-content">
                        <div className="card">
                            <h2>🔍 Pending Student Verification</h2>
                            <p className="text-muted">Review and verify new student registrations</p>

                            {pendingStudents.length === 0 ? (
                                <div className="empty-state">
                                    <p>✅ No pending verifications</p>
                                </div>
                            ) : (
                                <div className="verification-grid">
                                    {pendingStudents.map(student => (
                                        <div key={student.id} className="verification-card">
                                            <div className="verification-header">
                                                <h3>{student.fullName}</h3>
                                                <span className="badge badge-warning">Pending</span>
                                            </div>
                                            <div className="verification-details">
                                                <p><strong>Student ID:</strong> {student.studentId}</p>
                                                <p><strong>Program:</strong> {student.program}</p>
                                                <p><strong>Email:</strong> {student.email || 'Not provided'}</p>
                                                <p><strong>Registered:</strong> {new Date(student.registrationDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="verification-actions">
                                                <button className="btn btn-success"
                                                        onClick={() => handleVerifyStudent(student.id)}>
                                                    ✓ Verify
                                                </button>
                                                <button className="btn btn-primary"
                                                        onClick={() => handleViewBarcode(student.studentId)}>
                                                    👁️ View Barcode
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Courses Tab */}
                {activeTab === 'courses' && (
                    <div className="tab-content">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>{courses.length}</h3>
                                <p>Total Courses</p>
                            </div>
                            <div className="stat-card">
                                <h3>{departments.length}</h3>
                                <p>Departments</p>
                            </div>
                            <div className="stat-card">
                                <h3>{exams.length}</h3>
                                <p>Scheduled Exams</p>
                            </div>
                        </div>

                        {/* Add Course Form */}
                        <div className="card">
                            <h2>➕ Add New Course</h2>
                            <form onSubmit={handleAddCourse} className="course-form">
                                <div className="form-row">
                                    <input
                                        type="text"
                                        placeholder="Course Code (e.g., BSC121)"
                                        value={newCourse.courseCode}
                                        onChange={(e) => setNewCourse({...newCourse, courseCode: e.target.value})}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Course Name"
                                        value={newCourse.courseName}
                                        onChange={(e) => setNewCourse({...newCourse, courseName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <input
                                        type="text"
                                        placeholder="Department"
                                        value={newCourse.department}
                                        onChange={(e) => setNewCourse({...newCourse, department: e.target.value})}
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Credit Hours"
                                        value={newCourse.creditHours}
                                        onChange={(e) => setNewCourse({...newCourse, creditHours: e.target.value})}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Instructor"
                                        value={newCourse.instructor}
                                        onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">Add Course</button>
                            </form>
                        </div>

                        {/* Course Search */}
                        <div className="card">
                            <input
                                type="text"
                                placeholder="🔍 Search courses by code, name, or department..."
                                value={courseSearch}
                                onChange={(e) => setCourseSearch(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        {/* Courses Table */}
                        <div className="card">
                            <h2>📚 Course Register</h2>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Course Code</th>
                                        <th>Course Name</th>
                                        <th>Department</th>
                                        <th>Credits</th>
                                        <th>Instructor</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {filteredCourses.length === 0 ? (
                                    <tr><td colSpan="6" style={{textAlign: 'center'}}>No courses found</td></tr>
                                ) : (
                                    filteredCourses.map(course => (
                                        <tr key={course.id}>
                                            <td className="mono-text">{course.courseCode}</td>
                                            <td>{course.courseName}</td>
                                            <td><span className="badge badge-info">{course.department}</span></td>
                                            <td>{course.creditHours}</td>
                                            <td>{course.instructor || 'N/A'}</td>
                                            <td>
                                                <button className="btn btn-sm btn-danger"
                                                        onClick={() => handleDeleteCourse(course.id)}>
                                                    🗑️ Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Exams Tab */}
                {activeTab === 'exams' && (
                    <div className="tab-content">
                        <div className="card">
                            <h2>📝 Scheduled Exams</h2>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Course Code</th>
                                        <th>Course Name</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Venue</th>
                                        <th>Duration</th>
                                        <th>Invigilator</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {exams.length === 0 ? (
                                    <tr><td colSpan="7" style={{textAlign: 'center'}}>No exams scheduled</td></tr>
                                ) : (
                                    exams.map(exam => (
                                        <tr key={exam.id}>
                                            <td className="mono-text">{exam.courseCode}</td>
                                            <td>{exam.courseName}</td>
                                            <td>{new Date(exam.examDate).toLocaleDateString()}</td>
                                            <td>{exam.startTime}</td>
                                            <td>{exam.venue}</td>
                                            <td>{exam.duration} min</td>
                                            <td>{exam.invigilator?.username || 'N/A'}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LibrarianDashboard;