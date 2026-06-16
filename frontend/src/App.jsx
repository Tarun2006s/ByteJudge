import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ProblemList from './pages/ProblemList';
import ProblemWorkspace from './pages/ProblemWorkspace';
import ProblemCreate from './pages/ProblemCreate';
import SubmissionList from './pages/SubmissionList';
import SubmissionDetails from './pages/SubmissionDetails';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/problems" replace />} />
          <Route path="/problems" element={<ProblemList />} />
          <Route path="/problems/new" element={
            <ProtectedRoute>
              <ProblemCreate />
            </ProtectedRoute>
          } />
          <Route path="/problems/:id" element={<ProblemWorkspace />} />
          <Route path="/problems/:id/edit" element={
            <ProtectedRoute>
              <ProblemCreate />
            </ProtectedRoute>
          } />
          <Route path="/submissions" element={
            <ProtectedRoute>
              <SubmissionList />
            </ProtectedRoute>
          } />
          <Route path="/submissions/:id" element={
            <ProtectedRoute>
              <SubmissionDetails />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/problems" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
