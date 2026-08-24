/**
 * Speaker Segmenter Service
 * 
 * Since Whisper doesn't provide speaker diarization,
 * this service applies heuristic-based speaker segmentation.
 * 
 * IMPORTANT: This is an APPROXIMATION, not real diarization.
 */

export const speakerSegmenter = {
  /**
   * Process segments to assign speakers
   */
  process(segments) {
    if (!Array.isArray(segments) || segments.length === 0) {
      return segments;
    }

    // Check if segments already have distinct speakers
    const existingSpeakers = new Set(
      segments.map(s => s.speaker).filter(Boolean)
    );

    // If already has multiple speakers, don't override
    if (existingSpeakers.size > 1) {
      console.log(`✅ Already has ${existingSpeakers.size} speakers from ASR`);
      return segments;
    }

    console.log('🔄 Applying heuristic speaker segmentation...');

    return this.segmentByPauses(segments);
  },

  /**
   * Segment by pauses between utterances
   */
  segmentByPauses(segments) {
    const speakers = ['Speaker 1', 'Speaker 2', 'Speaker 3'];
    let currentSpeakerIndex = 0;
    let speakerAssignment = new Map();
    let lastEndTime = segments[0]?.startTime || 0;
    let speakerChangeCount = 0;

    const processedSegments = segments.map((segment, index) => {
      const pauseDuration = (segment.startTime || 0) - lastEndTime;
      lastEndTime = segment.endTime || segment.startTime;

      // Change speaker on significant pause
      if (pauseDuration > 1.0 && index > 0) {
        currentSpeakerIndex = (currentSpeakerIndex + 1) % speakers.length;
        speakerChangeCount++;
      }

      const speaker = speakers[currentSpeakerIndex];

      if (!speakerAssignment.has(speaker)) {
        speakerAssignment.set(speaker, {
          count: 0,
          totalTime: 0
        });
      }

      const duration = (segment.endTime || 0) - (segment.startTime || 0);
      const stats = speakerAssignment.get(speaker);
      stats.count += 1;
      stats.totalTime += duration;

      return {
        ...segment,
        speaker,
        speakerConfidence: 0.6
      };
    });

    console.log(`📊 Speaker segmentation results:`);
    speakerAssignment.forEach((stats, speaker) => {
      console.log(`  ${speaker}: ${stats.count} segments, ${stats.totalTime.toFixed(1)}s`);
    });

    return processedSegments;
  }
};