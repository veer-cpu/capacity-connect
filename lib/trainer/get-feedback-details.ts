import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type TrainerFeedbackDetail = {
    feedbackId: string;
    courseId: string;
    courseTitle: string;
    courseRating: number | null;
    trainerRating: number | null;
    comments: string | null;
    createdAt: string;
    updatedAt: string;
};

type TrainerFeedbackDetailRow = {
    feedback_id: string;
    course_id: string;
    course_title: string;
    course_rating: number | string | null;
    trainer_rating: number | string | null;
    comments: string | null;
    created_at: string;
    updated_at: string;
};

export async function getTrainerFeedbackDetails(): Promise<
    TrainerFeedbackDetail[]
> {
    const { user } = await requireRole("trainer");
    const supabase = await createClient();
    const { data, error } = await supabase.rpc(
        "get_trainer_feedback_details",
        { p_trainer_id: user.id }
    );

    if (error) {
        console.error("Unable to load trainer feedback details:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });

        throw new Error(`Unable to load feedback details: ${error.message}`);
    }

    return (data ?? []).map((row: TrainerFeedbackDetailRow) => ({
        feedbackId: row.feedback_id,
        courseId: row.course_id,
        courseTitle: row.course_title,
        courseRating:
            row.course_rating === null ? null : Number(row.course_rating),
        trainerRating:
            row.trainer_rating === null ? null : Number(row.trainer_rating),
        comments: row.comments,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
}
