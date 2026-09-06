import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type DevelopmentPlanItem = {
    id: string;
    sequenceOrder: number;
    competencyId: string;
    competencyName: string;
    currentScore: number;
    targetScore: number;
    gapScore: number;
    priority: string;
    recommendedCourseId: string | null;
    recommendedCourseTitle: string | null;
    recommendedCourseSlug: string | null;
    recommendedTrainerId: string | null;
    recommendedTrainerName: string | null;
    courseRecommendationScore: number | null;
    trainerMatchScore: number | null;
    rationale: string | null;
    status: string;
};

export type ActiveDevelopmentPlan = {
    id: string;
    title: string;
    startDate: string | null;
    targetDate: string | null;
    status: string;
    progressPercentage: number;
    items: DevelopmentPlanItem[];
};

export async function getActiveDevelopmentPlan(): Promise<ActiveDevelopmentPlan | null> {
    const { user } = await requireRole("trainee");
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("development_plans")
        .select(
            `id, title, start_date, target_date, status, 
			development_plan_items (
				id, sequence_order, current_score_snapshot, target_score_snapshot, gap_score_snapshot, priority,
				recommended_course_id, recommended_trainer_id,
				course_recommendation_score, trainer_match_score, rationale, status,
				competency_id,
				competencies (name),
				courses (title, slug),
				trainer_directory (full_name)
			)`
        )
        .eq("trainee_id", user.id)
        .eq("status", "active")
        .maybeSingle();

    if (error) {
        console.error("Unable to load active development plan:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(`Unable to load development plan: ${error.message}`);
    }

    if (!data) return null;

    type JoinedItem = {
        id: string;
        sequence_order: number;
        current_score_snapshot: number | string;
        target_score_snapshot: number | string;
        gap_score_snapshot: number | string;
        priority: string;
        recommended_course_id: string | null;
        recommended_trainer_id: string | null;
        course_recommendation_score: number | string | null;
        trainer_match_score: number | string | null;
        rationale: string | null;
        status: string;
        competency_id: string;
        competencies: { name: string } | { name: string }[] | null;
        courses: { title: string; slug: string } | { title: string; slug: string }[] | null;
        trainer_directory: { full_name: string | null } | { full_name: string | null }[] | null;
    };

 

    const joinedPlan = data as typeof data & { development_plan_items: JoinedItem[] | null };
    const items = (joinedPlan.development_plan_items ?? [])
        .map((item) => {
            const competency = Array.isArray(item.competencies)
                ? item.competencies[0]
                : item.competencies;
            const course = Array.isArray(item.courses) ? item.courses[0] : item.courses;
            const trainer = Array.isArray(item.trainer_directory)
                ? item.trainer_directory[0]
                : item.trainer_directory;

                

            return {
                id: item.id,
                sequenceOrder: Number(item.sequence_order),
                competencyId: item.competency_id,
                competencyName: competency?.name ?? "Unknown competency",
                currentScore: Number(item.current_score_snapshot),
                targetScore: Number(item.target_score_snapshot),
                gapScore: Number(item.gap_score_snapshot),
                priority: item.priority,
                recommendedCourseId: item.recommended_course_id,
                recommendedCourseTitle: course?.title ?? null,
                recommendedCourseSlug: course?.slug ?? null,
                recommendedTrainerId: item.recommended_trainer_id,
                recommendedTrainerName: trainer?.full_name ?? null,
                courseRecommendationScore:
                    item.course_recommendation_score === null
                        ? null
                        : Number(item.course_recommendation_score),
                trainerMatchScore:
                    item.trainer_match_score === null
                        ? null
                        : Number(item.trainer_match_score),
                rationale: item.rationale,
                status: item.status,
            };
        })
        .sort((left, right) => left.sequenceOrder - right.sequenceOrder);
   const nonSkippedItems = items.filter(
  (item) => item.status !== "skipped"
);

const completedItems = nonSkippedItems.filter(
  (item) => item.status === "completed"
);

const progressPercentage =
  nonSkippedItems.length === 0
    ? 0
    : Math.round(
        (completedItems.length / nonSkippedItems.length) * 100
      );
    return {
        id: data.id,
        title: data.title,
        startDate: data.start_date,
        targetDate: data.target_date,
        status: data.status,
        progressPercentage,
        items,
    };
}