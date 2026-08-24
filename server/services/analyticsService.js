/**
 * Analytics Service
 *
 * Provides aggregate statistics and insights
 * for the MeetingIQ platform and individual meetings.
 */

import mongoose from 'mongoose';

import Meeting from '../models/Meeting.js';
import Analysis from '../models/Analysis.js';
import ActionItem from '../models/ActionItem.js';
import Transcript from '../models/Transcript.js';

export const analyticsService = {

  // ============================================================
  // PLATFORM ANALYTICS
  // ============================================================

  async getPlatformAnalytics() {
    const [
      totalMeetings,
      completedMeetings,
      processingMeetings,
      failedMeetings,
      totalActionItems,
      completedActionItems,
      totalDecisionsResult,
      totalRisksResult,
      averageMeetingScoreResult
    ] = await Promise.all([
      Meeting.countDocuments(),

      Meeting.countDocuments({
        status: 'COMPLETED'
      }),

      Meeting.countDocuments({
        status: 'PROCESSING'
      }),

      Meeting.countDocuments({
        status: 'FAILED'
      }),

      ActionItem.countDocuments(),

      ActionItem.countDocuments({
        status: 'COMPLETED'
      }),

      Analysis.aggregate([
        {
          $unwind: '$keyDecisions'
        },
        {
          $count: 'total'
        }
      ]),

      Analysis.aggregate([
        {
          $unwind: '$risks'
        },
        {
          $count: 'total'
        }
      ]),

      Analysis.aggregate([
        {
          $match: {
            'meetingScore.overall': {
              $type: 'number'
            }
          }
        },
        {
          $group: {
            _id: null,
            average: {
              $avg: '$meetingScore.overall'
            }
          }
        }
      ])
    ]);

    // ----------------------------------------------------------
    // WEEKLY TREND
    // ----------------------------------------------------------

    const now = new Date();

    const lastWeek = new Date(now);
    lastWeek.setDate(
      lastWeek.getDate() - 7
    );

    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(
      twoWeeksAgo.getDate() - 14
    );

    const [
      lastWeekMeetings,
      previousWeekMeetings
    ] = await Promise.all([
      Meeting.countDocuments({
        createdAt: {
          $gte: lastWeek,
          $lte: now
        }
      }),

      Meeting.countDocuments({
        createdAt: {
          $gte: twoWeeksAgo,
          $lt: lastWeek
        }
      })
    ]);

    let meetingTrend = 0;

    if (previousWeekMeetings > 0) {
      meetingTrend =
        (
          (lastWeekMeetings -
            previousWeekMeetings) /
          previousWeekMeetings
        ) * 100;
    } else if (lastWeekMeetings > 0) {
      // No previous-week baseline.
      // We do not call this a mathematically
      // meaningful percentage increase.
      meetingTrend = null;
    }

    // ----------------------------------------------------------
    // TOP ACTION-ITEM OWNERS
    // ----------------------------------------------------------

    const topOwners =
      await ActionItem.aggregate([
        {
          $match: {
            owner: {
              $exists: true,
              $nin: [
                '',
                'Unassigned'
              ]
            }
          }
        },

        {
          $group: {
            _id: '$owner',
            count: {
              $sum: 1
            }
          }
        },

        {
          $sort: {
            count: -1
          }
        },

        {
          $limit: 5
        }
      ]);

    // ----------------------------------------------------------
    // PRIORITY DISTRIBUTION
    // ----------------------------------------------------------

    const priorityDistribution =
      await ActionItem.aggregate([
        {
          $group: {
            _id: '$priority',
            count: {
              $sum: 1
            }
          }
        },

        {
          $sort: {
            count: -1
          }
        }
      ]);

    // ----------------------------------------------------------
    // LANGUAGE DISTRIBUTION
    // ----------------------------------------------------------

    const languageDistribution =
      await Meeting.aggregate([
        {
          $match: {
            detectedLanguage: {
              $exists: true,
              $nin: [
                '',
                null,
                'unknown'
              ]
            }
          }
        },

        {
          $group: {
            _id: '$detectedLanguage',
            count: {
              $sum: 1
            }
          }
        },

        {
          $sort: {
            count: -1
          }
        }
      ]);

    // ----------------------------------------------------------
    // FINAL RESPONSE
    // ----------------------------------------------------------

    return {
      overview: {
        totalMeetings,

        completedMeetings,

        processingMeetings,

        failedMeetings,

        completionRate:
          totalMeetings > 0
            ? Number(
                (
                  (completedMeetings /
                    totalMeetings) *
                  100
                ).toFixed(2)
              )
            : 0,

        totalActionItems,

        completedActionItems,

        actionCompletionRate:
          totalActionItems > 0
            ? Number(
                (
                  (completedActionItems /
                    totalActionItems) *
                  100
                ).toFixed(2)
              )
            : 0,

        totalDecisions:
          totalDecisionsResult[0]
            ?.total ?? 0,

        totalRisks:
          totalRisksResult[0]
            ?.total ?? 0,

        averageMeetingScore:
          Math.round(
            averageMeetingScoreResult[0]
              ?.average ?? 0
          )
      },

      trends: {
        lastWeekMeetings,

        previousWeekMeetings,

        meetingTrend:
          meetingTrend === null
            ? null
            : Number(
                meetingTrend.toFixed(2)
              )
      },

      distributions: {
        topOwners:
          topOwners.map((item) => ({
            owner: item._id,
            count: item.count
          })),

        priorityDistribution:
          priorityDistribution.map(
            (item) => ({
              priority: item._id,
              count: item.count
            })
          ),

        languageDistribution:
          languageDistribution.map(
            (item) => ({
              language: item._id,
              count: item.count
            })
          )
      }
    };
  },

  // ============================================================
  // SINGLE MEETING ANALYTICS
  // ============================================================

  async getMeetingAnalytics(
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
      meeting,
      analysis,
      transcript,
      actionItems
    ] = await Promise.all([
      Meeting.findById(
        meetingId
      ).lean(),

      Analysis.findOne({
        meetingId
      }).lean(),

      Transcript.findOne({
        meetingId
      }).lean(),

      ActionItem.find({
        meetingId
      }).lean()
    ]);

    if (!meeting) {
      throw new Error(
        'Meeting not found.'
      );
    }

    // ----------------------------------------------------------
    // TRANSCRIPT WORD COUNT
    // ----------------------------------------------------------

    const fullText =
      typeof transcript?.fullText ===
      'string'
        ? transcript.fullText.trim()
        : '';

    const wordCount =
      fullText.length > 0
        ? fullText.split(/\s+/)
            .filter(Boolean)
            .length
        : 0;

    // ----------------------------------------------------------
    // ACTION ITEM STATS
    // ----------------------------------------------------------

    const actionItemStats = {
      total: actionItems.length,

      completed:
        actionItems.filter(
          (item) =>
            item.status ===
            'COMPLETED'
        ).length,

      inProgress:
        actionItems.filter(
          (item) =>
            item.status ===
            'IN_PROGRESS'
        ).length,

      pending:
        actionItems.filter(
          (item) =>
            item.status ===
            'PENDING'
        ).length,

      highPriority:
        actionItems.filter(
          (item) =>
            item.priority ===
            'HIGH'
        ).length,

      mediumPriority:
        actionItems.filter(
          (item) =>
            item.priority ===
            'MEDIUM'
        ).length,

      lowPriority:
        actionItems.filter(
          (item) =>
            item.priority ===
            'LOW'
        ).length,

      unassigned:
        actionItems.filter(
          (item) =>
            !item.owner ||
            item.owner ===
              'Unassigned'
        ).length
    };

    // ----------------------------------------------------------
    // MEETING ANALYTICS
    // ----------------------------------------------------------

    return {
      meeting: {
        id: meeting._id,

        title:
          meeting.title ||
          'Untitled Meeting',

        duration:
          meeting.duration ?? 0,

        language:
          meeting.detectedLanguage ||
          'unknown',

        processedAt:
          meeting.processedAt ||
          null,

        status:
          meeting.status
      },

      analysis: {
        topics:
          analysis?.keyTopics
            ?.length ?? 0,

        decisions:
          analysis?.keyDecisions
            ?.length ?? 0,

        actionItems:
          analysis?.actionItems
            ?.length ??
          actionItems.length,

        risks:
          analysis?.risks
            ?.length ?? 0,

        blockers:
          analysis?.blockers
            ?.length ?? 0,

        openQuestions:
          analysis?.openQuestions
            ?.length ?? 0,

        meetingScore:
          analysis?.meetingScore
            ?.overall ?? 0
      },

      transcript: {
        segments:
          transcript?.segments
            ?.length ?? 0,

        speakers:
          transcript?.speakerStats
            ?.length ?? 0,

        wordCount
      },

      actionItems:
        actionItemStats
    };
  }
};