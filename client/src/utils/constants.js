/**
 * Application Constants
 */

// ------------------------------------------------------------
// MEETING STATUS
// ------------------------------------------------------------

export const MEETING_STATUS = {
  UPLOADED: 'UPLOADED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

// ------------------------------------------------------------
// ACTION ITEM STATUS
// ------------------------------------------------------------

export const ACTION_ITEM_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

// ------------------------------------------------------------
// ACTION ITEM PRIORITY
// ------------------------------------------------------------

export const ACTION_ITEM_PRIORITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

// ------------------------------------------------------------
// RISK SEVERITY
// ------------------------------------------------------------

export const RISK_SEVERITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

// ------------------------------------------------------------
// SUPPORTED AUDIO FORMATS
// ------------------------------------------------------------

export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
  'audio/aiff'
];

// ------------------------------------------------------------
// MAX FILE SIZE
// ------------------------------------------------------------

export const MAX_FILE_SIZE =
  25 * 1024 * 1024;

// ------------------------------------------------------------
// PROCESSING STAGES
// ------------------------------------------------------------

export const PROCESSING_STAGES = [
  {
    id: 'uploaded',
    label: 'File Uploaded',
    progress: 5
  },

  {
    id: 'transcription',
    label: 'Transcribing Audio',
    progress: 20
  },

  {
    id: 'transcript_cleaning',
    label: 'Cleaning Transcript',
    progress: 40
  },

  {
    id: 'transcript_validation',
    label: 'Validating Transcript',
    progress: 50
  },

  {
    id: 'intelligence_extraction',
    label: 'Extracting Intelligence',
    progress: 70
  },

  {
    id: 'action_items',
    label: 'Processing Action Items',
    progress: 85
  },

  {
    id: 'completed',
    label: 'Complete',
    progress: 100
  }
];

// ------------------------------------------------------------
// API ENDPOINTS
// ------------------------------------------------------------

export const API_ENDPOINTS = {
  // Meetings
  UPLOAD_MEETING:
    '/meetings/upload',

  GET_MEETINGS:
    '/meetings',

  GET_MEETING:
    '/meetings/:id',

  DELETE_MEETING:
    '/meetings/:id',

  GET_TRANSCRIPT:
    '/meetings/:id/transcript',

  GET_ANALYSIS:
    '/meetings/:id/analysis',

  GET_STATUS:
    '/meetings/:id/status',

  // Export
  EXPORT_MEETING:
    '/export/meetings/:id/export',

  // Ask Meeting
  ASK_MEETING:
    '/ask/meetings/:id/ask',

  GET_SUGGESTIONS:
    '/ask/meetings/:id/suggestions',

  // Action Items
  GET_ACTION_ITEMS:
    '/action-items',

  GET_ACTION_ITEM:
    '/action-items/:id',

  UPDATE_ACTION_ITEM:
    '/action-items/:id',

  GET_ACTION_STATS:
    '/action-items/stats',

  // Analytics
  GET_ANALYTICS:
    '/analytics',

  GET_MEETING_ANALYTICS:
    '/analytics/meetings/:id'
};