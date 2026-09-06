import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type TrainerFeedbackSummary = {
    trainerId: string;
    totalFeedback: number;
    averageTrainerRating: number | null;
    averageCourseRating: number | null;
    fiveStarCount: number;
    fourStarCount: number;
    threeStarCount: number;
    twoStarCount: number;
    oneStarCount: number;
};

type TrainerFeedbackSummaryRow = {
    trainer_id: string;
    total_feedback: number | string;
    average_trainer_rating: number | string | null;
    average_course_rating: number | string | null;
    five_star_count: number | string;
    four_star_count: number | string;
    three_star_count: number | string;
    two_star_count: number | string;
    one_star_count: number | string;
};

export async function getTrainerFeedbackSummary(): Promise<TrainerFeedbackSummary> {
    const { user } = await requireRole("trainer");
    const supabase = await createClient();
    const { data, error } = await supabase
        .rpc("get_trainer_feedback_summary", { p_trainer_id: user.id })
        .maybeSingle();

    if (error) {
        console.error("Unable to load trainer feedback summary:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });

        throw new Error(`Unable to load feedback summary: ${error.message}`);
    }

    if (!data) {
        return {
            trainerId: user.id,
            totalFeedback: 0,
            averageTrainerRating: null,
            averageCourseRating: null,
            fiveStarCount: 0,
            fourStarCount: 0,
            threeStarCount: 0,
            twoStarCount: 0,
            oneStarCount: 0,
        };
    }

    const row = data as TrainerFeedbackSummaryRow;

    return {
        trainerId: row.trainer_id,
        totalFeedback: Number(row.total_feedback),
        averageTrainerRating:
            row.average_trainer_rating === null
                ? null
                : Number(row.average_trainer_rating),
        averageCourseRating:
            row.average_course_rating === null
                ? null
                : Number(row.average_course_rating),
        fiveStarCount: Number(row.five_star_count),
        fourStarCount: Number(row.four_star_count),
        threeStarCount: Number(row.three_star_count),
        twoStarCount: Number(row.two_star_count),
        oneStarCount: Number(row.one_star_count),
    };
}
