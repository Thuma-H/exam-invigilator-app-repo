import React, { useState } from 'react';
import './AddStudentModal.css';

const AddStudentModal = ({ isOpen, onClose, onAddStudent, examId, examName }) => {
    const [studentId, setStudentId] = useState('');
    const [fullName, setFullName] = useState('');
    const [program, setProgram] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!studentId.trim() || !fullName.trim() || !program.trim()) {
            setError('Student ID, Full Name, and Program are required');
            return;
        }

        setLoading(true);
        try {
            await onAddStudent({
                studentId: studentId.trim(),
                fullName: fullName.trim(),
                program: program.trim(),
                email: email.trim() || null,
                examId
            });

            // Reset form
            setStudentId('');
            setFullName('');
            setProgram('');
            setEmail('');
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to add student');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Student to Exam</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <div className="exam-info">
                        <strong>Exam:</strong> {examName}
                    </div>

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">!</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="studentId">Student ID *</label>
                            <input
                                type="text"
                                id="studentId"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                placeholder="e.g., BCS25165344"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fullName">Full Name *</label>
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="e.g., John Doe"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="program">Program *</label>
                            <input
                                type="text"
                                id="program"
                                value={program}
                                onChange={(e) => setProgram(e.target.value)}
                                placeholder="e.g., Computer Science"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g., student@university.edu"
                                disabled={loading}
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Adding...' : 'Add Student'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddStudentModal;
