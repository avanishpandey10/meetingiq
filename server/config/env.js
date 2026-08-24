import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
 * Load .env from:
 * 1. server/.env
 * 2. project root/.env
 */
dotenv.config({
  path: path.join(__dirname, '../.env')
});

dotenv.config({
  path: path.join(__dirname, '../../.env'),
  override: false
});

// ------------------------------------------------------------
// HELPER FUNCTIONS
// ------------------------------------------------------------

function parsePositiveInteger(
  value,
  fallback
) {
  const parsed =
    Number.parseInt(
      value,
      10
    );

  return Number.isFinite(parsed) &&
    parsed > 0
    ? parsed
    : fallback;
}

function parseBoolean(
  value,
  fallback = false
) {
  if (
    typeof value !== 'string'
  ) {
    return fallback;
  }

  return (
    value.toLowerCase() === 'true'
  );
}

// ------------------------------------------------------------
// ENVIRONMENT CONFIG
// ------------------------------------------------------------

export const env = {

  // ----------------------------------------------------------
  // SERVER
  // ----------------------------------------------------------

  NODE_ENV:
    process.env.NODE_ENV ||
    'development',

  PORT:
    parsePositiveInteger(
      process.env.PORT,
      3000
    ),

  CLIENT_URL:
    process.env.CLIENT_URL ||
    'http://localhost:5173',

  // ----------------------------------------------------------
  // DATABASE
  // ----------------------------------------------------------

  MONGODB_URI:
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/meetingiq',

  // ----------------------------------------------------------
  // GROQ
  // ----------------------------------------------------------

  GROQ_API_KEY:
    process.env.GROQ_API_KEY ||
    '',

  GROQ_MODEL:
    process.env.GROQ_MODEL ||
    'openai/gpt-oss-120b',

  GROQ_ASR_MODEL:
    process.env.GROQ_ASR_MODEL ||
    'whisper-large-v3-turbo',

  GROQ_MAX_TOKENS:
    parsePositiveInteger(
      process.env.GROQ_MAX_TOKENS,
      4000
    ),

  // ----------------------------------------------------------
  // PROVIDERS
  // ----------------------------------------------------------

  LLM_PROVIDER:
    (
      process.env.LLM_PROVIDER ||
      'groq'
    ).toLowerCase(),

  ASR_PROVIDER:
    (
      process.env.ASR_PROVIDER ||
      'groq'
    ).toLowerCase(),

  // ----------------------------------------------------------
  // FILE UPLOAD
  // ----------------------------------------------------------

  /*
   * Groq free-tier transcription upload
   * limit is 25 MB.
   */
  MAX_FILE_SIZE:
    parsePositiveInteger(
      process.env.MAX_FILE_SIZE,
      25
    ) * 1024 * 1024,

  ALLOWED_AUDIO_FORMATS: [
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
  ],

  // ----------------------------------------------------------
  // DEMO MODE
  // ----------------------------------------------------------

  DEMO_MODE:
    parseBoolean(
      process.env.DEMO_MODE,
      false
    ),

  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  validate() {

    console.log(
      '========================================'
    );

    console.log(
      'MeetingIQ Environment Configuration'
    );

    console.log(
      '========================================'
    );

    console.log(
      'NODE_ENV:',
      this.NODE_ENV
    );

    console.log(
      'PORT:',
      this.PORT
    );

    console.log(
      'CLIENT_URL:',
      this.CLIENT_URL
    );

    console.log(
      'MONGODB_URI:',
      this.MONGODB_URI
        ? 'Configured'
        : 'Not configured'
    );

    console.log(
      'GROQ_API_KEY:',
      this.GROQ_API_KEY
        ? 'Configured'
        : 'Not configured'
    );

    console.log(
      'GROQ_MODEL:',
      this.GROQ_MODEL
    );

    console.log(
      'GROQ_ASR_MODEL:',
      this.GROQ_ASR_MODEL
    );

    console.log(
      'LLM_PROVIDER:',
      this.LLM_PROVIDER
    );

    console.log(
      'ASR_PROVIDER:',
      this.ASR_PROVIDER
    );

    console.log(
      'MAX_FILE_SIZE:',
      `${this.MAX_FILE_SIZE / (1024 * 1024)} MB`
    );

    console.log(
      'DEMO_MODE:',
      this.DEMO_MODE
    );

    console.log(
      '========================================'
    );

    const errors = [];

    // --------------------------------------------------------
    // DATABASE
    // --------------------------------------------------------

    if (!this.MONGODB_URI) {
      errors.push(
        'MONGODB_URI is required.'
      );
    }

    // --------------------------------------------------------
    // DEMO MODE
    // --------------------------------------------------------

    if (this.DEMO_MODE) {

      console.log(
        '🔄 Demo mode enabled.'
      );

      console.log(
        'Mock ASR/LLM services will be used.'
      );

    } else {

      // ------------------------------------------------------
      // GROQ API KEY
      // ------------------------------------------------------

      if (!this.GROQ_API_KEY) {
        errors.push(
          'GROQ_API_KEY is required when DEMO_MODE=false.'
        );
      }

      // ------------------------------------------------------
      // PROVIDERS
      // ------------------------------------------------------

      if (
        !['groq', 'mock'].includes(
          this.LLM_PROVIDER
        )
      ) {
        errors.push(
          `Unsupported LLM_PROVIDER: ${this.LLM_PROVIDER}. Use "groq" or "mock".`
        );
      }

      if (
        !['groq', 'mock'].includes(
          this.ASR_PROVIDER
        )
      ) {
        errors.push(
          `Unsupported ASR_PROVIDER: ${this.ASR_PROVIDER}. Use "groq" or "mock".`
        );
      }

      console.log(
        '✅ Real Groq mode configured.'
      );
    }

    // --------------------------------------------------------
    // FINAL VALIDATION
    // --------------------------------------------------------

    if (errors.length > 0) {

      console.error(
        '❌ Environment validation failed:'
      );

      errors.forEach(
        (error) => {
          console.error(
            `   - ${error}`
          );
        }
      );

      throw new Error(
        'Invalid environment configuration.'
      );
    }

    console.log(
      '✅ Environment configuration is valid.'
    );

    return true;
  }
};