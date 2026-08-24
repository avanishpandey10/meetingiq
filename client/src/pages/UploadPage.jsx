import React, { useState } from 'react';
import UploadForm from '../components/upload/UploadForm';
import ProcessingView from '../components/upload/ProcessingView';
import { UploadIcon } from '../components/common/Icons';
import './UploadPage.css';

function UploadPage() {
  const [uploadedMeeting, setUploadedMeeting] = useState(null);
  
  const handleUploadSuccess = (result) => {
    setUploadedMeeting(result.meeting);
  };
  
  return (
    <div className="upload-page">
      <div className="page-header">
        <h1><UploadIcon size={28} color="#4f46e5" /> Upload Meeting</h1>
        <p>Transform your meeting audio into actionable intelligence</p>
      </div>
      
      {!uploadedMeeting ? (
        <UploadForm onUploadSuccess={handleUploadSuccess} />
      ) : (
        <ProcessingView meetingId={uploadedMeeting._id} />
      )}
    </div>
  );
}

export default UploadPage;