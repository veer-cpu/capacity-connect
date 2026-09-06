/**
 * Pure deterministic trainer matching.
 *
 * Locked Formula:
 *
 * Trainer Match Score =
 *   (40% * Competency Match)
 * + (20% * Experience)
 * + (15% * Training Performance)
 * + (10% * Course Relevance)
 * + (10% * Availability)
 * + (5%  * Learner Feedback)
 *
 * Training Performance is derived from:
 * - latest assessment outcomes
 * - course completion
 * - competency improvement
 *
 * Learner Feedback uses a confidence-adjusted rating.
 *
 * Neutral priors are used only for genuine cold-start cases.
 */

export type CompetencyGapInput = {
  competencyId: string;
  competencyName: string;
  category?: string | null;
  currentScore: number;
  targetScore: number;
  gapScore: number;
};

export type TrainerInput = {
  userId: string;
  fullName: string;
  designation: string | null;
  department: string | null;
  bio: string | null;
  avatarUrl: string | null;
  yearsOfExperience: number | null;
  availabilityStatus: string | null;
  trainerBio: string | null;
  verifiedCompetencies: Array<{
    competencyId: string;
    expertiseScore: number;
    yearsExperience: number | null;
  }>;

  performanceScore: number;
  feedbackScore: number;

  performanceEvidence: {
    assessmentSampleCount: number;
    averageAssessmentScore: number | null;

    enrollmentSampleCount: number;
    completionRate: number | null;

    improvementSampleCount: number;
    competencyImprovementRate: number | null;
  };

  feedbackEvidence: {
    feedbackCount: number;
    averageTrainerRating: number | null;
  };

  assignedCourseCompetencyIds: Set<string>; // competency IDs of published courses assigned to this trainer
};

export type SingleTrainerMatchScore = {
  competencyId: string;
  competencyName: string;
  gapScore: number;
  expertiseScore: number;
  experienceScore: number;
  performanceScore: number;
  relevanceScore: number;
  availabilityScore: number;
  feedbackScore: number;
  score: number;
  explanation: string;
};

export type TrainerMatchResult = {
  trainer: TrainerInput;
  matchScore: number;
  primaryDriver: SingleTrainerMatchScore;
  allMatchingScores: SingleTrainerMatchScore[];
};

/**
 * Calculates Experience component: min((years / 5) * 100, 100)
 */
export function calculateExperienceScore(
  yearsOfExperience: number | null | undefined
): number {
  const yrs = Math.max(yearsOfExperience || 0, 0);
  return Math.min((yrs / 5) * 100, 100);
}

/**
 * Calculates Availability component:
 *   available   => 100
 *   limited     => 50
 *   unavailable => 0
 */
export function calculateAvailabilityScore(
  status: string | null | undefined
): number {
  const norm = (status || "").toLowerCase().trim();
  if (norm === "available") return 100;
  if (norm === "limited") return 50;
  if (norm === "unavailable") return 0;
  return 50; // default fallback
}

/**
 * Calculates Course Relevance MVP component:
 *   100 = assigned to published course mapped to competency
 *   70  = verified expert in competency, no matching assigned course
 *   0   = no relevance
 */
export function calculateCourseRelevanceScore(
  isAssignedToMappedCourse: boolean,
  isVerifiedExpert: boolean
): number {
  if (isAssignedToMappedCourse) return 100;
  if (isVerifiedExpert) return 70;
  return 0;
}

/**
 * Generates a human-readable deterministic explanation string for trainer match.
 */
export function generateTrainerExplanation(
  competencyName: string,
  expertiseScore: number,
  yearsOfExperience: number | null | undefined,
  availabilityStatus: string | null | undefined,
  isAssignedToCourse: boolean,
  performanceScore: number,
  feedbackScore: number
): string {
  const yrs = yearsOfExperience ?? 0;
  const expStr = yrs >= 5 ? "5+ years" : `${yrs} year${yrs === 1 ? "" : "s"}`;
  const availStr = (availabilityStatus || "available").toLowerCase();
  const courseStr = isAssignedToCourse
    ? " and actively teaches a course mapped to this area"
    : "";

  return `Recommended for ${competencyName} due to verified expertise (${expertiseScore.toFixed(
    1
  )}%), ${expStr} experience, ${availStr} availability, training performance score ${performanceScore.toFixed(
    1
  )}/100, and learner feedback score ${feedbackScore.toFixed(
    1
  )}/100${courseStr}. Course relevance is included where applicable.`;
}

/**
 * Calculates match score for a single (trainer, competency gap) pair.
 */
export function calculateSingleTrainerMatch(
  gap: CompetencyGapInput,
  expertiseScore: number,
  yearsOfExperience: number | null | undefined,
  availabilityStatus: string | null | undefined,
  isAssignedToMappedCourse: boolean,
  performanceScore: number,
  feedbackScore: number
): SingleTrainerMatchScore {
  const compScore = Math.min(Math.max(expertiseScore, 0), 100);
  const expScore = calculateExperienceScore(yearsOfExperience);
  const perfScore = Math.min(Math.max(performanceScore, 0), 100);
  const relScore = calculateCourseRelevanceScore(isAssignedToMappedCourse, true);
  const availScore = calculateAvailabilityScore(availabilityStatus);
  const feedScore = Math.min(Math.max(feedbackScore, 0), 100);

  const rawScore =
    0.4 * compScore +
    0.2 * expScore +
    0.15 * perfScore +
    0.1 * relScore +
    0.1 * availScore +
    0.05 * feedScore;

  const score = Number(rawScore.toFixed(1));

  const explanation = generateTrainerExplanation(
    gap.competencyName,
    compScore,
    yearsOfExperience,
    availabilityStatus,
    isAssignedToMappedCourse,
    perfScore,
    feedScore
  );

  return {
    competencyId: gap.competencyId,
    competencyName: gap.competencyName,
    gapScore: gap.gapScore,
    expertiseScore: compScore,
    experienceScore: expScore,
    performanceScore: perfScore,
    relevanceScore: relScore,
    availabilityScore: availScore,
    feedbackScore: feedScore,
    score,
    explanation,
  };
}

/**
 * Aggregates candidate trainer matching against multiple active competency gaps.
 * Uses MAX(score) rule for candidate ranking and primary_driver selection.
 */
export function aggregateTrainerMatch(
  trainer: TrainerInput,
  activeGaps: CompetencyGapInput[]
): TrainerMatchResult | null {
  // Exclude unavailable trainers
  if (
    (trainer.availabilityStatus || "").toLowerCase().trim() === "unavailable"
  ) {
    return null;
  }

  const gapMap = new Map(activeGaps.map((g) => [g.competencyId, g]));
  const matchingScores: SingleTrainerMatchScore[] = [];

  for (const vc of trainer.verifiedCompetencies) {
    const gap = gapMap.get(vc.competencyId);
    if (gap && gap.gapScore > 0) {
      const isAssigned = trainer.assignedCourseCompetencyIds.has(vc.competencyId);
      const match = calculateSingleTrainerMatch(
        gap,
        vc.expertiseScore,
        trainer.yearsOfExperience ?? vc.yearsExperience,
        trainer.availabilityStatus,
        isAssigned,
        trainer.performanceScore,
        trainer.feedbackScore
      );
      matchingScores.push(match);
    }
  }

  if (matchingScores.length === 0) {
    return null; // Trainer has no verified competency mapping matching active gaps
  }

  // Rank by MAX(score)
  matchingScores.sort((a, b) => b.score - a.score);
  const primaryDriver = matchingScores[0];

  return {
    trainer,
    matchScore: primaryDriver.score,
    primaryDriver,
    allMatchingScores: matchingScores,
  };
}
