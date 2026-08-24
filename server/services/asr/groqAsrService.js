import Groq from 'groq-sdk';
import fs from 'node:fs';
import { env } from '../../config/env.js';

const groq = new Groq({
  apiKey: env.GROQ_API_KEY
});

export const groqAsrService = {
  async transcribe(audioFilePath, options = {}) {
    try {
      if (!audioFilePath) {
        throw new Error('Audio file path is required.');
      }

      if (!env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured.');
      }

      console.log(`📝 Starting Groq transcription: ${audioFilePath}`);

      const fileStream = fs.createReadStream(audioFilePath);

      const response = await groq.audio.transcriptions.create({
        file: fileStream,
        model: options.model || env.GROQ_ASR_MODEL || 'whisper-large-v3-turbo',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment', 'word'],
        language: options.language || undefined,
        prompt: options.prompt || undefined,
        temperature: 0
      });

      console.log('✅ Groq transcription completed');

      return this.formatTranscript(response);
    } catch (error) {
      console.error('❌ Groq transcription failed:', error);

      if (error?.status === 429 || error?.message?.includes('429')) {
        throw new Error('Groq rate limit reached. Please wait and try again.');
      }

      throw new Error(`ASR failed: ${error.message}`);
    }
  },

  formatTranscript(response) {
    const rawSegments = Array.isArray(response?.segments) ? response.segments : [];

    // Convert raw segments
    let segments = rawSegments
      .map((segment, index) => ({
        segmentId: `seg_${index}`,
        speaker: 'Speaker 1',
        speakerConfidence: 0,
        startTime: Number(segment.start) || 0,
        endTime: Number(segment.end) || 0,
        text: typeof segment.text === 'string' ? segment.text.trim() : '',
        words: Array.isArray(segment.words)
          ? segment.words.map((word) => ({
              word: word.word || '',
              start: Number(word.start) || 0,
              end: Number(word.end) || 0,
              confidence: 0
            }))
          : []
      }))
      .filter((segment) => segment.text.length > 0);

    if (segments.length === 0) {
      throw new Error('Groq returned no valid transcript segments.');
    }

    // Apply speaker segmentation
    segments = this.applySpeakerSegmentation(segments);

    const fullText = segments.map((segment) => segment.text).join(' ');

    const speakerStats = this.calculateSpeakerStats(segments);

    console.log('📊 Speaker Stats from Groq ASR:');
    speakerStats.forEach(stat => {
      console.log(`  ${stat.speaker}: ${stat.segmentCount} segments, ${stat.totalTime.toFixed(1)}s (${stat.percentage.toFixed(1)}%)`);
    });

    return {
      fullText,
      language: response.language || 'en',
      segments,
      speakerStats
    };
  },

  /**
   * Apply heuristic speaker segmentation based on pauses
   * 
   * Whisper doesn't provide speaker diarization.
   * This estimates speaker changes based on:
   * - Pauses > 1.5 seconds indicate speaker change
   * - Alternates between Speaker 1, 2, 3
   */
  applySpeakerSegmentation(segments) {
    if (segments.length < 2) {
      return segments;
    }

    const speakers = ['Speaker 1', 'Speaker 2', 'Speaker 3'];
    let currentSpeakerIndex = 0;
    let lastEndTime = segments[0]?.startTime || 0;

    console.log('🔄 Applying speaker segmentation based on pauses...');

    const processedSegments = segments.map((segment, index) => {
      const pauseDuration = (segment.startTime || 0) - lastEndTime;
      lastEndTime = segment.endTime || segment.startTime;

      // Change speaker on significant pause (> 1.5 seconds)
      if (pauseDuration > 1.5 && index > 0) {
        currentSpeakerIndex = (currentSpeakerIndex + 1) % speakers.length;
      }

      return {
        ...segment,
        speaker: speakers[currentSpeakerIndex],
        speakerConfidence: 0.6 // Heuristic confidence
      };
    });

    // Count unique speakers
    const uniqueSpeakers = new Set(processedSegments.map(s => s.speaker));
    console.log(`✅ Detected ${uniqueSpeakers.size} estimated speakers`);

    return processedSegments;
  },

  calculateSpeakerStats(segments) {
    const speakerMap = new Map();

    for (const segment of segments) {
      const speaker = segment.speaker || 'Speaker 1';
      const start = Number(segment.startTime);
      const end = Number(segment.endTime);
      const duration = Number.isFinite(start) && Number.isFinite(end) && end >= start
        ? end - start
        : 0;

      if (!speakerMap.has(speaker)) {
        speakerMap.set(speaker, {
          speaker,
          totalTime: 0,
          segmentCount: 0
        });
      }

      const stats = speakerMap.get(speaker);
      stats.totalTime += duration;
      stats.segmentCount += 1;
    }

    const values = Array.from(speakerMap.values());
    const totalTime = values.reduce((sum, item) => sum + item.totalTime, 0);

    const result = values.map((item) => ({
      ...item,
      totalTime: Number(item.totalTime.toFixed(2)),
      percentage: totalTime > 0
        ? Number(((item.totalTime / totalTime) * 100).toFixed(2))
        : 0
    }));

    // Sort by total time descending
    return result.sort((a, b) => b.totalTime - a.totalTime);
  }
};