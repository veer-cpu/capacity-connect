"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const feedbackSchema = z.object({
    courseId: z.string().uuid(),
    courseSlug: z.string().min(1),
    courseRating: z.coerce.number().int().min(1).max(5),
    trainerRating: z.preprocess(
        (value) => (value === "" || value === null ? undefined : value),
        z.coerce.number().int().min(1).max(5).optional()
    ),
    comments: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().max(1000).optional()
    ),
});

export async function submitCourseFeedback(formData: FormData): Promise<void> {
    const { user } = await requireRole("trainee");

    const parsed = feedbackSchema.safeParse({
        courseId: formData.get("courseId"),
        courseSlug: formData.get("courseSlug"),
        courseRating: formData.get("courseRating"),
        trainerRating: formData.get("trainerRating"),
        comments: formData.get("comments"),
    });

    if (!parsed.success) {
        throw new Error("Invalid course feedback.");
    }

    const supabase = await createClient();
    const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id, trainer_id")
        .eq("id", parsed.data.courseId)
        .single();

    if (courseError || !course) {
        throw new Error("Course not found.");
    }

    const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", parsed.data.courseId)
        .eq("trainee_id", user.id)
        .in("status", ["active", "completed"])
        .maybeSingle();

    if (enrollmentError) {
        console.error("Unable to verify course enrollment for feedback:", {
            message: enrollmentError.message,
            code: enrollmentError.code,
            details: enrollmentError.details,
            hint: enrollmentError.hint,
        });

        throw new Error("Unable to verify your course enrollment.");
    }

    if (!enrollment) {
        throw new Error(
            "You can only submit feedback for an active or completed course."
        );
    }

    
    const { error: feedbackError } = await supabase.rpc(
  "submit_course_feedback",
  {
    p_course_id: parsed.data.courseId,
    p_course_rating: parsed.data.courseRating,
    p_trainer_rating:
      parsed.data.trainerRating ?? null,
    p_comments:
      parsed.data.comments?.trim() || null,
  }
);

if (feedbackError) {
  console.error("Unable to save course feedback:", {
    message: feedbackError.message,
    code: feedbackError.code,
    details: feedbackError.details,
    hint: feedbackError.hint,
  });

  throw new Error(
    `Unable to save course feedback: ${feedbackError.message}`
  );
}

   
    revalidatePath(`/trainee/courses/${parsed.data.courseSlug}`);
}