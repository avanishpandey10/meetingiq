export const mockAsrService = {
  async transcribe(audioFilePath, options = {}) {
    console.log('🔄 Generating mock transcript for demo...');

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockSegments = [
      { segmentId: 'seg_0', speaker: 'Speaker 1', speakerConfidence: 0.95, startTime: 0, endTime: 12.5, text: "Good morning everyone. Let's start with the project status update.", words: [] },
      { segmentId: 'seg_1', speaker: 'Speaker 2', speakerConfidence: 0.92, startTime: 12.5, endTime: 28.3, text: "I've completed the backend API integration. The authentication system is working properly.", words: [] },
      { segmentId: 'seg_2', speaker: 'Speaker 1', speakerConfidence: 0.93, startTime: 28.3, endTime: 45.8, text: 'Great work. What about the frontend components? Are they ready for testing?', words: [] },
      { segmentId: 'seg_3', speaker: 'Speaker 3', speakerConfidence: 0.88, startTime: 45.8, endTime: 62.1, text: 'The dashboard is almost done. I need two more days to finish the charts and data visualization.', words: [] },
      { segmentId: 'seg_4', speaker: 'Speaker 2', speakerConfidence: 0.91, startTime: 62.1, endTime: 78.4, text: "We need to deploy to staging by Friday. That's our deadline for the demo.", words: [] },
      { segmentId: 'seg_5', speaker: 'Speaker 1', speakerConfidence: 0.94, startTime: 78.4, endTime: 95.2, text: 'Agreed. Rahul will prepare the deployment configuration. Sarah will handle the QA testing.', words: [] },
      { segmentId: 'seg_6', speaker: 'Speaker 3', speakerConfidence: 0.89, startTime: 95.2, endTime: 112.7, text: 'I have a concern about the database migration. The current script might cause data loss.', words: [] },
      { segmentId: 'seg_7', speaker: 'Speaker 2', speakerConfidence: 0.90, startTime: 112.7, endTime: 128.9, text: "Let's schedule a separate meeting with the database team to address that risk.", words: [] },
      { segmentId: 'seg_8', speaker: 'Speaker 1', speakerConfidence: 0.93, startTime: 128.9, endTime: 150.0, text: "Good idea. I'll also prepare the deployment checklist for review.", words: [] },
      { segmentId: 'seg_9', speaker: 'Speaker 3', speakerConfidence: 0.87, startTime: 150.0, endTime: 175.5, text: "I'll update the documentation with the new API endpoints.", words: [] },
      { segmentId: 'seg_10', speaker: 'Speaker 2', speakerConfidence: 0.91, startTime: 175.5, endTime: 200.0, text: "Let's schedule a follow-up meeting for next Monday to review progress.", words: [] }
    ];

    const fullText = mockSegments.map((segment) => segment.text).join(' ');
    const speakerStats = this.calculateSpeakerStats(mockSegments);

    console.log('📊 Mock Speaker Stats:');
    speakerStats.forEach(stat => {
      console.log(`  ${stat.speaker}: ${stat.segmentCount} segments, ${stat.totalTime.toFixed(1)}s (${stat.percentage.toFixed(1)}%)`);
    });

    return {
      fullText,
      language: 'en',
      segments: mockSegments,
      speakerStats
    };
  },

  calculateSpeakerStats(segments) {
    const speakerMap = new Map();

    for (const segment of segments) {
      if (!segment.speaker) continue;

      const start = Number(segment.startTime);
      const end = Number(segment.endTime);
      const duration = Number.isFinite(start) && Number.isFinite(end) && end >= start
        ? end - start
        : 0;

      if (!speakerMap.has(segment.speaker)) {
        speakerMap.set(segment.speaker, {
          speaker: segment.speaker,
          totalTime: 0,
          segmentCount: 0
        });
      }

      const stats = speakerMap.get(segment.speaker);
      stats.totalTime += duration;
      stats.segmentCount += 1;
    }

    const values = Array.from(speakerMap.values());
    const totalTime = values.reduce((sum, stats) => sum + stats.totalTime, 0);

    return values.map((stats) => ({
      ...stats,
      totalTime: Number(stats.totalTime.toFixed(2)),
      percentage: totalTime > 0
        ? Number(((stats.totalTime / totalTime) * 100).toFixed(2))
        : 0
    })).sort((a, b) => b.totalTime - a.totalTime);
  }
};