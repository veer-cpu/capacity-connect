/**
 * Pure deterministic functions for calculating course recommendation scores
 * based on active competency gaps, course relevance, and difficulty suitability.
 *
 * Formula:
 *   Recommendation Score = (50% * Gap Match) + (30% * Course Relevance) + (20% * Difficulty Suitability)
 */

export type CompetencyGapInput = {
  competencyId: string;
  competencyName: string;
  category?: string | null;
  currentScore: number;
  targetScore: number;
  gapScore: number;
};

export type CourseInput = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  estimatedDurationMinutes: number | null;
  competencies: Array<{
    competencyId: string;
    relevanceWeight: number;
  }>;
};

export type SingleMatchScore = {
  competencyId: string;
  competencyName: string;
  gapScore: number;
  relevanceWeight: number;
  difficultySuitability: number;
  gapMatchScore: number;
  score: number;
  explanation: string;
};

export type CourseRecommendationResult = {
  course: CourseInput;
  recommendationScore: number;
  primaryDriver: SingleMatchScore;
  allMatchingScores: SingleMatchScore[];
};

/**
 * Calculates Gap Match component: min((gap_score / 40) * 100, 100)
 */
export function calculateGapMatchScore(gapScore: number): number {
  if (gapScore <= 0) return 0;
  return Math.min((gapScore / 40) * 100, 100);
}

/**
 * Calculates Difficulty Suitability component using the documented 4x3 matrix.
 *
 * Trainee Bands:
 *   0  - 39: Beginner     => beginner: 100, intermediate: 60, advanced: 20
 *   40 - 59: Developing   => beginner: 70,  intermediate: 100, advanced: 50
 *   60 - 79: Proficient   => beginner: 40,  intermediate: 100, advanced: 80
 *   80 - 100: Advanced    => beginner: 20,  intermediate: 60, advanced: 100
 */
export function calculateDifficultySuitability(
  currentScore: number,
  difficulty: string | null | undefined
): number {
  const normDifficulty = (difficulty || "").toLowerCase().trim();

  if (currentScore < 40) {
    if (normDifficulty === "beginner") return 100;
    if (normDifficulty === "intermediate") return 60;
    if (normDifficulty === "advanced") return 20;
    return 50;
  }

  if (currentScore < 60) {
    if (normDifficulty === "beginner") return 70;
    if (normDifficulty === "intermediate") return 100;
    if (normDifficulty === "advanced") return 50;
    return 50;
  }

  if (currentScore < 80) {
    if (normDifficulty === "beginner") return 40;
    if (normDifficulty === "intermediate") return 100;
    if (normDifficulty === "advanced") return 80;
    return 50;
  }

  // 80 - 100 (Advanced)
  if (normDifficulty === "beginner") return 20;
  if (normDifficulty === "intermediate") return 60;
  if (normDifficulty === "advanced") return 100;
  return 50;
}

/**
 * Generates a human-readable deterministic explanation string.
 */
export function generateRecommendationExplanation(
  competencyName: string,
  gapScore: number,
  relevanceWeight: number,
  difficulty: string | null | undefined
): string {
  const diffStr = difficulty ? `${difficulty.toLowerCase()} ` : "";
  return `Recommended because your ${competencyName} competency is ${gapScore} points below target, and this ${diffStr}course has a ${relevanceWeight}% relevance match to that area.`;
}

/**
 * Calculates recommendation score for a single (course, competency gap) pair.
 */
export function calculateSingleCompetencyRecommendation(
  gap: CompetencyGapInput,
  relevanceWeight: number,
  courseDifficulty: string | null | undefined
): SingleMatchScore {
  const gapMatch = calculateGapMatchScore(gap.gapScore);
  const relevance = Math.min(Math.max(relevanceWeight, 0), 100);
  const difficultySuitability = calculateDifficultySuitability(
    gap.currentScore,
    courseDifficulty
  );

  const rawScore = 0.5 * gapMatch + 0.3 * relevance + 0.2 * difficultySuitability;
  const score = Number(rawScore.toFixed(1));

  const explanation = generateRecommendationExplanation(
    gap.competencyName,
    gap.gapScore,
    relevance,
    courseDifficulty
  );

  return {
    competencyId: gap.competencyId,
    competencyName: gap.competencyName,
    gapScore: gap.gapScore,
    relevanceWeight: relevance,
    difficultySuitability,
    gapMatchScore: gapMatch,
    score,
    explanation,
  };
}

/**
 * Aggregates candidate course matching against multiple competency gaps.
 * Uses MAX(score) rule for ranking and primary_driver selection.
 */
export function aggregateCourseRecommendation(
  course: CourseInput,
  activeGaps: CompetencyGapInput[]
): CourseRecommendationResult | null {
  const gapMap = new Map(activeGaps.map((g) => [g.competencyId, g]));

  const matchingScores: SingleMatchScore[] = [];

  for (const cc of course.competencies) {
    const gap = gapMap.get(cc.competencyId);
    if (gap && gap.gapScore > 0) {
      const match = calculateSingleCompetencyRecommendation(
        gap,
        cc.relevanceWeight,
        course.difficulty
      );
      matchingScores.push(match);
    }
  }

  if (matchingScores.length === 0) {
    return null; // Course does not map to any active gap
  }

  // Pick score with MAX value
  matchingScores.sort((a, b) => b.score - a.score);
  const primaryDriver = matchingScores[0];

  return {
    course,
    recommendationScore: primaryDriver.score,
    primaryDriver,
    allMatchingScores: matchingScores,
  };
}
