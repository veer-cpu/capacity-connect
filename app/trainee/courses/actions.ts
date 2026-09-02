"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/require-role";

const lessonProgressSchema = z.object({
  enrollmentId: z.string().uuid(),
  lessonId: z.string().uuid(),
  courseSlug: z.string().min(1),
});

export async function markLessonComplete(formData: FormData) {
  await requireRole("trainee");

  const parsed = lessonProgressSchema.safeParse({
    enrollmentId: formData.get("enrollmentId"),
    lessonId: formData.get("lessonId"),
    courseSlug: formData.get("courseSlug"),
  });

  if (!parsed.success) {
    throw new Error("Invalid lesson progress request.");
  }

  const {
    enrollmentId,
    lessonId,
    courseSlug,
  } = parsed.data;

  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "mark_lesson_complete",
    {
      p_enrollment_id: enrollmentId,
      p_lesson_id: lessonId,
    }
  );

 if (error) {
  console.error("Lesson progress RPC error:", {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });

  throw new Error(
    `Unable to update lesson progress: ${error.message}`
  );
}

  revalidatePath(
    `/trainee/courses/${courseSlug}`
  );

  revalidatePath("/trainee/courses");
}