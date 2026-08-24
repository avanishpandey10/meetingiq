import { logger } from '../utils/logger.js';

/**
 * Global Error Handler
 *
 * Centralizes error processing and response formatting.
 */
export function errorHandler(
  error,
  req,
  res,
  next
) {
  // Prevent headers from being sent twice.
  if (res.headersSent) {
    return next(error);
  }

  logger.error(
    'Error processing request',
    {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }
  );

  // ----------------------------------------------------------
  // MONGOOSE VALIDATION ERROR
  // ----------------------------------------------------------

  if (
    error.name ===
    'ValidationError'
  ) {
    const details =
      Object.values(
        error.errors || {}
      ).map((item) => ({
        field:
          item.path,
        message:
          item.message
      }));

    return res.status(400).json({
      error: 'Validation Error',
      message:
        'One or more fields are invalid.',
      details
    });
  }

  // ----------------------------------------------------------
  // INVALID MONGODB OBJECT ID
  // ----------------------------------------------------------

  if (
    error.name === 'CastError'
  ) {
    return res.status(400).json({
      error: 'Invalid ID',
      message:
        'The provided ID is invalid.'
    });
  }

  // ----------------------------------------------------------
  // DUPLICATE MONGODB ENTRY
  // ----------------------------------------------------------

  if (
    error.code === 11000
  ) {
    return res.status(409).json({
      error:
        'Duplicate Entry',
      message:
        'A record with this information already exists.'
    });
  }

  // ----------------------------------------------------------
  // MULTER ERROR
  // ----------------------------------------------------------

  if (
    error.name ===
    'MulterError'
  ) {
    if (
      error.code ===
      'LIMIT_FILE_SIZE'
    ) {
      return res.status(413).json({
        error:
          'File Too Large',
        message:
          'The uploaded audio file exceeds the allowed size.'
      });
    }

    return res.status(400).json({
      error:
        'Upload Error',
      message:
        error.message ||
        'The file upload failed.'
    });
  }

  // ----------------------------------------------------------
  // RATE LIMIT
  // ----------------------------------------------------------

  if (
    error.name ===
    'RateLimitError' ||
    error.statusCode === 429
  ) {
    return res.status(429).json({
      error:
        'Rate Limit Exceeded',
      message:
        'Too many requests. Please try again later.'
    });
  }

  // ----------------------------------------------------------
  // GEMINI / AI SERVICE ERRORS
  // ----------------------------------------------------------

  const lowerMessage =
    String(
      error.message || ''
    ).toLowerCase();

  if (
    lowerMessage.includes(
      'gemini'
    ) ||
    lowerMessage.includes(
      'ai service'
    ) ||
    lowerMessage.includes(
      'llm'
    ) ||
    lowerMessage.includes(
      'model'
    )
  ) {
    return res.status(502).json({
      error:
        'AI Service Error',
      message:
        'The AI service is temporarily unavailable. Please try again.'
    });
  }

  // ----------------------------------------------------------
  // ASR / TRANSCRIPTION ERRORS
  // ----------------------------------------------------------

  if (
    lowerMessage.includes(
      'asr'
    ) ||
    lowerMessage.includes(
      'transcription'
    ) ||
    lowerMessage.includes(
      'transcribe'
    )
  ) {
    return res.status(422).json({
      error:
        'Transcription Error',
      message:
        'Failed to transcribe the audio file. Please check the file and try again.'
    });
  }

  // ----------------------------------------------------------
  // FILE NOT FOUND
  // ----------------------------------------------------------

  if (
    error.code ===
    'ENOENT'
  ) {
    return res.status(404).json({
      error:
        'File Not Found',
      message:
        'The requested file was not found.'
    });
  }

  // ----------------------------------------------------------
  // EXPLICIT APPLICATION ERROR
  // ----------------------------------------------------------

  const statusCode =
    Number.isInteger(
      error.statusCode
    )
      ? error.statusCode
      : 500;

  const isProduction =
    process.env.NODE_ENV ===
    'production';

  return res
    .status(statusCode)
    .json({
      error:
        error.name ||
        'Internal Server Error',

      message: isProduction
        ? 'An unexpected error occurred.'
        : error.message ||
          'An unexpected error occurred.',

      ...(isProduction
        ? {}
        : {
            stack:
              error.stack
          })
    });
}