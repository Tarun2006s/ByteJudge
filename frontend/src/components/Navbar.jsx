import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Terminal, BookOpen, History, PlusCircle, LogOut, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">
                <Terminal size={24} />
                <span>ByteJudge</span>
            </Link>
            
            <ul className="nav-links">
                <li>
                    <NavLink to="/problems" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
                        <BookOpen size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        Problems
                    </NavLink>
                </li>
                {token && (
                    <>
                        <li>
                            <NavLink to="/submissions" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                <History size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                Submissions
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/problems/new" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                <PlusCircle size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                Add Problem
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>

            <div className="nav-auth">
                {token ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Hi, <strong style={{ color: 'var(--text-main)' }}>{user.firstName || 'User'}</strong>
                        </span>
                        <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                            <LogOut size={14} />
                            Logout
                        </button>
                    </div>
                ) : (
                    <>
                        <Link to="/login" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                            <LogIn size={14} />
                            Login
                        </Link>
                        <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                            <UserPlus size={14} />
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
