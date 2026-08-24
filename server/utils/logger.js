import fs from 'node:fs';
import path from 'node:path';
import {
  fileURLToPath
} from 'node:url';

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

const logDir =
  path.join(
    __dirname,
    '../../logs'
  );

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(
    logDir,
    {
      recursive: true
    }
  );
}

/**
 * Logger Utility
 *
 * Provides structured logging with:
 * DEBUG
 * INFO
 * WARN
 * ERROR
 */
class Logger {
  constructor() {
    this.levels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    };

    this.currentLevel =
      this.levels.INFO;

    this.logFile =
      path.join(
        logDir,
        'app.log'
      );
  }

  /**
   * Format log message.
   */
  formatMessage(
    level,
    message,
    context = {}
  ) {
    const timestamp =
      new Date().toISOString();

    const safeMessage =
      typeof message === 'string'
        ? message
        : String(message);

    let contextString =
      '';

    if (
      context &&
      typeof context ===
        'object' &&
      Object.keys(context)
        .length > 0
    ) {
      try {
        contextString =
          `\nContext: ${JSON.stringify(
            context,
            null,
            2
          )}`;
      } catch {
        contextString =
          '\nContext: [Unable to serialize context]';
      }
    }

    return (
      `[${timestamp}] ` +
      `[${level}] ` +
      `${safeMessage}` +
      `${contextString}\n`
    );
  }

  /**
   * Write to log file.
   */
  writeToFile(message) {
    try {
      fs.appendFileSync(
        this.logFile,
        message,
        'utf8'
      );
    } catch (error) {
      console.error(
        '❌ Failed to write to log file:',
        error.message
      );
    }
  }

  /**
   * Check if level should be logged.
   */
  shouldLog(level) {
    return (
      this.currentLevel <=
      this.levels[level]
    );
  }

  debug(
    message,
    context = {}
  ) {
    if (
      !this.shouldLog('DEBUG')
    ) {
      return;
    }

    const formatted =
      this.formatMessage(
        'DEBUG',
        message,
        context
      );

    console.debug(
      formatted.trimEnd()
    );

    this.writeToFile(
      formatted
    );
  }

  info(
    message,
    context = {}
  ) {
    if (
      !this.shouldLog('INFO')
    ) {
      return;
    }

    const formatted =
      this.formatMessage(
        'INFO',
        message,
        context
      );

    console.log(
      formatted.trimEnd()
    );

    this.writeToFile(
      formatted
    );
  }

  warn(
    message,
    context = {}
  ) {
    if (
      !this.shouldLog('WARN')
    ) {
      return;
    }

    const formatted =
      this.formatMessage(
        'WARN',
        message,
        context
      );

    console.warn(
      formatted.trimEnd()
    );

    this.writeToFile(
      formatted
    );
  }

  error(
    message,
    context = {}
  ) {
    if (
      !this.shouldLog('ERROR')
    ) {
      return;
    }

    const formatted =
      this.formatMessage(
        'ERROR',
        message,
        context
      );

    console.error(
      formatted.trimEnd()
    );

    this.writeToFile(
      formatted
    );
  }

  /**
   * Change current logging level.
   */
  setLevel(level) {
    const normalized =
      String(level || '')
        .toUpperCase();

    if (
      this.levels[
        normalized
      ] !== undefined
    ) {
      this.currentLevel =
        this.levels[
          normalized
        ];
    } else {
      this.warn(
        `Unknown log level: ${level}`
      );
    }
  }
}

export const logger =
  new Logger();