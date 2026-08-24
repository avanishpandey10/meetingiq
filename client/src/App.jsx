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
import NotFoundPage from './pages/NotFoundPage';

import ErrorBoundary from './components/common/ErrorBoundary';

import './App.css';

function App() {
  const location =
    useLocation();

  const isActive = (
    path
  ) => {
    const currentPath =
      location.pathname;

    /*
     * Exact match for dashboard,
     * prefix match for nested pages.
     */
    if (path === '/dashboard') {
      return (
        currentPath ===
        '/dashboard'
      );
    }

    return (
      currentPath === path ||
      currentPath.startsWith(
        `${path}/`
      )
    );
  };

  const getNavClass = (
    path
  ) => {
    return isActive(path)
      ? 'nav-link active'
      : 'nav-link';
  };

  return (
    <div className="app">
      {/* -----------------------------------------------------
          NAVBAR
      ----------------------------------------------------- */}

      <nav
        className="navbar"
        aria-label="Main navigation"
      >
        <div className="nav-container">
          <Link
            to="/dashboard"
            className="nav-brand"
          >
            <span
              className="brand-icon"
              aria-hidden="true"
            >
              🎯
            </span>

            <span className="brand-text">
              MeetingIQ
            </span>
          </Link>

          <div className="nav-links">
            <Link
              to="/dashboard"
              className={getNavClass(
                '/dashboard'
              )}
            >
              <span
                className="nav-icon"
                aria-hidden="true"
              >
                📊
              </span>

              <span>
                Dashboard
              </span>
            </Link>

            <Link
              to="/upload"
              className={getNavClass(
                '/upload'
              )}
            >
              <span
                className="nav-icon"
                aria-hidden="true"
              >
                ⬆️
              </span>

              <span>
                Upload
              </span>
            </Link>

            <Link
              to="/actions"
              className={getNavClass(
                '/actions'
              )}
            >
              <span
                className="nav-icon"
                aria-hidden="true"
              >
                ✅
              </span>

              <span>
                Action Items
              </span>
            </Link>

            <Link
              to="/history"
              className={getNavClass(
                '/history'
              )}
            >
              <span
                className="nav-icon"
                aria-hidden="true"
              >
                📅
              </span>

              <span>
                History
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* -----------------------------------------------------
          MAIN CONTENT
      ----------------------------------------------------- */}

      <main className="main-content">
        <ErrorBoundary>
          <Routes>
            {/* Root */}
            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <DashboardPage />
              }
            />

            {/* Upload */}
            <Route
              path="/upload"
              element={
                <UploadPage />
              }
            />

            {/* Meeting */}
            <Route
              path="/meetings/:id"
              element={
                <MeetingPage />
              }
            />

            {/* History */}
            <Route
              path="/history"
              element={
                <HistoryPage />
              }
            />

            {/* Action Tracker */}
            <Route
              path="/actions"
              element={
                <ActionTrackerPage />
              }
            />

            {/* 404 */}
            <Route
              path="*"
              element={
                <NotFoundPage />
              }
            />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* -----------------------------------------------------
          FOOTER
      ----------------------------------------------------- */}

      <footer className="footer">
        <div className="footer-container">
          <p>
            &copy;{' '}
            {new Date().getFullYear()}{' '}
            MeetingIQ — AI Meeting
            Intelligence & Action Tracker
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;