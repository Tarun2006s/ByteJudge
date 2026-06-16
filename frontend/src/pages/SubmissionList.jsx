import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Clock, Code, AlertTriangle, Eye } from 'lucide-react';

const SubmissionList = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSubmissions = async () => {
        try {
            const data = await api.get('/submissions');
            setSubmissions(data.submissions || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch submissions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Accepted': return 'accepted';
            case 'Wrong Answer': return 'wa';
            case 'Time Limit Exceeded': return 'tle';
            default: return 'wa'; // for compilation/runtime error
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString();
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner" style={{ width: '3rem', height: '3rem', borderTopColor: 'var(--primary)' }}></div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Submission History</h1>
                <p style={{ color: 'var(--text-muted)' }}>Browse public submissions and review performance outputs.</p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertTriangle size={18} />
                    <div>{error}</div>
                </div>
            )}

            {submissions.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                    No submissions have been recorded yet.
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Problem</th>
                                <th>User</th>
                                <th>Language</th>
                                <th>Status</th>
                                <th>Submitted At</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((sub) => (
                                <tr key={sub._id}>
                                    <td style={{ fontWeight: 600 }}>
                                        <Link to={`/problems/${sub.problem?._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                            {sub.problem?.title || 'Unknown Problem'}
                                        </Link>
                                    </td>
                                    <td>
                                        {sub.user ? `${sub.user.firstName} ${sub.user.lastName}` : 'Anonymous'}
                                    </td>
                                    <td>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            <Code size={14} />
                                            {sub.language}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${getStatusClass(sub.status)}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            <Clock size={14} />
                                            {formatDate(sub.submittedAt)}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={`/submissions/${sub._id}`} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                                            <Eye size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                            <span>View</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SubmissionList;
