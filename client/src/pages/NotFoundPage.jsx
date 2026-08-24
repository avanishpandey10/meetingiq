import React from 'react';
import { Link } from 'react-router-dom';
import { AlertIcon, ArrowLeftIcon } from '../components/common/Icons';
import './NotFoundPage.css';

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <AlertIcon size={64} color="#4f46e5" />
        <div className="not-found-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/dashboard" className="btn btn-primary">
          <ArrowLeftIcon size={16} /> Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;