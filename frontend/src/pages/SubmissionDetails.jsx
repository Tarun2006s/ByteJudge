import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { ArrowLeft, Code, Clock, User, Award, AlertCircle } from 'lucide-react';

const SubmissionDetails = () => {
    const { id } = useParams();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const data = await api.get(`/submissions/${id}`);
                setSubmission(data.submission);
            } catch (err) {
                setError(err.message || 'Failed to fetch submission details');
            } finally {
                setLoading(false);
            }
        };
        fetchSubmission();
    }, [id]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Accepted': return 'accepted';
            case 'Wrong Answer': return 'wa';
            case 'Time Limit Exceeded': return 'tle';
            default: return 'wa';
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner" style={{ width: '3rem', height: '3rem', borderTopColor: 'var(--primary)' }}></div>
            </div>
        );
    }

    if (error || !submission) {
        return (
            <div className="main-content">
                <div className="alert alert-error">
                    <AlertCircle size={18} />
                    <div>{error || 'Submission not found'}</div>
                </div>
                <Link to="/submissions" className="btn btn-secondary">
                    <ArrowLeft size={16} /> Back to Submissions
                </Link>
            </div>
        );
    }

    const { problem, user, code, language, status, errorMessage, testResults, createdAt } = submission;

    return (
        <div className="main-content" style={{ maxWidth: '900px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <Link to="/submissions" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> Back to Submissions
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>Submission Details</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                
                {/* Left Side: Code & Diagnostics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Code Display */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Code size={18} />
                            <span>Submitted Code ({language})</span>
                        </h3>
                        <pre style={{
                            backgroundColor: 'var(--bg-darker)',
                            border: '1px solid var(--border-color)',
                            padding: '1.25rem',
                            borderRadius: 'var(--radius-md)',
                            fontFamily: 'Fira Code, monospace',
                            fontSize: '0.9rem',
                            color: '#38bdf8',
                            overflowX: 'auto',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {code}
                        </pre>
                    </div>

                    {/* Error Diagnostics if failed */}
                    {errorMessage && (
                        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--error)' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fca5a5' }}>
                                Error Message
                            </h3>
                            <pre className="console-stderr" style={{ backgroundColor: 'var(--bg-darker)', padding: '1rem', borderRadius: 'var(--radius-md)', fontFamily: 'Fira Code, monospace', fontSize: '0.85rem' }}>
                                {errorMessage}
                            </pre>
                        </div>
                    )}

                    {/* Test Cases Run Breakdown */}
                    {testResults && testResults.length > 0 && (
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Test Case Breakdown</h3>
                            <div className="testcases-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {testResults.map((tc, idx) => (
                                    <div key={idx} style={{
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '0.75rem 1rem',
                                        backgroundColor: 'rgba(0, 0, 0, 0.15)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <span style={{ fontWeight: 600, marginRight: '1rem' }}>Test Case #{idx + 1}</span>
                                            {tc.passed ? (
                                                <span className="badge badge-accepted">Passed</span>
                                            ) : (
                                                <span className="badge badge-wa">Failed</span>
                                            )}
                                        </div>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => alert(`Test Case #${idx + 1}\n\nInput:\n${tc.input}\n\nExpected Output:\n${tc.expectedOutput}\n\nYour Output:\n${tc.actualOutput || 'No output'}\n\nPassed: ${tc.passed ? 'Yes' : 'No'}`)}
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Meta Details Card */}
                <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Metadata</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                <Award size={14} /> Problem
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                                <Link to={`/problems/${problem?._id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                    {problem?.title || 'Unknown Problem'}
                                </Link>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                <User size={14} /> Submitting User
                            </div>
                            <div style={{ fontWeight: 600 }}>
                                {user ? `${user.firstName} ${user.lastName}` : 'Anonymous'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {user?.email}
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                <Award size={14} /> Verdict Status
                            </div>
                            <div>
                                <span className={`badge badge-${getStatusClass(status)}`} style={{ fontSize: '0.85rem', padding: '0.3rem 0.75rem' }}>
                                    {status}
                                </span>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                <Clock size={14} /> Submitted At
                            </div>
                            <div style={{ fontSize: '0.9rem' }}>
                                {new Date(createdAt).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SubmissionDetails;
