import { getCourseRecommendations } from "@/lib/competency/get-course-recommendations";
import { getTrainerRecommendations } from "@/lib/competency/get-trainer-recommendations";

export type DevelopmentPlanPriority = "critical" | "high" | "medium" | "low";

export type DevelopmentPlanPreviewItem = {
    competencyId: string;
    competencyName: string;
    currentScore: number;
    targetScore: number;
    gapScore: number;
    priority: DevelopmentPlanPriority;
    recommendedCourse: {
        id: string;
        title: string;
        slug: string;
        recommendationScore: number;
    } | null;
    recommendedTrainer: {
        id: string;
        fullName: string;
        matchScore: number;
    } | null;
    rationale: string;
    sequenceOrder: number;
};

export type DevelopmentPlanPreview = {
    items: DevelopmentPlanPreviewItem[];
};

function derivePriority(gapScore: number): DevelopmentPlanPriority {
    if (gapScore >= 35) return "critical";
    if (gapScore >= 20) return "high";
    if (gapScore >= 10) return "medium";
    return "low";
}

const priorityOrder: Record<DevelopmentPlanPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
};

export async function buildDevelopmentPlanPreview(): Promise<DevelopmentPlanPreview> {
    const [courseData, trainerData] = await Promise.all([
        getCourseRecommendations(),
        getTrainerRecommendations(),
    ]);

    const trainerByCompetency = new Map<string, (typeof trainerData.recommendations)[number]>();
    for (const recommendation of trainerData.recommendations) {
        for (const match of recommendation.allMatchingScores) {
            if (!trainerByCompetency.has(match.competencyId)) {
                trainerByCompetency.set(match.competencyId, recommendation);
            }
        }
    }

    const courseByCompetency = new Map<string, (typeof courseData.recommendations)[number]>();
    for (const recommendation of courseData.recommendations) {
        for (const match of recommendation.allMatchingScores) {
            if (!courseByCompetency.has(match.competencyId)) {
                courseByCompetency.set(match.competencyId, recommendation);
            }
        }
    }

    const items = courseData.activeGaps.map((gap) => {
        const courseRecommendation = courseByCompetency.get(gap.competencyId);
        const trainerRecommendation = trainerByCompetency.get(gap.competencyId);
        const priority = derivePriority(gap.gapScore);

        const recommendedCourse = courseRecommendation
            ? {
                id: courseRecommendation.course.id,
                title: courseRecommendation.course.title,
                slug: courseRecommendation.course.slug,
                recommendationScore: courseRecommendation.recommendationScore,
            }
            : null;
        const recommendedTrainer = trainerRecommendation
            ? {
                id: trainerRecommendation.trainer.userId,
                fullName: trainerRecommendation.trainer.fullName,
                matchScore: trainerRecommendation.matchScore,
            }
            : null;

        const courseText = recommendedCourse
            ? ` Recommended course: ${recommendedCourse.title}.`
            : " No matching course recommendation is currently available.";
        const trainerText = recommendedTrainer
            ? ` Recommended trainer: ${recommendedTrainer.fullName}.`
            : " No matching trainer recommendation is currently available.";

        return {
            competencyId: gap.competencyId,
            competencyName: gap.competencyName,
            currentScore: gap.currentScore,
            targetScore: gap.targetScore,
            gapScore: gap.gapScore,
            priority,
            recommendedCourse,
            recommendedTrainer,
            rationale: `${gap.competencyName} has a ${gap.gapScore.toFixed(1)} point gap from the target.${courseText}${trainerText}`,
            sequenceOrder: 0,
        };
    });

    items.sort((left, right) => {
        const priorityDifference =
            priorityOrder[left.priority] - priorityOrder[right.priority];
        return priorityDifference || right.gapScore - left.gapScore;
    });

    items.forEach((item, index) => {
        item.sequenceOrder = index + 1;
    });

    return { items };
}
