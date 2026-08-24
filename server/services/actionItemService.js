import ActionItem from '../models/ActionItem.js';
import { validateActionItem } from '../utils/validators.js';

/**
 * Action Item Service
 *
 * Handles creation, retrieval, filtering, updating,
 * and statistics for meeting action items.
 */
export const actionItemService = {
  // ============================================================
  // GET ALL ACTION ITEMS
  // ============================================================

  async getActionItems(filters = {}) {
    const query = {};

    if (filters.status) {
      const validStatuses = [
        'PENDING',
        'IN_PROGRESS',
        'COMPLETED'
      ];

      if (!validStatuses.includes(filters.status)) {
        throw new Error(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        );
      }

      query.status = filters.status;
    }

    if (filters.owner) {
      query.owner = filters.owner;
    }

    if (filters.priority) {
      const validPriorities = [
        'HIGH',
        'MEDIUM',
        'LOW'
      ];

      if (!validPriorities.includes(filters.priority)) {
        throw new Error(
          `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
        );
      }

      query.priority = filters.priority;
    }

    if (filters.meetingId) {
      query.meetingId = filters.meetingId;
    }

    const items = await ActionItem.find(query)
      .populate(
        'meetingId',
        'title date duration'
      )
      .sort({
        createdAt: -1
      })
      .lean();

    return items;
  },

  // ============================================================
  // GET SINGLE ACTION ITEM
  // ============================================================

  async getActionItem(itemId) {
    if (!itemId) {
      throw new Error(
        'Action item ID is required.'
      );
    }

    const item =
      await ActionItem.findById(itemId)
        .populate(
          'meetingId',
          'title date duration'
        )
        .lean();

    if (!item) {
      throw new Error(
        'Action item not found.'
      );
    }

    return item;
  },

  // ============================================================
  // UPDATE ACTION ITEM
  // ============================================================

  async updateActionItem(
    itemId,
    updates = {}
  ) {
    if (!itemId) {
      throw new Error(
        'Action item ID is required.'
      );
    }

    const item =
      await ActionItem.findById(itemId);

    if (!item) {
      throw new Error(
        'Action item not found.'
      );
    }

    // ----------------------------------------------------------
    // Allowed fields
    // ----------------------------------------------------------

    const allowedFields = [
      'task',
      'owner',
      'deadline',
      'priority',
      'status'
    ];

    const safeUpdates = {};

    for (const field of allowedFields) {
      if (
        updates[field] !== undefined
      ) {
        safeUpdates[field] =
          updates[field];
      }
    }

    // ----------------------------------------------------------
    // Validate status
    // ----------------------------------------------------------

    if (safeUpdates.status) {
      const validStatuses = [
        'PENDING',
        'IN_PROGRESS',
        'COMPLETED'
      ];

      if (
        !validStatuses.includes(
          safeUpdates.status
        )
      ) {
        throw new Error(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        );
      }
    }

    // ----------------------------------------------------------
    // Validate priority
    // ----------------------------------------------------------

    if (safeUpdates.priority) {
      const validPriorities = [
        'HIGH',
        'MEDIUM',
        'LOW'
      ];

      if (
        !validPriorities.includes(
          safeUpdates.priority
        )
      ) {
        throw new Error(
          `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
        );
      }
    }

    // ----------------------------------------------------------
    // Validate task
    // ----------------------------------------------------------

    if (
      safeUpdates.task !== undefined
    ) {
      if (
        typeof safeUpdates.task !==
          'string' ||
        !safeUpdates.task.trim()
      ) {
        throw new Error(
          'Task must be a non-empty string.'
        );
      }

      safeUpdates.task =
        safeUpdates.task.trim();
    }

    // ----------------------------------------------------------
    // Validate owner
    // ----------------------------------------------------------

    if (
      safeUpdates.owner !== undefined
    ) {
      if (
        typeof safeUpdates.owner !==
          'string'
      ) {
        throw new Error(
          'Owner must be a string.'
        );
      }

      safeUpdates.owner =
        safeUpdates.owner.trim() ||
        'Unassigned';
    }

    // ----------------------------------------------------------
    // Validate deadline
    // ----------------------------------------------------------

    if (
      safeUpdates.deadline !==
      undefined
    ) {
      if (
        typeof safeUpdates.deadline !==
          'string'
      ) {
        throw new Error(
          'Deadline must be a string.'
        );
      }

      safeUpdates.deadline =
        safeUpdates.deadline.trim() ||
        'Not specified';
    }

    // ----------------------------------------------------------
    // Apply safe updates only
    // ----------------------------------------------------------

    Object.assign(
      item,
      safeUpdates
    );

    await item.save();

    return item;
  },

  // ============================================================
  // GET ACTION ITEM STATISTICS
  // ============================================================

  async getActionItemStats(
    filters = {}
  ) {
    const match = {};

    if (filters.meetingId) {
      match.meetingId =
        filters.meetingId;
    }

    const stats =
      await ActionItem.aggregate([
        {
          $match: match
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: 1
            },

            pending: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      '$status',
                      'PENDING'
                    ]
                  },
                  1,
                  0
                ]
              }
            },

            inProgress: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      '$status',
                      'IN_PROGRESS'
                    ]
                  },
                  1,
                  0
                ]
              }
            },

            completed: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      '$status',
                      'COMPLETED'
                    ]
                  },
                  1,
                  0
                ]
              }
            },

            highPriority: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      '$priority',
                      'HIGH'
                    ]
                  },
                  1,
                  0
                ]
              }
            },

            mediumPriority: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      '$priority',
                      'MEDIUM'
                    ]
                  },
                  1,
                  0
                ]
              }
            },

            lowPriority: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      '$priority',
                      'LOW'
                    ]
                  },
                  1,
                  0
                ]
              }
            },

            unassigned: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      {
                        $eq: [
                          '$owner',
                          'Unassigned'
                        ]
                      },
                      {
                        $eq: [
                          '$owner',
                          ''
                        ]
                      }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

    if (stats.length === 0) {
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
        unassigned: 0
      };
    }

    return stats[0];
  },

  // ============================================================
  // VALIDATE ACTION ITEM
  // ============================================================

  validateActionItemData(
    actionItem
  ) {
    if (!actionItem) {
      throw new Error(
        'Action item data is required.'
      );
    }

    /*
     * Use the project's shared validator when
     * available, but don't assume its exact
     * return structure.
     */
    const validation =
      validateActionItem(
        actionItem
      );

    if (
      validation === false
    ) {
      throw new Error(
        'Invalid action item data.'
      );
    }

    if (
      validation &&
      validation.isValid === false
    ) {
      throw new Error(
        validation.error ||
          validation.message ||
          'Invalid action item data.'
      );
    }

    return true;
  }
};