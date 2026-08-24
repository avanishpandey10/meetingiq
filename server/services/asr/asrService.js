import { env } from '../../config/env.js';

import { groqAsrService } from './groqAsrService.js';

import { mockAsrService } from './mockAsrService.js';

export function getAsrService() {
  /*
   * Demo mode
   */
  if (
    env.DEMO_MODE === true ||
    env.ASR_PROVIDER === 'mock'
  ) {
    console.log(
      '🔄 Using mock ASR service'
    );

    return mockAsrService;
  }

  /*
   * Groq ASR
   */
  if (
    env.ASR_PROVIDER === 'groq'
  ) {
    console.log(
      '🎯 Using Groq Whisper for transcription'
    );

    return groqAsrService;
  }

  /*
   * Unknown provider
   */
  console.warn(
    `⚠️ Unknown ASR provider: ${env.ASR_PROVIDER}`
  );

  console.warn(
    '⚠️ Falling back to Groq Whisper.'
  );

  return groqAsrService;
}