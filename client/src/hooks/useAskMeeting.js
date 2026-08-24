import {
  useState,
  useCallback
} from 'react';

import {
  askService
} from '../services/askService';

export function useAskMeeting(
  meetingId
) {
  const [
    questions,
    setQuestions
  ] = useState([]);

  const [
    suggestions,
    setSuggestions
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    error,
    setError
  ] = useState(null);

  const loadSuggestions =
    useCallback(async () => {
      if (!meetingId) {
        setSuggestions([]);
        return;
      }

      try {
        setError(null);

        const data =
          await askService.getSuggestedQuestions(
            meetingId
          );

        setSuggestions(
          Array.isArray(
            data?.suggestions
          )
            ? data.suggestions
            : []
        );
      } catch (err) {
        console.error(
          'Failed to load suggestions:',
          err
        );

        /*
         * Suggestions are optional.
         * Don't fail the entire Ask Meeting UI.
         */
        setSuggestions([]);
      }
    }, [meetingId]);

  const askQuestion =
    useCallback(
      async (question) => {
        const trimmedQuestion =
          typeof question ===
          'string'
            ? question.trim()
            : '';

        if (
          !meetingId
        ) {
          throw new Error(
            'Meeting ID is required.'
          );
        }

        if (
          trimmedQuestion.length <
          3
        ) {
          throw new Error(
            'Question must be at least 3 characters long.'
          );
        }

        setLoading(true);
        setError(null);

        try {
          const response =
            await askService.askQuestion(
              meetingId,
              trimmedQuestion
            );

          /*
           * Current askService returns:
           * {
           *   success: true,
           *   data: {
           *     answer,
           *     relevantSegments,
           *     confidence,
           *     ...
           *   }
           * }
           */
          const result =
            response?.data || {};

          const qaItem = {
            id: `${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`,

            question:
              trimmedQuestion,

            answer:
              result.answer ||
              'No answer returned.',

            relevantSegments:
              Array.isArray(
                result.relevantSegments
              )
                ? result.relevantSegments
                : [],

            confidence:
              typeof result.confidence ===
              'number'
                ? Math.min(
                    1,
                    Math.max(
                      0,
                      result.confidence
                    )
                  )
                : null,

            timestamp:
              new Date()
          };

          setQuestions(
            (prev) => [
              ...prev,
              qaItem
            ]
          );

          return result;
        } catch (err) {
          console.error(
            'Failed to ask question:',
            err
          );

          const message =
            err?.response?.data
              ?.message ||
            err?.message ||
            'Failed to get answer.';

          setError(
            message
          );

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [meetingId]
    );

  const clearQuestions =
    useCallback(() => {
      setQuestions([]);
      setError(null);
    }, []);

  return {
    questions,
    suggestions,
    loading,
    error,
    loadSuggestions,
    askQuestion,
    clearQuestions
  };
}