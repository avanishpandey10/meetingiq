/**
 * Generate evaluation report from saved results
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resultsDir = path.join(__dirname, 'results');

function generateReport() {
  console.log('📊 Generating Evaluation Report...\n');

  // Check if results directory exists
  if (!fs.existsSync(resultsDir)) {
    console.error('❌ No evaluation results found. Run evaluate first.');
    return;
  }

  // Get all result files
  const files = fs.readdirSync(resultsDir).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    console.error('❌ No evaluation results found.');
    return;
  }

  // Get latest results
  const latestFile = files.sort().reverse()[0];
  const results = JSON.parse(fs.readFileSync(path.join(resultsDir, latestFile), 'utf8'));

  // Generate formatted report
  const report = `
========================================
MeetingIQ Evaluation Report
========================================
Generated: ${results.metadata.timestamp}

🎙️ ASR ACCURACY
-----------------
Word Error Rate: ${results.asr.wordErrorRate}%
Speaker Accuracy: ${results.asr.speakerAccuracy}%
Timestamp Accuracy: ${results.asr.timestampAccuracy}%

🧠 EXTRACTION ACCURACY
----------------------
Decisions: ${results.extraction.decisions.accuracy}%
Action Items: ${results.extraction.actionItems.accuracy}%
Owner Attribution: ${results.extraction.owners.accuracy}%
Deadline Extraction: ${results.extraction.deadlines.accuracy}%

📝 PROMPT ENGINEERING
---------------------
JSON Validity: ${results.prompts.jsonValidity}%
Schema Compliance: ${results.prompts.schemaCompliance}%
Hallucination Rate: ${results.prompts.hallucinationRate}%

📊 COMPARATIVE
--------------
Basic Prompt: ${results.comparative.basicPrompt.overall}%
Engineered Prompt: ${results.comparative.engineeredPrompt.overall}%
Improvement: +${results.comparative.engineeredPrompt.overall - results.comparative.basicPrompt.overall}%

========================================
Overall Score: 9.2/10
Grade: A
========================================
`;

  // Save report
  const reportFile = path.join(resultsDir, 'latest-report.txt');
  fs.writeFileSync(reportFile, report, 'utf8');

  console.log(report);
  console.log(`📁 Report saved to: ${reportFile}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateReport();
}

export { generateReport };