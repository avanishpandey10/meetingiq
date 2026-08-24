import Groq from 'groq-sdk';

import { env } from '../../config/env.js';

class GroqService {
  constructor() {
    this.client = null;
    this.initialize();
  }

  initialize() {
    if (!env.GROQ_API_KEY) {
      console.warn('⚠️ GROQ_API_KEY not found. Groq service is disabled.');
      return;
    }

    this.client = new Groq({
      apiKey: env.GROQ_API_KEY
    });

    console.log('✅ Groq service initialized');
  }

  ensureAvailable() {
    if (!this.client) {
      throw new Error('Groq service is unavailable. Add GROQ_API_KEY to .env.');
    }
  }

  getModel() {
    // Use smaller model by default for better rate limits
    return env.GROQ_MODEL || 'llama-3.1-8b-instant';
  }

  /**
   * Truncate prompt to fit within token limits
   * Keeps beginning and end of transcript
   */
  truncatePrompt(prompt, maxChars = 8000) {
    if (!prompt || prompt.length <= maxChars) {
      return prompt;
    }

    const halfChars = Math.floor(maxChars / 2);
    const beginning = prompt.substring(0, halfChars);
    const ending = prompt.substring(prompt.length - halfChars);

    return `${beginning}\n\n...[transcript truncated to reduce tokens]...\n\n${ending}`;
  }

  /**
   * Split transcript into smaller chunks
   */
  chunkTranscript(transcript, chunkSize = 6000) {
    if (!transcript) return [];

    const chunks = [];
    const segments = transcript.split('\n');
    let currentChunk = '';

    for (const segment of segments) {
      if ((currentChunk + segment).length > chunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = segment;
      } else {
        currentChunk += (currentChunk ? '\n' : '') + segment;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  /**
   * Estimate token count (rough estimate: 4 chars = 1 token)
   */
  estimateTokens(text) {
    return Math.ceil((text?.length || 0) / 4);
  }

  async generateStructuredResponse(prompt, schema, options = {}) {
    this.ensureAvailable();

    if (!prompt || typeof prompt !== 'string') {
      throw new Error('A valid prompt is required.');
    }

    if (!schema || typeof schema !== 'object') {
      throw new Error('A valid JSON schema is required.');
    }

    const model = options.model || this.getModel();
    
    // Truncate prompt to reduce tokens
    const maxChars = options.maxChars || 8000;
    const truncatedPrompt = this.truncatePrompt(prompt, maxChars);
    
    const estimatedTokens = this.estimateTokens(truncatedPrompt);
    console.log(`📊 Estimated input tokens: ${estimatedTokens}`);

    // Use smaller max_tokens
    const maxCompletionTokens = options.maxTokens || env.GROQ_MAX_TOKENS || 1000;

    try {
      console.log(`🤖 Groq structured analysis: ${model}`);

      const response = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a precise meeting intelligence assistant. Return ONLY valid JSON. Use only the information provided. Never hallucinate.'
          },
          {
            role: 'user',
            content: truncatedPrompt
          }
        ],
        response_format: {
          type: 'json_object'
        },
        temperature: options.temperature || 0.2,
        max_completion_tokens: maxCompletionTokens
      });

      const content = response?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Groq returned an empty response.');
      }

      return this.parseJsonSafely(content);
    } catch (error) {
      console.error('❌ Groq structured analysis failed:', error);

      // If token limit exceeded, retry with smaller prompt
      if (error?.status === 413 || error?.message?.includes('413') || error?.message?.includes('Request too large')) {
        console.log('🔄 Token limit exceeded. Retrying with smaller chunk...');

        const smallerChunk = this.truncatePrompt(truncatedPrompt, Math.floor(maxChars / 2));

        try {
          const retryResponse = await this.client.chat.completions.create({
            model,
            messages: [
              {
                role: 'system',
                content: 'You are a meeting analyst. Return ONLY valid JSON.'
              },
              {
                role: 'user',
                content: smallerChunk
              }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
            max_completion_tokens: 800
          });

          const retryContent = retryResponse?.choices?.[0]?.message?.content;

          if (!retryContent) {
            throw new Error('Retry returned empty response.');
          }

          return this.parseJsonSafely(retryContent);
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError);
        }
      }

      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.toLowerCase().includes('rate limit')) {
        throw new Error('Groq rate limit reached. Please wait 60 seconds and try again.');
      }

      throw new Error(`Groq analysis failed: ${error.message}`);
    }
  }

  async generateText(prompt, options = {}) {
    this.ensureAvailable();

    const model = options.model || this.getModel();
    
    // Truncate prompt
    const truncatedPrompt = this.truncatePrompt(prompt, 6000);

    try {
      console.log(`🤖 Groq text generation: ${model}`);

      const response = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a grounded meeting assistant. Answer only using the supplied meeting context. Be concise.'
          },
          {
            role: 'user',
            content: truncatedPrompt
          }
        ],
        temperature: options.temperature || 0.3,
        max_completion_tokens: options.maxTokens || 500
      });

      return response?.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('❌ Groq text generation failed:', error);

      if (error?.status === 429 || error?.message?.includes('429')) {
        throw new Error('Groq rate limit reached. Please wait before trying again.');
      }

      if (error?.status === 413 || error?.message?.includes('413')) {
        throw new Error('Request too large. Please reduce input size.');
      }

      throw new Error(`Groq text generation failed: ${error.message}`);
    }
  }

  /**
   * Safe JSON parsing with fallback
   */
  parseJsonSafely(text) {
    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from Groq');
    }

    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (error) {
      // Find first { or [
      const objectStart = cleaned.indexOf('{');
      const arrayStart = cleaned.indexOf('[');
      const start = objectStart === -1 ? arrayStart : arrayStart === -1 ? objectStart : Math.min(objectStart, arrayStart);
      const objectEnd = cleaned.lastIndexOf('}');
      const arrayEnd = cleaned.lastIndexOf(']');
      const end = Math.max(objectEnd, arrayEnd);

      if (start !== -1 && end !== -1 && end > start) {
        try {
          return JSON.parse(cleaned.slice(start, end + 1));
        } catch {
          // Continue to throw
        }
      }

      throw new Error(`Invalid JSON from Groq: ${error.message}`);
    }
  }
}

export const groqService = new GroqService();