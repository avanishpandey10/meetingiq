/**
 * Test MeetingIQ with sample data
 * Uses mock ASR and LLM services
 */

import { mockAsrService } from '../services/asr/mockAsrService.js';
import { intelligenceExtractor } from '../services/pipeline/intelligenceExtractor.js';
import { transcriptCleaner } from '../services/pipeline/transcriptCleaner.js';
import { speakerSegmenter } from '../services/pipeline/speakerSegmenter.js';

async function testWithSample() {
  console.log('========================================');
  console.log('🧪 Testing MeetingIQ with Sample Data');
  console.log('========================================\n');

  try {
    // Step 1: Get mock transcript
    console.log('📝 Generating mock transcript...');
    const transcriptData = await mockAsrService.transcribe('sample-audio.mp3');
    
    console.log(`✅ Transcript generated: ${transcriptData.segments.length} segments`);
    console.log(`✅ Speakers detected: ${transcriptData.speakerStats.length}`);
    console.log(`✅ Duration: ${transcriptData.segments[transcriptData.segments.length - 1].endTime.toFixed(1)}s\n`);

    // Step 2: Clean transcript
    console.log('🧹 Cleaning transcript...');
    const cleanedSegments = transcriptCleaner.cleanSegments(transcriptData.segments);
    console.log(`✅ Cleaned: ${cleanedSegments.length} segments\n`);

    // Step 3: Speaker segmentation
    console.log('🎤 Processing speakers...');
    const processedSegments = speakerSegmenter.process(cleanedSegments);
    console.log(`✅ Processed: ${processedSegments.length} segments\n`);

    // Step 4: Intelligence extraction
    console.log('🧠 Extracting intelligence...');
    const analysis = await intelligenceExtractor.extractAll({
      ...transcriptData,
      segments: processedSegments
    });

    // Step 5: Display results
    console.log('\n========================================');
    console.log('📊 ANALYSIS RESULTS');
    console.log('========================================\n');

    console.log('📋 EXECUTIVE SUMMARY:');
    console.log(analysis.executiveSummary || 'No summary generated');
    console.log();

    console.log(`✅ DECISIONS (${analysis.keyDecisions.length}):`);
    analysis.keyDecisions.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.decision}`);
    });
    console.log();

    console.log(`📋 ACTION ITEMS (${analysis.actionItems.length}):`);
    analysis.actionItems.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.task}`);
      console.log(`     Owner: ${item.owner}`);
      console.log(`     Deadline: ${item.deadline}`);
      console.log(`     Priority: ${item.priority}`);
    });
    console.log();

    console.log(`⚠️ RISKS (${analysis.risks.length}):`);
    analysis.risks.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.description} (${r.severity})`);
    });
    console.log();

    console.log(`❓ OPEN QUESTIONS (${analysis.openQuestions.length}):`);
    analysis.openQuestions.forEach((q, i) => {
      console.log(`  ${i + 1}. ${q.question}`);
    });
    console.log();

    console.log('🎯 MEETING SCORE:');
    console.log(`  Overall: ${analysis.meetingScore?.overall}/100`);
    console.log(`  Preparation: ${analysis.meetingScore?.preparation}/100`);
    console.log(`  Decision Clarity: ${analysis.meetingScore?.decisionClarity}/100`);
    console.log(`  Actionability: ${analysis.meetingScore?.actionability}/100`);

    console.log('\n========================================');
    console.log('✅ SAMPLE TEST COMPLETED SUCCESSFULLY');
    console.log('========================================\n');

    return analysis;
  } catch (error) {
    console.error('❌ Sample test failed:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testWithSample()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { testWithSample };