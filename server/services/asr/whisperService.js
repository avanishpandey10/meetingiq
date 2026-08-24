import { env } from '../../config/env.js';
import { geminiAsrService } from './geminiAsrService.js';
import { mockAsrService } from './mockAsrService.js';

/**
 * ASR Service Factory
 */
export function getAsrService() {
  if (
    env.DEMO_MODE === true ||
    env.ASR_PROVIDER === 'mock'
  ) {
    console.log('🔄 Using mock ASR service');
    return mockAsrService;
  }

  console.log('🎯 Using Google Gemini for transcription');
  return geminiAsrService;
}