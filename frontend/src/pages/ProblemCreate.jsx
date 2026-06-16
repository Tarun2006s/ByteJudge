import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Plus, Trash, ArrowLeft, AlertCircle, Save } from 'lucide-react';

const ProblemCreate = () => {
    const { id } = useParams(); // if id exists, it's Edit mode
    const isEditMode = !!id;
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('Easy');
    const [inputFormat, setInputFormat] = useState('');
    const [outputFormat, setOutputFormat] = useState('');
    const [constraints, setConstraints] = useState('');
    const [sampleInput, setSampleInput] = useState('');
    const [sampleOutput, setSampleOutput] = useState('');
    
    // List of test cases, at least one is required
    const [testCases, setTestCases] = useState([{ input: '', output: '' }]);
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            const fetchProblemDetails = async () => {
                setFetching(true);
                try {
                    const data = await api.get(`/problems/${id}`);
                    const p = data.problem;
                    setTitle(p.title);
                    setDescription(p.description);
                    setDifficulty(p.difficulty);
                    setInputFormat(p.inputFormat);
                    setOutputFormat(p.outputFormat);
                    setConstraints(p.constraints);
                    setSampleInput(p.sampleInput);
                    setSampleOutput(p.sampleOutput);
                    setTestCases(p.testCases && p.testCases.length > 0 ? p.testCases : [{ input: p.sampleInput, output: p.sampleOutput }]);
                } catch (err) {
                    setError(err.message || 'Failed to fetch problem data');
                } finally {
                    setFetching(false);
                }
            };
            fetchProblemDetails();
        }
    }, [id, isEditMode]);

    const handleAddTestCase = () => {
        setTestCases([...testCases, { input: '', output: '' }]);
    };

    const handleRemoveTestCase = (index) => {
        if (testCases.length === 1) {
            alert("At least one testcase is required");
            return;
        }
        setTestCases(testCases.filter((_, idx) => idx !== index));
    };

    const handleTestCaseChange = (index, field, value) => {
        const newTestCases = [...testCases];
        newTestCases[index][field] = value;
        setTestCases(newTestCases);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate test cases
        const hasEmptyTestCase = testCases.some(tc => !tc.input.trim() || !tc.output.trim());
        if (hasEmptyTestCase) {
            setError('All hidden test cases must have non-empty inputs and outputs.');
            setLoading(false);
            return;
        }

        const payload = {
            title,
            description,
            difficulty,
            inputFormat,
            outputFormat,
            constraints,
            sampleInput,
            sampleOutput,
            testCases
        };

        try {
            if (isEditMode) {
                await api.put(`/problems/${id}`, payload);
                alert("Problem updated successfully!");
            } else {
                await api.post('/problems', payload);
                alert("Problem created successfully!");
            }
            navigate('/problems');
        } catch (err) {
            setError(err.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="loading-container">
                <div className="spinner" style={{ width: '3rem', height: '3rem', borderTopColor: 'var(--primary)' }}></div>
            </div>
        );
    }

    return (
        <div className="main-content" style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <Link to="/problems" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> Back to Problems
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>
                    {isEditMode ? 'Edit Problem' : 'Create New Problem'}
                </h1>
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={18} />
                    <div>{error}</div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="card">
                <div className="form-group">
                    <label className="form-label">Problem Title</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Add Two Numbers"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <select
                        className="form-input"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                    >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Problem Description</label>
                    <textarea
                        className="form-input"
                        placeholder="Write a clear explanation of the task, inputs, and desired outputs..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={6}
                        required
                        style={{ resize: 'vertical', fontFamily: 'inherit' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">Input Format</label>
                        <textarea
                            className="form-input"
                            placeholder="Describe how the input will be structured..."
                            value={inputFormat}
                            onChange={(e) => setInputFormat(e.target.value)}
                            rows={3}
                            required
                            style={{ resize: 'vertical', fontFamily: 'inherit' }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Output Format</label>
                        <textarea
                            className="form-input"
                            placeholder="Describe what the output should look like..."
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value)}
                            rows={3}
                            required
                            style={{ resize: 'vertical', fontFamily: 'inherit' }}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Constraints (Optional)</label>
                    <textarea
                        className="form-input"
                        placeholder="e.g. 1 <= N <= 10^5"
                        value={constraints}
                        onChange={(e) => setConstraints(e.target.value)}
                        rows={2}
                        style={{ resize: 'vertical', fontFamily: 'Fira Code, monospace' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                    <div className="form-group">
                        <label className="form-label">Sample Input</label>
                        <textarea
                            className="form-input"
                            placeholder="Provide stdin for sample testcase..."
                            value={sampleInput}
                            onChange={(e) => setSampleInput(e.target.value)}
                            rows={3}
                            required
                            style={{ resize: 'vertical', fontFamily: 'Fira Code, monospace' }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Sample Output</label>
                        <textarea
                            className="form-input"
                            placeholder="Provide expected stdout for sample testcase..."
                            value={sampleOutput}
                            onChange={(e) => setSampleOutput(e.target.value)}
                            rows={3}
                            required
                            style={{ resize: 'vertical', fontFamily: 'Fira Code, monospace' }}
                        />
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Hidden Test Cases (for judging)</h3>
                        <button type="button" className="btn btn-secondary" onClick={handleAddTestCase} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                            <Plus size={14} /> Add Test Case
                        </button>
                    </div>

                    <div className="testcases-list">
                        {testCases.map((tc, idx) => (
                            <div key={idx} className="testcase-card">
                                <div className="testcase-header">
                                    <span>Test Case #{idx + 1}</span>
                                    <button type="button" className="btn btn-danger" onClick={() => handleRemoveTestCase(idx)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                                        <Trash size={12} /> Remove
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="form-label">Input</label>
                                        <textarea
                                            className="form-input"
                                            value={tc.input}
                                            onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                                            rows={2}
                                            required
                                            style={{ fontFamily: 'Fira Code, monospace' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Expected Output</label>
                                        <textarea
                                            className="form-input"
                                            value={tc.output}
                                            onChange={(e) => handleTestCaseChange(idx, 'output', e.target.value)}
                                            rows={2}
                                            required
                                            style={{ fontFamily: 'Fira Code, monospace' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? <div className="spinner"></div> : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Save size={18} />
                            <span>{isEditMode ? 'Update Problem' : 'Create Problem'}</span>
                        </div>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ProblemCreate;
