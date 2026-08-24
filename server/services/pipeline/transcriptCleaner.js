/**
 * Transcript Cleaning Service
 *
 * Improves transcript readability while preserving
 * the original meaning of the spoken content.
 *
 * IMPORTANT:
 * This service should not invent, paraphrase, or
 * silently change factual information.
 */

export const transcriptCleaner = {
  /**
   * Clean transcript segments.
   *
   * @param {Array} segments
   * @returns {Array} cleaned segments
   */
  cleanSegments(segments) {
    if (!Array.isArray(segments)) {
      throw new TypeError(
        'Transcript segments must be an array.'
      );
    }

    if (segments.length === 0) {
      return [];
    }

    const cleanedSegments = segments
      .map((segment, index) => {
        if (!segment) {
          return null;
        }

        return {
          ...segment,

          segmentId:
            segment.segmentId ||
            `seg_${index}`,

          speaker:
            segment.speaker ||
            'Unknown Speaker',

          text: this.cleanText(
            segment.text
          ),

          words:
            Array.isArray(segment.words)
              ? segment.words
              : []
        };
      })
      .filter(Boolean);

    // Merge only very short consecutive segments
    // from the same speaker.
    const mergedSegments =
      this.mergeShortSegments(
        cleanedSegments
      );

    // Remove empty segments.
    return mergedSegments.filter(
      (segment) =>
        typeof segment.text ===
          'string' &&
        segment.text.trim().length > 0
    );
  },

  /**
   * Clean individual transcript text.
   *
   * This function focuses on formatting/readability.
   * It deliberately avoids aggressive rewriting.
   */
  cleanText(text) {
    if (
      typeof text !== 'string' ||
      !text.trim()
    ) {
      return '';
    }

    let cleaned = text.trim();

    // Normalize whitespace.
    cleaned = cleaned.replace(
      /\s+/g,
      ' '
    );

    // Remove spaces before punctuation.
    cleaned = cleaned.replace(
      /\s+([.,!?;:])/g,
      '$1'
    );

    // Add a space after punctuation where missing.
    cleaned = cleaned.replace(
      /([.,!?;:])([A-Za-z])/g,
      '$1 $2'
    );

    /*
     * Common ASR normalization.
     *
     * These are intentionally limited to safe,
     * unambiguous contractions.
     */
    cleaned = cleaned
      .replace(/\bi\b/g, 'I')
      .replace(/\bim\b/gi, "I'm")
      .replace(/\bdont\b/gi, "don't")
      .replace(/\bcant\b/gi, "can't")
      .replace(/\bwont\b/gi, "won't")
      .replace(
        /\btheyre\b/gi,
        "they're"
      )
      .replace(
        /\byoure\b/gi,
        "you're"
      )
      .replace(
        /\bweve\b/gi,
        "we've"
      )
      .replace(
        /\bthats\b/gi,
        "that's"
      );

    /*
     * Capitalize the first character of the
     * transcript segment only.
     *
     * We don't aggressively capitalize every
     * sentence because the ASR punctuation may
     * not always be reliable.
     */
    if (
      cleaned.length > 0 &&
      /[a-zA-Z]/.test(
        cleaned.charAt(0)
      )
    ) {
      cleaned =
        cleaned.charAt(0).toUpperCase() +
        cleaned.slice(1);
    }

    return cleaned.trim();
  },

  /**
   * Merge very short consecutive segments
   * belonging to the same speaker.
   */
  mergeShortSegments(segments) {
    if (
      !Array.isArray(segments) ||
      segments.length < 2
    ) {
      return segments;
    }

    const merged = [];
    let current = segments[0];

    for (
      let i = 1;
      i < segments.length;
      i++
    ) {
      const next = segments[i];

      const sameSpeaker =
        (current.speaker ||
          'Unknown Speaker') ===
        (next.speaker ||
          'Unknown Speaker');

      const currentDuration =
        this.getDuration(
          current.startTime,
          current.endTime
        );

      /*
       * If timestamps are unavailable,
       * don't guess whether the segment
       * is short.
       */
      const shouldMerge =
        sameSpeaker &&
        currentDuration !== null &&
        currentDuration < 1.0;

      if (shouldMerge) {
        current = {
          ...current,

          endTime:
            next.endTime ??
            current.endTime,

          text:
            `${current.text} ${next.text}`
              .replace(/\s+/g, ' ')
              .trim(),

          words: [
            ...(Array.isArray(
              current.words
            )
              ? current.words
              : []),

            ...(Array.isArray(
              next.words
            )
              ? next.words
              : [])
          ]
        };
      } else {
        merged.push(current);
        current = next;
      }
    }

    merged.push(current);

    /*
     * Re-number segment IDs after merging.
     */
    return merged.map(
      (segment, index) => ({
        ...segment,
        segmentId:
          `seg_${index}`
      })
    );
  },

  /**
   * Safely calculate segment duration.
   *
   * Returns null when timestamps are missing.
   */
  getDuration(
    startTime,
    endTime
  ) {
    if (
      typeof startTime !== 'number' ||
      typeof endTime !== 'number'
    ) {
      return null;
    }

    if (endTime < startTime) {
      return null;
    }

    return endTime - startTime;
  }
};