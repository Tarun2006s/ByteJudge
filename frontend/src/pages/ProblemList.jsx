import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Search, Plus, Trash2, Edit, AlertTriangle } from 'lucide-react';

const ProblemList = () => {
    const [problems, setProblems] = useState([]);
    const [search, setSearch] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');
    
    // Get current user details to check if they are the creator
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchProblems = async () => {
        try {
            const data = await api.get('/problems');
            setProblems(data.problems || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch problems');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProblems();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this problem?")) return;
        try {
            await api.delete(`/problems/${id}`);
            setProblems(problems.filter(p => p._id !== id));
        } catch (err) {
            alert(err.message || 'Failed to delete problem');
        }
    };

    const filteredProblems = problems.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
        const matchesDifficulty = difficultyFilter === '' || p.difficulty === difficultyFilter;
        return matchesSearch && matchesDifficulty;
    });

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner" style={{ width: '3rem', height: '3rem', borderTopColor: 'var(--primary)' }}></div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Coding Challenges</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Solve algorithm puzzles and test your programming skills.</p>
                </div>
                {token && (
                    <Link to="/problems/new" className="btn btn-primary">
                        <Plus size={18} />
                        Add New Problem
                    </Link>
                )}
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertTriangle size={18} />
                    <div>{error}</div>
                </div>
            )}

            {/* Search & Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search problems by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                    />
                    <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
                <select
                    className="form-input"
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    style={{ width: '150px' }}
                >
                    <option value="">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>

            {/* Problems Grid */}
            {filteredProblems.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                    No problems found matching your filters.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredProblems.map((problem) => (
                        <div key={problem._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                                        <Link to={`/problems/${problem._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                            {problem.title}
                                        </Link>
                                    </h3>
                                    <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>
                                        {problem.difficulty}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '800px', marginBottom: '0.5rem' }}>
                                    {problem.description}
                                </p>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Created by: <span style={{ color: 'var(--text-main)' }}>{problem.creator ? `${problem.creator.firstName} ${problem.creator.lastName}` : 'System'}</span>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                {token && problem.creator && problem.creator._id === currentUser.id && (
                                    <>
                                        <Link to={`/problems/${problem._id}/edit`} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                                            <Edit size={16} />
                                        </Link>
                                        <button className="btn btn-danger" onClick={() => handleDelete(problem._id)} style={{ padding: '0.5rem' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                                <Link to={`/problems/${problem._id}`} className="btn btn-primary">
                                    Solve Challenge
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProblemList;
