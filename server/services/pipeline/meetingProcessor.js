import Meeting from '../../models/Meeting.js';
import Transcript from '../../models/Transcript.js';
import Analysis from '../../models/Analysis.js';
import ActionItem from '../../models/ActionItem.js';

import { getAsrService } from '../asr/asrService.js';
import { transcriptCleaner } from './transcriptCleaner.js';
import { speakerSegmenter } from './speakerSegmenter.js';
import { intelligenceExtractor } from './intelligenceExtractor.js';

export const meetingProcessor = {
  async processMeeting(meetingId) {
    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      throw new Error('Meeting not found');
    }

    try {
      // STAGE 1: TRANSCRIPTION
      meeting.status = 'PROCESSING';
      meeting.processingStage = 'transcription';
      meeting.processingProgress = 10;
      await meeting.save();

      console.log('🎙️ Starting audio transcription...');

      const asrService = getAsrService();
      const transcriptData = await asrService.transcribe(meeting.storagePath);

      if (!transcriptData || !Array.isArray(transcriptData.segments)) {
        throw new Error('ASR returned an invalid transcript.');
      }

      // STAGE 2: TRANSCRIPT CLEANING
      meeting.processingStage = 'transcript_cleaning';
      meeting.processingProgress = 30;
      await meeting.save();

      console.log('🧹 Cleaning transcript...');

      const cleanedSegments = transcriptCleaner.cleanSegments(transcriptData.segments);

      // STAGE 3: SPEAKER SEGMENTATION
      meeting.processingStage = 'speaker_segmentation';
      meeting.processingProgress = 40;
      await meeting.save();

      console.log('🎤 Processing speaker information...');

      const processedSegments = speakerSegmenter.process(cleanedSegments);

      // Calculate speaker stats properly
      const speakerStats = this.calculateSpeakerStats(processedSegments);

      console.log('📊 Final Speaker Stats:');
      speakerStats.forEach(stat => {
        console.log(`  ${stat.speaker}: ${stat.segmentCount} segments, ${stat.totalTime.toFixed(1)}s (${stat.percentage.toFixed(1)}%)`);
      });

      // STAGE 4: STORE TRANSCRIPT
      meeting.processingStage = 'transcript_validation';
      meeting.processingProgress = 45;
      await meeting.save();

      if (processedSegments.length === 0) {
        throw new Error('No valid transcript segments found.');
      }

      const fullText = processedSegments
        .map((segment) => segment.text)
        .filter(Boolean)
        .join(' ');

      const transcript = new Transcript({
        meetingId: meeting._id,
        fullText,
        language: transcriptData.language || 'en',
        segments: processedSegments,
        speakerStats: speakerStats
      });

      await transcript.save();

      meeting.transcriptId = transcript._id;
      meeting.duration = processedSegments.length > 0
        ? this.getMeetingDuration(processedSegments)
        : 0;
      meeting.detectedLanguage = transcriptData.language || 'en';
      meeting.languageConfidence = 0.95;

      // STAGE 5: INTELLIGENCE EXTRACTION
      meeting.processingStage = 'intelligence_extraction';
      meeting.processingProgress = 55;
      await meeting.save();

      console.log('🧠 Starting meeting intelligence extraction...');

      const analysisData = await intelligenceExtractor.extractAll(transcript);

      console.log('✅ Intelligence extraction completed');

      // STAGE 6: STORE ANALYSIS
      const analysis = new Analysis({
        meetingId: meeting._id,
        executiveSummary: analysisData.executiveSummary || '',
        keyTopics: analysisData.keyTopics || [],
        keyDecisions: analysisData.keyDecisions || [],
        actionItems: analysisData.actionItems || [],
        openQuestions: analysisData.openQuestions || [],
        risks: analysisData.risks || [],
        blockers: analysisData.blockers || [],
        timeline: analysisData.timeline || [],
        meetingScore: analysisData.meetingScore || null,
        rawAnalysis: analysisData.rawAnalysis || {}
      });

      await analysis.save();
      meeting.analysisId = analysis._id;

      // STAGE 7: ACTION ITEMS
      meeting.processingStage = 'action_items';
      meeting.processingProgress = 85;
      await meeting.save();

      const actionItems = Array.isArray(analysisData.actionItems) ? analysisData.actionItems : [];

      if (actionItems.length > 0) {
        const actionItemDocuments = actionItems
          .filter((item) => item && typeof item.task === 'string' && item.task.trim().length > 0)
          .map((item) => ({
            meetingId: meeting._id,
            analysisId: analysis._id,
            task: item.task.trim(),
            owner: item.owner || 'Unassigned',
            deadline: item.deadline || 'Not specified',
            priority: ['HIGH', 'MEDIUM', 'LOW'].includes(item.priority) ? item.priority : 'MEDIUM',
            status: 'PENDING',
            sourceTimestamp: this.toNumberOrNull(item.sourceTimestamp),
            sourceSpeaker: item.sourceSpeaker || 'Unknown Speaker',
            confidence: this.normalizeConfidence(item.confidence)
          }));

        if (actionItemDocuments.length > 0) {
          await ActionItem.insertMany(actionItemDocuments);
          console.log(`✅ Created ${actionItemDocuments.length} action items`);
        }
      }

      // COMPLETE
      meeting.processingStage = 'completed';
      meeting.processingProgress = 100;
      meeting.status = 'COMPLETED';
      meeting.processedAt = new Date();
      meeting.processingError = null;
      await meeting.save();

      console.log(`✅ Meeting ${meetingId} fully processed`);
      console.log(`📊 Final: ${speakerStats.length} speakers, ${processedSegments.length} segments, duration: ${meeting.duration}s`);

      return meeting;
    } catch (error) {
      console.error(`❌ Meeting ${meetingId} processing failed:`, error);

      meeting.status = 'FAILED';
      meeting.processingStage = 'failed';
      meeting.processingError = error.message;
      await meeting.save();

      throw error;
    }
  },

  calculateSpeakerStats(segments) {
    const speakerMap = new Map();

    for (const segment of segments) {
      const speaker = segment.speaker || 'Unknown Speaker';
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

    return values.map((item) => ({
      ...item,
      totalTime: Number(item.totalTime.toFixed(2)),
      percentage: totalTime > 0
        ? Number(((item.totalTime / totalTime) * 100).toFixed(2))
        : 0
    })).sort((a, b) => b.totalTime - a.totalTime);
  },

  getMeetingDuration(segments) {
    const validEndTimes = segments
      .map((segment) => Number(segment.endTime))
      .filter((value) => Number.isFinite(value) && value >= 0);

    return validEndTimes.length > 0 ? Math.max(...validEndTimes) : 0;
  },

  toNumberOrNull(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  },

  normalizeConfidence(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return null;
    return Math.min(1, Math.max(0, number));
  }
};