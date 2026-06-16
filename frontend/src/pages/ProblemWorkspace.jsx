import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Play, CheckCircle, Terminal as ConsoleIcon, AlertCircle, ArrowLeft } from 'lucide-react';

const JS_TEMPLATE = `// Read input from standard input
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();

function solve(input) {
    // Write your solution here
    
}

solve(input);`;

const PY_TEMPLATE = `import sys

def solve():
    # Read input from standard input
    input_data = sys.stdin.read().strip()
    # Write your solution here
    
    
if __name__ == '__main__':
    solve()`;


const CPP_TEMPLATE = `#include <bits/stdc++.h>
using namespace std;

void solve() {

}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}`;
const ProblemWorkspace = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState(JS_TEMPLATE);
    const [running, setRunning] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const data = await api.get(`/problems/${id}`);
                setProblem(data.problem);
            } catch (err) {
                setError(err.message || 'Failed to fetch problem');
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [id]);

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);

        if (lang === 'javascript') {
            setCode(JS_TEMPLATE);
        } else if (lang === 'python') {
            setCode(PY_TEMPLATE);
        } else if (lang === 'cpp') {
            setCode(CPP_TEMPLATE);
        }
    };

    const handleRun = async () => {
        const token = localStorage.getItem('token');
        setRunning(true);
        setConsoleOutput(null);
        try {
            const result = await api.post(`/problems/${id}/run`, { language, code });
            setConsoleOutput({
                type: 'run',
                success: result.success,
                passed: result.passed,
                stdout: result.stdout,
                stderr: result.stderr,
                errorType: result.errorType,
                expectedOutput: result.expectedOutput
            });
        } catch (err) {
            setConsoleOutput({
                type: 'run',
                success: false,
                passed: false,
                stderr: err.message
            });
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!token) {
            alert("Please login first to submit code.");
            return;
        }
        setSubmitting(true);
        setConsoleOutput(null);
        try {
            const result = await api.post(`/problems/${id}/submit`, { language, code });
            const submission = result.submission;
            setConsoleOutput({
                type: 'submit',
                status: submission.status,
                errorMessage: submission.errorMessage,
                testResults: submission.testResults
            });
        } catch (err) {
            setConsoleOutput({
                type: 'submit',
                status: 'Error',
                errorMessage: err.message
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner" style={{ width: '3rem', height: '3rem', borderTopColor: 'var(--primary)' }}></div>
            </div>
        );
    }

    if (error || !problem) {
        return (
            <div className="main-content">
                <div className="alert alert-error">
                    <AlertCircle size={18} />
                    <div>{error || 'Problem not found'}</div>
                </div>
                <Link to="/problems" className="btn btn-secondary">
                    <ArrowLeft size={16} /> Back to Problems
                </Link>
            </div>
        );
    }

    return (
        <div className="workspace">
            {/* Left Pane: Problem Description */}
            <div className="pane">
                <div className="pane-header">
                    <Link to="/problems" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                        <ArrowLeft size={14} /> Back
                    </Link>
                    <span>Description</span>
                    <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
                </div>
                <div className="pane-body">
                    <div className="problem-title-section">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{problem.title}</h2>
                    </div>

                    <div className="problem-text" style={{ marginBottom: '1.5rem' }}>
                        {problem.description}
                    </div>

                    <h4 className="problem-section-title">Input Format</h4>
                    <div className="problem-text">{problem.inputFormat}</div>

                    <h4 className="problem-section-title">Output Format</h4>
                    <div className="problem-text">{problem.outputFormat}</div>

                    {problem.constraints && (
                        <>
                            <h4 className="problem-section-title">Constraints</h4>
                            <pre className="code-block" style={{ fontSize: '0.9rem' }}>{problem.constraints}</pre>
                        </>
                    )}

                    <h4 className="problem-section-title">Sample Input</h4>
                    <pre className="code-block">{problem.sampleInput}</pre>

                    <h4 className="problem-section-title">Sample Output</h4>
                    <pre className="code-block">{problem.sampleOutput}</pre>
                </div>
            </div>

            {/* Right Pane: Code Editor */}
            <div className="pane">
                <div className="pane-header">
                    <span>Code Editor</span>
                    <div className="editor-header-controls">
                        <select className="editor-select" value={language} onChange={handleLanguageChange}>
                            <option value="javascript">JavaScript (Node.js)</option>
                            <option value="python">Python 3</option>
                            <option value="cpp">C++17</option>
                        </select>
                    </div>
                </div>
                
                <div className="editor-container">
                    <textarea
                        className="code-textarea"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Write your code here..."
                        spellCheck={false}
                    />

                    {/* Console & Results Panel */}
                    <div className="console-panel">
                        <div className="console-header">
                            <span>Test Results</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-secondary" onClick={handleRun} disabled={running || submitting} style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
                                    {running ? <div className="spinner"></div> : <Play size={12} />}
                                    Run Code
                                </button>
                                <button className="btn btn-primary" onClick={handleSubmit} disabled={running || submitting} style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
                                    {submitting ? <div className="spinner"></div> : <CheckCircle size={12} />}
                                    Submit Code
                                </button>
                            </div>
                        </div>

                        <div className="console-body">
                            {/* Running or Submitting Loader */}
                            {(running || submitting) && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                    <div className="spinner" style={{ borderTopColor: 'var(--primary)' }}></div>
                                    <span>Evaluating on judgment engine...</span>
                                </div>
                            )}

                            {/* No Run Console Yet */}
                            {!running && !submitting && !consoleOutput && (
                                <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ConsoleIcon size={16} />
                                    <span>Run or Submit your solution to evaluate correctness.</span>
                                </div>
                            )}

                            {/* Code Run Result */}
                            {consoleOutput && consoleOutput.type === 'run' && (
                                <div>
                                    {consoleOutput.passed ? (
                                        <div className="badge badge-accepted" style={{ marginBottom: '0.5rem' }}>Sample Test Case Passed</div>
                                    ) : (
                                        <div className="badge badge-wa" style={{ marginBottom: '0.5rem' }}>
                                            {consoleOutput.errorType || 'Sample Test Case Failed'}
                                        </div>
                                    )}

                                    {consoleOutput.stdout && (
                                        <div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Your Output:</div>
                                            <pre className="console-stdout">{consoleOutput.stdout}</pre>
                                        </div>
                                    )}

                                    {consoleOutput.expectedOutput && !consoleOutput.passed && (
                                        <div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Expected Output:</div>
                                            <pre className="console-stdout" style={{ color: 'var(--text-muted)' }}>{consoleOutput.expectedOutput}</pre>
                                        </div>
                                    )}

                                    {consoleOutput.stderr && (
                                        <div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Error / Stderr:</div>
                                            <pre className="console-stderr">{consoleOutput.stderr}</pre>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Code Submission Result */}
                            {consoleOutput && consoleOutput.type === 'submit' && (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <span style={{ fontWeight: 700 }}>Verdict:</span>
                                        <span className={`badge badge-${consoleOutput.status === 'Accepted' ? 'accepted' : consoleOutput.status === 'Wrong Answer' ? 'wa' : 'tle'}`}>
                                            {consoleOutput.status}
                                        </span>
                                    </div>

                                    {consoleOutput.errorMessage && (
                                        <pre className="console-stderr" style={{ marginBottom: '1rem' }}>{consoleOutput.errorMessage}</pre>
                                    )}

                                    {consoleOutput.testResults && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {consoleOutput.testResults.map((tc, idx) => (
                                                <div
                                                    key={idx}
                                                    className="badge"
                                                    style={{
                                                        backgroundColor: tc.passed ? 'var(--success-bg)' : 'var(--error-bg)',
                                                        color: tc.passed ? 'var(--success)' : 'var(--error)',
                                                        border: `1px solid ${tc.passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                                        cursor: 'pointer'
                                                    }}
                                                    title={`Input: ${tc.input} | Expected: ${tc.expectedOutput} | Actual: ${tc.actualOutput}`}
                                                    onClick={() => alert(`Test Case #${idx + 1}\n\nInput:\n${tc.input}\n\nExpected Output:\n${tc.expectedOutput}\n\nYour Output:\n${tc.actualOutput || 'No output'}\n\nPassed: ${tc.passed ? 'Yes' : 'No'}`)}
                                                >
                                                    TC #{idx + 1}: {tc.passed ? 'PASSED' : 'FAILED'}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemWorkspace;
