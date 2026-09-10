import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type AdminFeedbackOverview = {
    trainerId: string;
    trainerName: string | null;
    trainerEmail: string;
    feedbackCount: number;
    averageTrainerRating: number | null;
    averageCourseRating: number | null;
};

type AdminFeedbackOverviewRow = {
    trainer_id: string;
    trainer_name: string | null;
    trainer_email: string;
    feedback_count: number | string;
    average_trainer_rating: number | string | null;
    average_course_rating: number | string | null;
};

export async function getAdminFeedbackOverview(): Promise<
    AdminFeedbackOverview[]
> {
    await requireRole("admin");

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("admin_feedback_overview");

    if (error) {
        console.error("Unable to load admin feedback overview:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
throw new Error(
  "Unable to load feedback overview."
);
    }

    return (data ?? []).map((row: AdminFeedbackOverviewRow) => ({
        trainerId: row.trainer_id,
        trainerName: row.trainer_name,
        trainerEmail: row.trainer_email,
        feedbackCount: Number(row.feedback_count),
        averageTrainerRating:
            row.average_trainer_rating === null
                ? null
                : Number(row.average_trainer_rating),
        averageCourseRating:
            row.average_course_rating === null
                ? null
                : Number(row.average_course_rating),
    }));
}
