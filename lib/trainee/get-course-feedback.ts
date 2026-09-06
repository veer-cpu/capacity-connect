import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type TraineeCourseFeedback = {
    id: string;
    courseRating: number;
    trainerRating: number | null;
    comments: string | null;
    createdAt: string;
    updatedAt: string;
};

type CourseFeedbackRow = {
    id: string;
    course_rating: number;
    trainer_rating: number | null;
    comments: string | null;
    created_at: string;
    updated_at: string;
};

export async function getTraineeCourseFeedback(
    courseId: string
): Promise<TraineeCourseFeedback | null> {
    const { user } = await requireRole("trainee");

    const parsedCourseId = z.string().uuid().safeParse(courseId);

    if (!parsedCourseId.success) {
        throw new Error("Invalid course ID.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("course_feedback")
        .select(
            "id, course_rating, trainer_rating, comments, created_at, updated_at"
        )
        .eq("course_id", parsedCourseId.data)
        .eq("trainee_id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Unable to load course feedback:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });

        throw new Error(`Unable to load course feedback: ${error.message}`);
    }

    if (!data) {
        return null;
    }

    const feedback = data as CourseFeedbackRow;

    return {
        id: feedback.id,
        courseRating: Number(feedback.course_rating),
        trainerRating:
            feedback.trainer_rating === null
                ? null
                : Number(feedback.trainer_rating),
        comments: feedback.comments,
        createdAt: feedback.created_at,
        updatedAt: feedback.updated_at,
    };
}