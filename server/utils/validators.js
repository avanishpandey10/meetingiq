/**
 * Validation utilities for AI-generated data.
 */

/**
 * Validate final meeting analysis.
 *
 * Returns warnings instead of throwing because
 * some AI-extracted fields may legitimately be incomplete.
 */
export function validateAnalysisData(
  analysis
) {
  const warnings = [];

  if (
    !analysis ||
    typeof analysis !== 'object'
  ) {
    return {
      isValid: false,
      warnings: [
        'Analysis object is missing'
      ]
    };
  }

  // ----------------------------------------------------------
  // EXECUTIVE SUMMARY
  // ----------------------------------------------------------

  if (
    typeof analysis.executiveSummary !==
      'string' ||
    !analysis.executiveSummary.trim()
  ) {
    warnings.push(
      'Executive summary is empty'
    );
  }

  // ----------------------------------------------------------
  // ACTION ITEMS
  // ----------------------------------------------------------

  const actionItems =
    Array.isArray(
      analysis.actionItems
    )
      ? analysis.actionItems
      : [];

  actionItems.forEach(
    (item, index) => {
      if (
        !item ||
        typeof item.task !==
          'string' ||
        !item.task.trim()
      ) {
        warnings.push(
          `Action item ${index + 1} has empty task`
        );
      }

      if (
        !item.owner ||
        item.owner ===
          'Unassigned'
      ) {
        warnings.push(
          `Action item "${item?.task || `#${index + 1}`}" has no owner`
        );
      }

      if (
        !item.deadline ||
        item.deadline ===
          'Not specified'
      ) {
        warnings.push(
          `Action item "${item?.task || `#${index + 1}`}" has no deadline`
        );
      }

      if (
        item.confidence !== null &&
        item.confidence !== undefined &&
        (
          typeof item.confidence !==
            'number' ||
          item.confidence < 0 ||
          item.confidence > 1
        )
      ) {
        warnings.push(
          `Action item "${item?.task || `#${index + 1}`}" has invalid confidence score`
        );
      }
    }
  );

  // ----------------------------------------------------------
  // DECISIONS
  // ----------------------------------------------------------

  const decisions =
    Array.isArray(
      analysis.keyDecisions
    )
      ? analysis.keyDecisions
      : [];

  decisions.forEach(
    (decision, index) => {
      if (
        !decision ||
        typeof decision.decision !==
          'string' ||
        !decision.decision.trim()
      ) {
        warnings.push(
          `Decision ${index + 1} is empty`
        );
      }

      if (
        decision.confidence !==
          null &&
        decision.confidence !==
          undefined &&
        (
          typeof decision.confidence !==
            'number' ||
          decision.confidence < 0 ||
          decision.confidence > 1
        )
      ) {
        warnings.push(
          `Decision "${decision?.decision || `#${index + 1}`}" has invalid confidence score`
        );
      }
    }
  );

  // ----------------------------------------------------------
  // TOPICS
  // ----------------------------------------------------------

  const topics =
    Array.isArray(
      analysis.keyTopics
    )
      ? analysis.keyTopics
      : [];

  if (topics.length === 0) {
    warnings.push(
      'No topics identified'
    );
  } else {
    for (
      let i = 0;
      i < topics.length - 1;
      i++
    ) {
      const current =
        topics[i];

      const next =
        topics[i + 1];

      if (
        typeof current.endTime ===
          'number' &&
        typeof next.startTime ===
          'number' &&
        current.endTime <
          next.startTime - 5
      ) {
        warnings.push(
          `Gap detected between topic "${current.title}" and "${next.title}"`
        );
      }
    }
  }

  // ----------------------------------------------------------
  // RISKS
  // ----------------------------------------------------------

  const risks =
    Array.isArray(
      analysis.risks
    )
      ? analysis.risks
      : [];

  risks.forEach(
    (risk, index) => {
      if (
        !risk?.description ||
        !String(
          risk.description
        ).trim()
      ) {
        warnings.push(
          `Risk ${index + 1} has no description`
        );
      }

      if (
        risk?.confidence !==
          null &&
        risk?.confidence !==
          undefined &&
        (
          typeof risk.confidence !==
            'number' ||
          risk.confidence < 0 ||
          risk.confidence > 1
        )
      ) {
        warnings.push(
          `Risk ${index + 1} has invalid confidence`
        );
      }
    }
  );

  // ----------------------------------------------------------
  // BLOCKERS
  // ----------------------------------------------------------

  const blockers =
    Array.isArray(
      analysis.blockers
    )
      ? analysis.blockers
      : [];

  blockers.forEach(
    (blocker, index) => {
      if (
        !blocker?.description ||
        !String(
          blocker.description
        ).trim()
      ) {
        warnings.push(
          `Blocker ${index + 1} has no description`
        );
      }
    }
  );

  // ----------------------------------------------------------
  // OPEN QUESTIONS
  // ----------------------------------------------------------

  const openQuestions =
    Array.isArray(
      analysis.openQuestions
    )
      ? analysis.openQuestions
      : [];

  openQuestions.forEach(
    (question, index) => {
      if (
        !question?.question ||
        !String(
          question.question
        ).trim()
      ) {
        warnings.push(
          `Open question ${index + 1} is empty`
        );
      }
    }
  );

  // ----------------------------------------------------------
  // MEETING SCORE
  // ----------------------------------------------------------

  if (
    analysis.meetingScore
  ) {
    const score =
      analysis.meetingScore;

    const scoreFields = [
      'overall',
      'preparation',
      'decisionClarity',
      'actionability',
      'ownershipClarity',
      'followUpClarity'
    ];

    scoreFields.forEach(
      (field) => {
        const value =
          score[field];

        if (
          value !== null &&
          value !== undefined &&
          (
            typeof value !==
              'number' ||
            value < 0 ||
            value > 100
          )
        ) {
          warnings.push(
            `Meeting score "${field}" is out of range`
          );
        }
      }
    );

    if (
      !Array.isArray(
        score.reasons
      ) ||
      score.reasons.length === 0
    ) {
      warnings.push(
        'Meeting score has no explanations'
      );
    }
  }

  return {
    isValid:
      warnings.length === 0,

    warnings
  };
}

/**
 * Validate a single action item.
 */
export function validateActionItem(
  item
) {
  const errors = [];

  if (
    !item ||
    typeof item !== 'object'
  ) {
    return {
      isValid: false,
      errors: [
        'Action item must be an object'
      ]
    };
  }

  if (
    typeof item.task !==
      'string' ||
    !item.task.trim()
  ) {
    errors.push(
      'Task is required'
    );
  }

  if (
    typeof item.owner !==
      'string' ||
    !item.owner.trim()
  ) {
    errors.push(
      'Owner is required (use "Unassigned" if unknown)'
    );
  }

  if (
    typeof item.deadline !==
      'string' ||
    !item.deadline.trim()
  ) {
    errors.push(
      'Deadline is required (use "Not specified" if unknown)'
    );
  }

  if (
    ![
      'HIGH',
      'MEDIUM',
      'LOW'
    ].includes(
      item.priority
    )
  ) {
    errors.push(
      'Priority must be HIGH, MEDIUM, or LOW'
    );
  }

  if (
    item.confidence !==
      undefined &&
    item.confidence !==
      null &&
    (
      typeof item.confidence !==
        'number' ||
      item.confidence < 0 ||
      item.confidence > 1
    )
  ) {
    errors.push(
      'Confidence must be between 0 and 1'
    );
  }

  return {
    isValid:
      errors.length === 0,

    errors
  };
}