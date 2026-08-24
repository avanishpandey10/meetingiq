/**
 * Helper Utilities
 */

/**
 * Format seconds as HH:MM:SS or MM:SS.
 */
export function formatTimestamp(
  seconds
) {
  if (
    seconds === null ||
    seconds === undefined ||
    !Number.isFinite(
      Number(seconds)
    ) ||
    Number(seconds) < 0
  ) {
    return '00:00';
  }

  const totalSeconds =
    Math.floor(
      Number(seconds)
    );

  const hours =
    Math.floor(
      totalSeconds / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    );

  const secs =
    totalSeconds % 60;

  if (hours > 0) {
    return (
      `${String(hours).padStart(2, '0')}:` +
      `${String(minutes).padStart(2, '0')}:` +
      `${String(secs).padStart(2, '0')}`
    );
  }

  return (
    `${String(minutes).padStart(2, '0')}:` +
    `${String(secs).padStart(2, '0')}`
  );
}

/**
 * Format duration for UI.
 */
export function formatDuration(
  seconds
) {
  if (
    seconds === null ||
    seconds === undefined ||
    !Number.isFinite(
      Number(seconds)
    ) ||
    Number(seconds) <= 0
  ) {
    return '0:00';
  }

  const totalSeconds =
    Math.floor(
      Number(seconds)
    );

  const hours =
    Math.floor(
      totalSeconds / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    );

  const secs =
    totalSeconds % 60;

  if (hours > 0) {
    return (
      `${hours}h ${minutes}m ${secs}s`
    );
  }

  return (
    `${minutes}m ${secs}s`
  );
}

/**
 * Generate a lightweight unique ID.
 */
export function generateId(
  prefix = 'id'
) {
  return (
    `${prefix}_` +
    `${Date.now()}_` +
    `${Math.random()
      .toString(36)
      .substring(2, 10)}`
  );
}

/**
 * Sanitize text for basic plain-text usage.
 *
 * NOTE:
 * This is not a replacement for HTML escaping.
 */
export function sanitizeText(
  text
) {
  if (
    text === null ||
    text === undefined
  ) {
    return '';
  }

  return String(text)
    .replace(
      /[<>]/g,
      ''
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}

/**
 * Extract common date formats from text.
 */
export function extractDates(
  text
) {
  if (
    typeof text !== 'string' ||
    !text.trim()
  ) {
    return [];
  }

  const datePatterns = [
    // 2026-08-20
    /\b\d{4}-\d{2}-\d{2}\b/g,

    // 20/08/2026 or 20-08-2026
    /\b\d{2}[/-]\d{2}[/-]\d{4}\b/g,

    // Aug 20, 2026
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,\s*|\s+)\d{4}\b/gi
  ];

  const dates = [];

  datePatterns.forEach(
    (pattern) => {
      const matches =
        text.match(pattern);

      if (matches) {
        dates.push(
          ...matches
        );
      }
    }
  );

  return [
    ...new Set(dates)
  ];
}

/**
 * Calculate percentage safely.
 */
export function calculatePercentage(
  value,
  total
) {
  const numericValue =
    Number(value);

  const numericTotal =
    Number(total);

  if (
    !Number.isFinite(
      numericValue
    ) ||
    !Number.isFinite(
      numericTotal
    ) ||
    numericTotal <= 0
  ) {
    return 0;
  }

  return Number(
    (
      (numericValue /
        numericTotal) *
      100
    ).toFixed(2)
  );
}