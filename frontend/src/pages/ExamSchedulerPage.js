import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import apiService from '../services/apiService';
import ExamSchedulerModal from '../components/ExamSchedulerModal';
import './ExamSchedulerPage.css';
import logo from '../assets/nextphases-swirl.png';

const localizer = momentLocalizer(moment);

function ExamSchedulerPage() {
    const navigate = useNavigate();
    const role = sessionStorage.getItem('role') || localStorage.getItem('role');
    const isLibrarian = role === 'LIBRARIAN';
    const [exams, setExams] = useState([]);
    const [filteredExams, setFilteredExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [conflicts, setConflicts] = useState([]);
    const [invigilators, setInvigilators] = useState([]);

    // Filter states
    const [filterDate, setFilterDate] = useState('');
    const [filterRoom, setFilterRoom] = useState('');
    const [filterInvigilator, setFilterInvigilator] = useState('');
    const [filterSubject, setFilterSubject] = useState('');

    // Fetch exams on mount
    useEffect(() => {
        fetchExams();
        if (isLibrarian) {
            fetchInvigilators();
        }
    }, []);

    // Apply filters when exams or filter values change
    useEffect(() => {
        applyFilters();
    }, [exams, filterDate, filterRoom, filterInvigilator, filterSubject]);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await apiService.getMyExams();
            // Ensure exams is an array
            const examArray = Array.isArray(response) ? response : response.data || [];

            // Transform exams to calendar event format
            const calendarEvents = examArray.map(exam => ({
                id: exam.id,
                title: `${exam.courseCode || 'N/A'} - ${exam.courseName || 'N/A'}`,
                start: new Date(`${exam.examDate}T${exam.startTime}`),
                end: calculateEndTime(exam.examDate, exam.startTime, exam.duration),
                resource: {
                    ...exam,
                    courseCode: exam.courseCode,
                    courseName: exam.courseName,
                    venue: exam.venue,
                    invigilatorId: exam.invigilatorId,
                    duration: exam.duration
                }
            }));

            setExams(calendarEvents);
            setError('');
        } catch (err) {
            console.error('Failed to fetch exams:', err);
            setError('Failed to load exams. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const calculateEndTime = (examDate, startTime, duration) => {
        const start = new Date(`${examDate}T${startTime}`);
        const end = new Date(start.getTime() + (duration * 60 * 1000));
        return end;
    };

    const fetchInvigilators = async () => {
        try {
            const response = await apiService.getInvigilators();
            const list = Array.isArray(response) ? response : response?.data || [];
            setInvigilators(list);
        } catch (err) {
            console.error('Failed to fetch invigilators:', err);
            // Non-critical, silently fail — user can still type ID manually
        }
    };

    const applyFilters = () => {
        let filtered = exams;

        if (filterDate) {
            filtered = filtered.filter(exam => {
                const examDate = exam.start.toISOString().split('T')[0];
                return examDate === filterDate;
            });
        }

        if (filterRoom) {
            filtered = filtered.filter(exam =>
                exam.resource?.venue?.toLowerCase().includes(filterRoom.toLowerCase())
            );
        }

        if (filterInvigilator) {
            filtered = filtered.filter(exam =>
                exam.resource?.invigilatorId?.toString().includes(filterInvigilator)
            );
        }

        if (filterSubject) {
            filtered = filtered.filter(exam =>
                exam.resource?.courseName?.toLowerCase().includes(filterSubject.toLowerCase()) ||
                exam.resource?.courseCode?.toLowerCase().includes(filterSubject.toLowerCase())
            );
        }

        setFilteredExams(filtered);
        detectConflicts(filtered);
    };

    const detectConflicts = (examList) => {
        const conflictPairs = [];

        for (let i = 0; i < examList.length; i++) {
            for (let j = i + 1; j < examList.length; j++) {
                const exam1 = examList[i];
                const exam2 = examList[j];

                // Check if exams overlap in time and have the same invigilator or venue
                const timeOverlap = exam1.start < exam2.end && exam1.end > exam2.start;
                const sameInvigilator = exam1.resource?.invigilatorId === exam2.resource?.invigilatorId;
                const sameVenue = exam1.resource?.venue === exam2.resource?.venue;

                if (timeOverlap && (sameInvigilator || sameVenue)) {
                    conflictPairs.push([exam1.id, exam2.id]);
                }
            }
        }

        setConflicts(conflictPairs);
    };

    const handleSelectSlot = (slotInfo) => {
        if (!isLibrarian) return; // Invigilators can't create exams
        setModalMode('create');
        setSelectedEvent({
            start: slotInfo.start,
            end: slotInfo.end,
            title: ''
        });
        setShowModal(true);
    };

    const handleSelectEvent = (event) => {
        if (!isLibrarian) return; // Invigilators can't edit exams
        setModalMode('edit');
        setSelectedEvent(event);
        setShowModal(true);
    };

    const handleSaveExam = async (examData) => {
        try {
            // Compute duration from startTime and endTime if both are provided
            let duration = parseInt(examData.duration) || 120;
            if (examData.startTime && examData.endTime) {
                const [sh, sm] = examData.startTime.split(':').map(Number);
                const [eh, em] = examData.endTime.split(':').map(Number);
                const computed = (eh * 60 + em) - (sh * 60 + sm);
                if (computed > 0) {
                    duration = computed;
                }
            }

            // Parse invigilatorId — must be a valid positive number (DB user ID)
            const parsedInvigilatorId = parseInt(examData.invigilatorId);
            if (!parsedInvigilatorId || parsedInvigilatorId <= 0) {
                setError('Invigilator ID must be a valid number (e.g., 1, 2, 3). Check the backend for available user IDs.');
                return;
            }

            const examPayload = {
                courseCode: examData.courseCode,
                courseName: examData.courseName,
                examDate: examData.date,
                startTime: examData.startTime,
                duration: duration,
                venue: examData.venue,
                invigilatorId: parsedInvigilatorId
            };

            if (modalMode === 'create') {
                const response = await apiService.createExam(examPayload);
                const savedExam = response.data;

                // Add to calendar
                const newEvent = {
                    id: savedExam.id,
                    title: `${examData.courseCode} - ${examData.courseName}`,
                    start: new Date(examData.date + 'T' + examData.startTime),
                    end: calculateEndTime(examData.date, examData.startTime, duration),
                    resource: {
                        ...examData,
                        ...savedExam,
                        duration: duration
                    }
                };
                setExams([...exams, newEvent]);
            } else {
                await apiService.updateExam(selectedEvent.id, examPayload);

                setExams(exams.map(exam =>
                    exam.id === selectedEvent.id
                        ? {
                            ...exam,
                            title: `${examData.courseCode} - ${examData.courseName}`,
                            start: new Date(examData.date + 'T' + examData.startTime),
                            end: calculateEndTime(examData.date, examData.startTime, duration),
                            resource: {
                                ...exam.resource,
                                ...examData,
                                duration: duration
                            }
                          }
                        : exam
                ));
            }
            setShowModal(false);
            setSelectedEvent(null);
            setError('');
        } catch (err) {
            console.error('Failed to save exam:', err);
            // Show the actual backend error message
            const msg = err.message || 'Unknown error';
            setError(`Failed to save exam: ${msg}`);
        }
    };

    const handleDeleteExam = async (examId) => {
        if (window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
            try {
                await apiService.deleteExam(examId);
                setExams(exams.filter(exam => exam.id !== examId));
                setShowModal(false);
                setSelectedEvent(null);
            } catch (err) {
                console.error('Failed to delete exam:', err);
                setError('Failed to delete exam. Please try again.');
            }
        }
    };

    const isExamInConflict = (examId) => {
        return conflicts.some(pair => pair.includes(examId));
    };

    const eventStyleGetter = (event) => {
        let backgroundColor = '#3174ad'; // Default blue

        if (isExamInConflict(event.id)) {
            backgroundColor = '#d9534f'; // Red for conflicts
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    if (loading) {
        return <div className="exam-scheduler-container"><p>Loading exams...</p></div>;
    }

    return (
        <div className="exam-scheduler-container">
            <div className="exam-scheduler-header">
                <div>
                    <h1>Exam Scheduler</h1>
                    {!isLibrarian && (
                        <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                            📅 Read-only view — only librarians can create or edit exams
                        </p>
                    )}
                </div>
                <button className="btn btn-exit" onClick={() => navigate(isLibrarian ? '/librarian' : '/')}>
                    ✕ Exit
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {conflicts.length > 0 && (
                <div className="conflict-warning-banner">
                    ⚠️ <strong>Scheduling Conflicts Detected!</strong> {conflicts.length} exam(s) have time or venue conflicts.
                    Conflicting exams are highlighted in red.
                </div>
            )}

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="filter-group">
                    <label>Date:</label>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="filter-input"
                    />
                </div>

                <div className="filter-group">
                    <label>Room/Venue:</label>
                    <input
                        type="text"
                        placeholder="Filter by room..."
                        value={filterRoom}
                        onChange={(e) => setFilterRoom(e.target.value)}
                        className="filter-input"
                    />
                </div>

                <div className="filter-group">
                    <label>Invigilator ID:</label>
                    <input
                        type="text"
                        placeholder="Filter by invigilator..."
                        value={filterInvigilator}
                        onChange={(e) => setFilterInvigilator(e.target.value)}
                        className="filter-input"
                    />
                </div>

                <div className="filter-group">
                    <label>Subject/Course:</label>
                    <input
                        type="text"
                        placeholder="Filter by course..."
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        className="filter-input"
                    />
                </div>

                <button
                    onClick={() => {
                        setFilterDate('');
                        setFilterRoom('');
                        setFilterInvigilator('');
                        setFilterSubject('');
                    }}
                    className="btn btn-secondary"
                >
                    Clear Filters
                </button>
            </div>

            {/* Calendar */}
            <div className="calendar-wrapper">
                <div className="calendar-watermark-container">
                    <div className="crescent-ring crescent-ring-1"></div>
                    <div className="crescent-ring crescent-ring-2"></div>
                    <div className="crescent-ring crescent-ring-3"></div>
                    <img src={logo} alt="" className="calendar-watermark" />
                </div>
                <Calendar
                    localizer={localizer}
                    events={filteredExams}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }}
                    onSelectSlot={isLibrarian ? handleSelectSlot : undefined}
                    onSelectEvent={isLibrarian ? handleSelectEvent : undefined}
                    selectable={isLibrarian}
                    popup
                    eventPropGetter={eventStyleGetter}
                    views={['month', 'week', 'day', 'agenda']}
                />
            </div>

            {/* Modal for creating/editing exams — librarians only */}
            {showModal && isLibrarian && (
                <ExamSchedulerModal
                    isOpen={showModal}
                    mode={modalMode}
                    event={selectedEvent}
                    onSave={handleSaveExam}
                    onDelete={handleDeleteExam}
                    invigilators={invigilators}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedEvent(null);
                    }}
                />
            )}
        </div>
    );
}

export default ExamSchedulerPage;

