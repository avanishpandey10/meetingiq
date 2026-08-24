import React from 'react';
import { Link } from 'react-router-dom';

import { MicIcon, UploadIcon, ArrowRightIcon } from '../common/Icons';

import './UploadCTA.css';

const UploadCTA = () => {
  return (
    <div className="upload-cta">
      <div className="upload-cta-content">
        <div className="upload-cta-icon">
          <MicIcon size={40} color="#4f46e5" />
        </div>

        <div className="upload-cta-text">
          <h2>Summarize a Meeting</h2>

          <p>
            Upload your meeting audio and let
            MeetingIQ generate the transcript,
            summary, decisions, risks, and action items.
          </p>
        </div>

        <Link
          to="/upload"
          className="upload-cta-button"
        >
          <UploadIcon size={16} />
          Upload Meeting
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    </div>
  );
};

export default UploadCTA;