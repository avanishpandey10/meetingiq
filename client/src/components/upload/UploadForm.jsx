import React, { useRef, useState } from 'react';
import { meetingService } from '../../services/meetingService';
import './UploadForm.css';

const allowedFormats = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm', '.mp4', '.flac', '.aiff'];

const maxFileSize = 50 * 1024 * 1024; // 50 MB

const UploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const droppedFile = event.dataTransfer?.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target?.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    setUploadProgress(0);

    if (!selectedFile) return;

    const extension = `.${selectedFile.name.split('.').pop().toLowerCase()}`;

    if (!allowedFormats.includes(extension)) {
      setFile(null);
      setError(`Unsupported file format. Allowed: ${allowedFormats.join(', ')}`);
      return;
    }

    if (selectedFile.size > maxFileSize) {
      setFile(null);
      setError(`File too large. Maximum size is 50 MB. Your file is ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB.`);
      return;
    }

    if (selectedFile.type && !selectedFile.type.startsWith('audio/') && selectedFile.type !== 'video/mp4') {
      setFile(null);
      setError('The selected file does not appear to be a supported audio file.');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || uploading) return;

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const result = await meetingService.uploadMeeting(file, (progress) => {
        const numeric = Number(progress);
        setUploadProgress(Number.isFinite(numeric) ? Math.min(100, Math.max(0, numeric)) : 0);
      });

      if (typeof onUploadSuccess === 'function') {
        onUploadSuccess(result);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      const message = error?.response?.data?.message || error?.message || 'Upload failed. Please try again.';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    if (uploading) return;

    setFile(null);
    setUploadProgress(0);
    setError('');
    setDragActive(false);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="upload-form">
      <h2>Upload Meeting Audio</h2>

      <p className="upload-description">
        Upload your meeting recording and let MeetingIQ generate the transcript, summary, decisions, risks, and action items.
        <br />
        Maximum file size: 50 MB.
      </p>

      <div
        className={[
          'drop-zone',
          dragActive ? 'drag-active' : '',
          file ? 'has-file' : '',
          uploading ? 'uploading' : ''
        ].filter(Boolean).join(' ')}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (!file && !uploading) {
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && !file && !uploading) {
            inputRef.current?.click();
          }
        }}
        aria-label="Upload meeting audio"
      >
        {!file ? (
          <>
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <h3>Drag & drop your audio file here</h3>
            <p>or click to browse</p>

            <p className="format-info">
              Supported:
              <br />
              MP3, WAV, M4A, AAC, OGG, WebM, MP4, FLAC, AIFF
              <br />
              Maximum size: 50 MB
            </p>
          </>
        ) : (
          <div className="file-selected">
            <div className="file-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>

            <div className="file-details">
              <h4>{file.name}</h4>
              <p>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>

              {uploading && (
                <div className="upload-progress-container">
                  <div className="upload-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={uploadProgress}>
                    <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <span className="upload-progress-text">{Math.round(uploadProgress)}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={allowedFormats.join(',')}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </div>

      {error && (
        <div className="error-message" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {file && (
        <div className="button-group">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload & Analyze'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={uploading}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadForm;