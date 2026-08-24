import React from 'react';

import {
  Routes,
  Route,
  Navigate,
  Link,
  useLocation
} from 'react-router-dom';

import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import MeetingPage from './pages/MeetingPage';
import HistoryPage from './pages/HistoryPage';
import ActionTrackerPage from './pages/ActionTrackerPage';
import EvaluationPage from './pages/EvaluationPage';
import NotFoundPage from './pages/NotFoundPage';

import ErrorBoundary from './components/common/ErrorBoundary';

import {
  DashboardIcon,
  UploadIcon,
  ActionIcon,
  HistoryIcon,
  BarChartIcon,
  MicIcon
} from './components/common/Icons';

import './App.css';

function App() {
  const location = useLocation();

  const isActive = (path) => {
    const currentPath = location.pathname;

    if (path === '/dashboard') {
      return currentPath === '/dashboard';
    }

    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const getNavClass = (path) => {
    return isActive(path) ? 'nav-link active' : 'nav-link';
  };

  return (
    <div className="app">
      {/* NAVBAR */}
      <nav className="navbar" aria-label="Main navigation">
        <div className="nav-container">
          <Link to="/dashboard" className="nav-brand">
            <span className="brand-icon" aria-hidden="true">
              <MicIcon size={24} color="#4f46e5" />
            </span>
            <span className="brand-text">MeetingIQ</span>
          </Link>

          <div className="nav-links">
            <Link to="/dashboard" className={getNavClass('/dashboard')}>
              <DashboardIcon size={18} />
              <span>Dashboard</span>
            </Link>

            <Link to="/upload" className={getNavClass('/upload')}>
              <UploadIcon size={18} />
              <span>Upload</span>
            </Link>

            <Link to="/actions" className={getNavClass('/actions')}>
              <ActionIcon size={18} />
              <span>Action Items</span>
            </Link>

            <Link to="/history" className={getNavClass('/history')}>
              <HistoryIcon size={18} />
              <span>History</span>
            </Link>

            <Link to="/evaluation" className={getNavClass('/evaluation')}>
              <BarChartIcon size={18} />
              <span>Evaluation</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <ErrorBoundary>
          <Routes>
            {/* Root */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Upload */}
            <Route path="/upload" element={<UploadPage />} />

            {/* Meeting */}
            <Route path="/meetings/:id" element={<MeetingPage />} />

            {/* History */}
            <Route path="/history" element={<HistoryPage />} />

            {/* Action Tracker */}
            <Route path="/actions" element={<ActionTrackerPage />} />

            {/* Evaluation */}
            <Route path="/evaluation" element={<EvaluationPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <p>
            &copy; {new Date().getFullYear()} MeetingIQ — AI Meeting
            Intelligence & Action Tracker
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;