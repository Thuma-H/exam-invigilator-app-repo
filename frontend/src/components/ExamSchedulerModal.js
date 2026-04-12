import React, { useState, useEffect } from 'react';
import './ExamSchedulerModal.css';

function ExamSchedulerModal({ isOpen, mode, event, onSave, onDelete, onClose, invigilators = [] }) {
    const [formData, setFormData] = useState({
        courseCode: '',
        courseName: '',
        date: '',
        startTime: '09:00',
        endTime: '11:00',
        duration: 120,
        venue: '',
        invigilatorId: '',
        subject: ''
    });

    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (mode === 'edit' && event?.resource) {
            const resource = event.resource;
            const startDate = event.start ? event.start.toISOString().split('T')[0] : '';
            const startTime = event.start ? event.start.toTimeString().slice(0, 5) : '09:00';
            const endTime = event.end ? event.end.toTimeString().slice(0, 5) : '11:00';

            setFormData({
                courseCode: resource.courseCode || '',
                courseName: resource.courseName || '',
                date: startDate,
                startTime: startTime,
                endTime: endTime,
                duration: resource.duration || 120,
                venue: resource.venue || '',
                invigilatorId: resource.invigilatorId || '',
                subject: resource.courseName || ''
            });
        } else if (mode === 'create' && event) {
            const startDate = event.start ? event.start.toISOString().split('T')[0] : '';
            const startTime = event.start ? event.start.toTimeString().slice(0, 5) : '09:00';
            const endTime = event.end ? event.end.toTimeString().slice(0, 5) : '11:00';

            setFormData({
                courseCode: '',
                courseName: '',
                date: startDate,
                startTime: startTime,
                endTime: endTime,
                duration: 120,
                venue: '',
                invigilatorId: '',
                subject: ''
            });
        }
        setValidationErrors({});
    }, [mode, event, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            // Auto-compute duration when start or end time changes
            if ((name === 'startTime' || name === 'endTime') && updated.startTime && updated.endTime) {
                const [sh, sm] = updated.startTime.split(':').map(Number);
                const [eh, em] = updated.endTime.split(':').map(Number);
                const computed = (eh * 60 + em) - (sh * 60 + sm);
                if (computed > 0) {
                    updated.duration = computed;
                }
            }

            return updated;
        });
        // Clear error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.courseCode.trim()) {
            errors.courseCode = 'Course code is required';
        }
        if (!formData.courseName.trim()) {
            errors.courseName = 'Course name is required';
        }
        if (!formData.date) {
            errors.date = 'Date is required';
        }
        if (!formData.startTime) {
            errors.startTime = 'Start time is required';
        }
        if (!formData.endTime) {
            errors.endTime = 'End time is required';
        }
        if (!formData.venue.trim()) {
            errors.venue = 'Venue/Room is required';
        }
        if (!formData.invigilatorId) {
            errors.invigilatorId = 'Invigilator is required';
        } else if (isNaN(parseInt(formData.invigilatorId)) || parseInt(formData.invigilatorId) <= 0) {
            errors.invigilatorId = 'Must be a valid user ID number (e.g., 1, 2, 3)';
        }

        // Validate time logic
        if (formData.startTime && formData.endTime) {
            if (formData.startTime >= formData.endTime) {
                errors.endTime = 'End time must be after start time';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = () => {
        if (validateForm()) {
            onSave(formData);
        }
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
            onDelete(event.id);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{mode === 'create' ? 'Create New Exam' : 'Edit Exam'}</h2>
                    <button className="close-button" onClick={onClose}>✕</button>
                </div>

                <form className="exam-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Course Code *</label>
                            <input
                                type="text"
                                name="courseCode"
                                value={formData.courseCode}
                                onChange={handleInputChange}
                                placeholder="e.g., CS101"
                                className={validationErrors.courseCode ? 'input-error' : ''}
                            />
                            {validationErrors.courseCode && (
                                <span className="error-text">{validationErrors.courseCode}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Course Name *</label>
                            <input
                                type="text"
                                name="courseName"
                                value={formData.courseName}
                                onChange={handleInputChange}
                                placeholder="e.g., Introduction to Computer Science"
                                className={validationErrors.courseName ? 'input-error' : ''}
                            />
                            {validationErrors.courseName && (
                                <span className="error-text">{validationErrors.courseName}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Exam Date *</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                className={validationErrors.date ? 'input-error' : ''}
                            />
                            {validationErrors.date && (
                                <span className="error-text">{validationErrors.date}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Start Time *</label>
                            <input
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleInputChange}
                                className={validationErrors.startTime ? 'input-error' : ''}
                            />
                            {validationErrors.startTime && (
                                <span className="error-text">{validationErrors.startTime}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>End Time *</label>
                            <input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleInputChange}
                                className={validationErrors.endTime ? 'input-error' : ''}
                            />
                            {validationErrors.endTime && (
                                <span className="error-text">{validationErrors.endTime}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Duration (minutes)</label>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                placeholder="120"
                                min="30"
                                max="480"
                            />
                        </div>

                        <div className="form-group">
                            <label>Venue/Room *</label>
                            <input
                                type="text"
                                name="venue"
                                value={formData.venue}
                                onChange={handleInputChange}
                                placeholder="e.g., Room 101"
                                className={validationErrors.venue ? 'input-error' : ''}
                            />
                            {validationErrors.venue && (
                                <span className="error-text">{validationErrors.venue}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Invigilator *</label>
                            {invigilators.length > 0 ? (
                                <select
                                    name="invigilatorId"
                                    value={formData.invigilatorId}
                                    onChange={handleInputChange}
                                    className={validationErrors.invigilatorId ? 'input-error' : ''}
                                >
                                    <option value="">-- Select Invigilator --</option>
                                    {invigilators.map(inv => (
                                        <option key={inv.id} value={inv.id}>
                                            {inv.fullName || inv.username} (@{inv.username}, ID: {inv.id})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="number"
                                    name="invigilatorId"
                                    value={formData.invigilatorId}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 1"
                                    min="1"
                                    className={validationErrors.invigilatorId ? 'input-error' : ''}
                                />
                            )}
                            {validationErrors.invigilatorId && (
                                <span className="error-text">{validationErrors.invigilatorId}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                placeholder="e.g., Mathematics"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSave}
                        >
                            {mode === 'create' ? 'Create Exam' : 'Update Exam'}
                        </button>

                        {mode === 'edit' && (
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleDelete}
                            >
                                Delete Exam
                            </button>
                        )}

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ExamSchedulerModal;

