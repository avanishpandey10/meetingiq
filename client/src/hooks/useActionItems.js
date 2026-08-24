import {
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';

import { actionService } from '../services/actionService';

export function useActionItems(
  filters = {}
) {
  const [
    items,
    setItems
  ] = useState([]);

  const [
    stats,
    setStats
  ] = useState(null);

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
        owner:
          filters?.owner || '',
        priority:
          filters?.priority || '',
        meetingId:
          filters?.meetingId || ''
      }),
    [
      filters?.status,
      filters?.owner,
      filters?.priority,
      filters?.meetingId
    ]
  );

  const fetchItems =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const normalizedFilters =
          JSON.parse(filterKey);

        const [
          itemsData,
          statsData
        ] = await Promise.all([
          actionService.getActionItems(
            normalizedFilters
          ),
          actionService.getActionItemStats(
            normalizedFilters.meetingId
              ? {
                  meetingId:
                    normalizedFilters.meetingId
                }
              : undefined
          )
        ]);

        setItems(
          Array.isArray(
            itemsData?.items
          )
            ? itemsData.items
            : []
        );

        setStats(
          statsData?.stats ||
            null
        );
      } catch (err) {
        console.error(
          'Failed to fetch action items:',
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.message ||
            'Failed to fetch action items.'
        );

        setItems([]);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }, [filterKey]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateItemStatus =
    useCallback(
      async (
        itemId,
        status
      ) => {
        if (!itemId) {
          throw new Error(
            'Action item ID is required.'
          );
        }

        if (
          ![
            'PENDING',
            'IN_PROGRESS',
            'COMPLETED'
          ].includes(status)
        ) {
          throw new Error(
            'Invalid action item status.'
          );
        }

        try {
          const updatedItem =
            await actionService.updateActionItem(
              itemId,
              { status }
            );

          const returnedItem =
            updatedItem?.item;

          setItems(
            (prev) =>
              prev.map(
                (item) =>
                  item._id ===
                  itemId
                    ? {
                        ...item,
                        ...(returnedItem ||
                          {})
                      }
                    : item
              )
          );

          /*
           * Refresh statistics after status update.
           */
          const normalizedFilters =
            JSON.parse(
              filterKey
            );

          const statsData =
            await actionService.getActionItemStats(
              normalizedFilters.meetingId
                ? {
                    meetingId:
                      normalizedFilters.meetingId
                  }
                : undefined
            );

          setStats(
            statsData?.stats ||
              null
          );

          return updatedItem;
        } catch (err) {
          console.error(
            'Failed to update action item:',
            err
          );

          throw err;
        }
      },
      [filterKey]
    );

  return {
    items,
    stats,
    loading,
    error,
    updateItemStatus,
    refreshItems: fetchItems
  };
}