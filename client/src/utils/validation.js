/**
 * Frontend Validation Utilities
 */

// ------------------------------------------------------------
// EMAIL
// ------------------------------------------------------------

export function validateEmail(
  email
) {
  if (
    typeof email !==
    'string'
  ) {
    return false;
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(
    email.trim()
  );
}

// ------------------------------------------------------------
// FILE TYPE
// ------------------------------------------------------------

export function validateFileType(
  file,
  allowedTypes = []
) {
  if (
    !file ||
    !Array.isArray(
      allowedTypes
    )
  ) {
    return false;
  }

  /*
   * Normal browser MIME validation.
   */
  if (
    allowedTypes.includes(
      file.type
    )
  ) {
    return true;
  }

  /*
   * Some browsers may provide an
   * empty/less specific MIME type.
   * Fall back to file extension.
   */
  if (
    typeof file.name ===
    'string'
  ) {
    const extension =
      `.${file.name
        .split('.')
        .pop()
        .toLowerCase()}`;

    const extensionMap = {
      '.mp3': [
        'audio/mpeg',
        'audio/mp3'
      ],

      '.wav': [
        'audio/wav',
        'audio/x-wav'
      ],

      '.m4a': [
        'audio/mp4',
        'audio/x-m4a'
      ],

      '.aac': [
        'audio/aac'
      ],

      '.ogg': [
        'audio/ogg'
      ],

      '.webm': [
        'audio/webm'
      ],

      '.flac': [
        'audio/flac'
      ],

      '.aiff': [
        'audio/aiff'
      ],

      '.mp4': [
        'audio/mp4',
        'video/mp4'
      ]
    };

    return (
      Array.isArray(
        extensionMap[
          extension
        ]
      ) &&
      extensionMap[
        extension
      ].some(
        (type) =>
          allowedTypes.includes(
            type
          )
      )
    );
  }

  return false;
}

// ------------------------------------------------------------
// FILE SIZE
// ------------------------------------------------------------

export function validateFileSize(
  file,
  maxSize
) {
  if (
    !file ||
    !Number.isFinite(
      Number(maxSize)
    )
  ) {
    return false;
  }

  return (
    file.size <=
    Number(maxSize)
  );
}

// ------------------------------------------------------------
// QUESTION
// ------------------------------------------------------------

export function validateQuestion(
  question
) {
  if (
    typeof question !==
    'string'
  ) {
    return {
      isValid: false,
      error:
        'Question is required'
    };
  }

  const trimmed =
    question.trim();

  if (
    trimmed.length < 3
  ) {
    return {
      isValid: false,
      error:
        'Question must be at least 3 characters long'
    };
  }

  if (
    trimmed.length > 500
  ) {
    return {
      isValid: false,
      error:
        'Question must be less than 500 characters'
    };
  }

  return {
    isValid: true,
    error: null
  };
}