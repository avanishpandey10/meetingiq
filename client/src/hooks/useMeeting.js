import {
  useState,
  useEffect
} from 'react';

import {
  meetingService
} from '../services/meetingService';

export function useMeeting(
  meetingId
) {
  const [
    meeting,
    setMeeting
  ] = useState(null);

  const [
    transcript,
    setTranscript
  ] = useState(null);

  const [
    analysis,
    setAnalysis
  ] = useState(null);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchMeetingData =
      async () => {
        if (!meetingId) {
          setMeeting(null);
          setTranscript(null);
          setAnalysis(null);
          setLoading(false);
          setError(
            'Meeting ID is missing.'
          );
          return;
        }

        try {
          setLoading(true);
          setError(null);

          /*
           * Fetch meeting first because
           * transcriptId and analysisId are
           * stored on the meeting document.
           */
          const meetingData =
            await meetingService.getMeeting(
              meetingId
            );

          if (cancelled) {
            return;
          }

          const currentMeeting =
            meetingData?.meeting ||
            null;

          setMeeting(
            currentMeeting
          );

          if (!currentMeeting) {
            throw new Error(
              'Meeting not found.'
            );
          }

          /*
           * Fetch transcript and analysis
           * in parallel when available.
           */
          const [
            transcriptResult,
            analysisResult
          ] =
            await Promise.all([
              currentMeeting.transcriptId
                ? meetingService
                    .getTranscript(
                      meetingId
                    )
                    .catch(
                      (err) => {
                        console.warn(
                          'Failed to fetch transcript:',
                          err
                        );

                        return null;
                      }
                    )
                : Promise.resolve(
                    null
                  ),

              currentMeeting.analysisId
                ? meetingService
                    .getAnalysis(
                      meetingId
                    )
                    .catch(
                      (err) => {
                        console.warn(
                          'Failed to fetch analysis:',
                          err
                        );

                        return null;
                      }
                    )
                : Promise.resolve(
                    null
                  )
            ]);

          if (cancelled) {
            return;
          }

          setTranscript(
            transcriptResult?.transcript ||
              null
          );

          setAnalysis(
            analysisResult?.analysis ||
              null
          );
        } catch (err) {
          if (cancelled) {
            return;
          }

          console.error(
            'Failed to fetch meeting data:',
            err
          );

          setError(
            err?.response?.data
              ?.message ||
              err?.message ||
              'Failed to fetch meeting data.'
          );

          setMeeting(null);
          setTranscript(null);
          setAnalysis(null);
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    fetchMeetingData();

    return () => {
      cancelled = true;
    };
  }, [meetingId]);

  return {
    meeting,
    transcript,
    analysis,
    loading,
    error
  };
}