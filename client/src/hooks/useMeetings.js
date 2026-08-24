import {
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';

import {
  meetingService
} from '../services/meetingService';

export function useMeetings(
  filters = {}
) {
  const [
    meetings,
    setMeetings
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState(null);

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        status:
          filters?.status || '',
        search:
          filters?.search || '',
        limit:
          Number(filters?.limit) ||
          50,
        sortBy:
          filters?.sortBy ||
          ''
      }),
    [
      filters?.status,
      filters?.search,
      filters?.limit,
      filters?.sortBy
    ]
  );

  const fetchMeetings =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const normalizedFilters =
          JSON.parse(filterKey);

        const data =
          await meetingService.getMeetings(
            normalizedFilters
          );

        setMeetings(
          Array.isArray(
            data?.meetings
          )
            ? data.meetings
            : []
        );
      } catch (err) {
        console.error(
          'Failed to fetch meetings:',
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.message ||
            'Failed to fetch meetings.'
        );

        setMeetings([]);
      } finally {
        setLoading(false);
      }
    }, [filterKey]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const deleteMeeting =
    useCallback(
      async (meetingId) => {
        if (!meetingId) {
          throw new Error(
            'Meeting ID is required.'
          );
        }

        try {
          await meetingService.deleteMeeting(
            meetingId
          );

          setMeetings(
            (prev) =>
              prev.filter(
                (meeting) =>
                  meeting._id !==
                  meetingId
              )
          );
        } catch (err) {
          console.error(
            'Failed to delete meeting:',
            err
          );

          throw err;
        }
      },
      []
    );

  return {
    meetings,
    loading,
    error,
    deleteMeeting,
    refreshMeetings:
      fetchMeetings
  };
}