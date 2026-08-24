import { env } from '../../config/env.js';

import { groqService } from './groqService.js';

import { mockLlmService } from './mockLlmService.js';

export function getLlmService() {
  /*
   * Demo mode
   */
  if (
    env.DEMO_MODE === true
  ) {
    console.log(
      '🔄 Using mock LLM service'
    );

    return mockLlmService;
  }

  /*
   * Groq
   */
  if (
    env.LLM_PROVIDER === 'groq'
  ) {
    console.log(
      '🎯 Using Groq for LLM analysis'
    );

    return groqService;
  }

  /*
   * Default to Groq.
   */
  console.log(
    '🎯 Using Groq for LLM analysis'
  );

  return groqService;
}