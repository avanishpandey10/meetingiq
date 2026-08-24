/**
 * Formatting Utilities
 */

// ------------------------------------------------------------
// DATE
// ------------------------------------------------------------

export function formatDate(
  dateString
) {
  if (!dateString) {
    return 'Unknown date';
  }

  const date =
    new Date(dateString);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return 'Unknown date';
  }

  return date.toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  );
}

// ------------------------------------------------------------
// DATE + TIME
// ------------------------------------------------------------

export function formatDateTime(
  dateString
) {
  if (!dateString) {
    return 'Unknown';
  }

  const date =
    new Date(dateString);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return 'Unknown';
  }

  return date.toLocaleString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  );
}

// ------------------------------------------------------------
// DURATION
// ------------------------------------------------------------

export function formatDuration(
  seconds
) {
  const numericSeconds =
    Number(seconds);

  if (
    !Number.isFinite(
      numericSeconds
    ) ||
    numericSeconds <= 0
  ) {
    return '0:00';
  }

  const totalSeconds =
    Math.floor(
      numericSeconds
    );

  const hours =
    Math.floor(
      totalSeconds / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) /
        60
    );

  const secs =
    totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(
      minutes
    ).padStart(
      2,
      '0'
    )}:${String(
      secs
    ).padStart(
      2,
      '0'
    )}`;
  }

  return `${minutes}:${String(
    secs
  ).padStart(
    2,
    '0'
  )}`;
}

// ------------------------------------------------------------
// TIMESTAMP
// ------------------------------------------------------------

export function formatTimestamp(
  seconds
) {
  const numericSeconds =
    Number(seconds);

  if (
    !Number.isFinite(
      numericSeconds
    ) ||
    numericSeconds < 0
  ) {
    return '00:00';
  }

  const totalSeconds =
    Math.floor(
      numericSeconds
    );

  const hours =
    Math.floor(
      totalSeconds / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) /
        60
    );

  const secs =
    totalSeconds % 60;

  if (hours > 0) {
    return `${String(
      hours
    ).padStart(
      2,
      '0'
    )}:${String(
      minutes
    ).padStart(
      2,
      '0'
    )}:${String(
      secs
    ).padStart(
      2,
      '0'
    )}`;
  }

  return `${String(
    minutes
  ).padStart(
    2,
    '0'
  )}:${String(
    secs
  ).padStart(
    2,
    '0'
  )}`;
}

// ------------------------------------------------------------
// FILE SIZE
// ------------------------------------------------------------

export function formatFileSize(
  bytes
) {
  const numericBytes =
    Number(bytes);

  if (
    !Number.isFinite(
      numericBytes
    ) ||
    numericBytes <= 0
  ) {
    return '0 B';
  }

  const sizes = [
    'B',
    'KB',
    'MB',
    'GB'
  ];

  const index = Math.min(
    Math.floor(
      Math.log(
        numericBytes
      ) /
        Math.log(1024)
    ),
    sizes.length - 1
  );

  const value =
    numericBytes /
    Math.pow(
      1024,
      index
    );

  return `${value.toFixed(
    index === 0 ? 0 : 1
  )} ${sizes[index]}`;
}