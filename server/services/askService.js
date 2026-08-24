import mongoose from 'mongoose';

import { getLlmService } from './llm/llmService.js';

import {
  askMeetingPrompt,
  askMeetingSchema
} from '../prompts/askMeeting.js';

import {
  extractRelevantSegments
} from '../utils/contextBuilder.js';

import Transcript from '../models/Transcript.js';
import Analysis from '../models/Analysis.js';

export const askService = {

  /**
   * Answer a grounded question about a meeting.
   */
  async askQuestion(
    meetingId,
    question
  ) {
    try {
      // ------------------------------------------------------
      // VALIDATE MEETING ID
      // ------------------------------------------------------

      if (
        !meetingId ||
        !mongoose.Types.ObjectId.isValid(
          meetingId
        )
      ) {
        throw new Error(
          'Invalid meeting ID.'
        );
      }

      // ------------------------------------------------------
      // VALIDATE QUESTION
      // ------------------------------------------------------

      if (
        typeof question !== 'string' ||
        question.trim().length < 3
      ) {
        throw new Error(
          'Question must be at least 3 characters long.'
        );
      }

      const cleanedQuestion =
        question.trim();

      // ------------------------------------------------------
      // GET TRANSCRIPT + ANALYSIS
      // ------------------------------------------------------

      const [
        transcript,
        analysis
      ] = await Promise.all([
        Transcript.findOne({
          meetingId
        }).lean(),

        Analysis.findOne({
          meetingId
        }).lean()
      ]);

      if (!transcript) {
        throw new Error(
          'Transcript not found for this meeting.'
        );
      }

      // ------------------------------------------------------
      // FIND RELEVANT LOCAL CONTEXT
      // ------------------------------------------------------

      const relevantSegments =
        extractRelevantSegments(
          cleanedQuestion,
          transcript,
          ''
        );

      // ------------------------------------------------------
      // GET LLM SERVICE
      // ------------------------------------------------------

      const llmService =
        getLlmService();

      // ------------------------------------------------------
      // BUILD GROUNDED PROMPT
      // ------------------------------------------------------

      const prompt =
        askMeetingPrompt(
          cleanedQuestion,
          transcript,
          analysis,
          relevantSegments
        );

      // ------------------------------------------------------
      // ASK GROQ
      // ------------------------------------------------------

      console.log(
        '🤖 Asking Groq about meeting...'
      );

      const response =
        await llmService.generateStructuredResponse(
          prompt,
          askMeetingSchema,
          {
            temperature: 0.2,
            maxTokens: 1200,
            schemaName: 'ask_meeting'
          }
        );

      // ------------------------------------------------------
      // VALIDATE RESPONSE
      // ------------------------------------------------------

      if (
        !response ||
        typeof response.answer !==
          'string' ||
        !response.answer.trim()
      ) {
        throw new Error(
          'The AI returned an empty answer.'
        );
      }

      // ------------------------------------------------------
      // RELEVANT SEGMENTS FALLBACK
      // ------------------------------------------------------

      let finalRelevantSegments =
        Array.isArray(
          response.relevantSegments
        )
          ? response.relevantSegments
          : [];

      if (
        finalRelevantSegments.length === 0
      ) {
        finalRelevantSegments =
          extractRelevantSegments(
            cleanedQuestion,
            transcript,
            response.answer
          );
      }

      // ------------------------------------------------------
      // FINAL RESPONSE
      // ------------------------------------------------------

      return {
        meetingId,

        question:
          cleanedQuestion,

        answer:
          response.answer.trim(),

        relevantSegments:
          finalRelevantSegments,

        confidence:
          typeof response.confidence ===
          'number'
            ? Math.min(
                1,
                Math.max(
                  0,
                  response.confidence
                )
              )
            : null,

        sources:
          Array.isArray(
            response.sources
          )
            ? response.sources
            : [],

        answeredAt:
          new Date()
      };

    } catch (error) {
      console.error(
        '❌ Ask Meeting failed:',
        error
      );

      throw error;
    }
  },

  /**
   * Get suggested questions.
   * No LLM call required.
   */
  async getSuggestedQuestions(
    meetingId
  ) {
    if (
      !meetingId ||
      !mongoose.Types.ObjectId.isValid(
        meetingId
      )
    ) {
      throw new Error(
        'Invalid meeting ID.'
      );
    }

    const [
      transcript,
      analysis
    ] = await Promise.all([
      Transcript.findOne({
        meetingId
      }).lean(),

      Analysis.findOne({
        meetingId
      }).lean()
    ]);

    if (!transcript) {
      return [];
    }

    const suggestions = [
      'What were the key decisions made?',
      'Who was assigned action items?',
      'What risks were identified?',
      'What topics were discussed?',
      'What remains unresolved?'
    ];

    // ------------------------------------------------------
    // ACTION ITEM QUESTION
    // ------------------------------------------------------

    if (
      Array.isArray(
        analysis?.actionItems
      ) &&
      analysis.actionItems.length > 0
    ) {
      const firstAction =
        analysis.actionItems[0];

      if (
        firstAction.owner &&
        firstAction.owner !==
          'Unassigned'
      ) {
        suggestions.push(
          `What tasks were assigned to ${firstAction.owner}?`
        );
      } else {
        suggestions.push(
          'Which action items are currently unassigned?'
        );
      }
    }

    // ------------------------------------------------------
    // DECISION QUESTION
    // ------------------------------------------------------

    if (
      Array.isArray(
        analysis?.keyDecisions
      ) &&
      analysis.keyDecisions.length > 0
    ) {
      const decision =
        analysis.keyDecisions[0];

      if (decision?.decision) {
        suggestions.push(
          `Tell me more about this decision: "${decision.decision}"`
        );
      }
    }

    // ------------------------------------------------------
    // OPEN QUESTION
    // ------------------------------------------------------

    if (
      Array.isArray(
        analysis?.openQuestions
      ) &&
      analysis.openQuestions.length > 0
    ) {
      const openQuestion =
        analysis.openQuestions[0];

      if (openQuestion?.question) {
        suggestions.push(
          `What was discussed about this unresolved question: "${openQuestion.question}"`
        );
      }
    }

    return suggestions.slice(
      0,
      8
    );
  }
};