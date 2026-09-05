"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const createAssessmentSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  passingScore: z.coerce.number().min(0).max(100),
  deadline: z.coerce.string().optional().or(z.literal("")),
});

export async function createAssessment(formData: FormData): Promise<void> {
  const { user } = await requireRole("trainer");

  const parsed = createAssessmentSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    passingScore: formData.get("passingScore"),
    deadline: formData.get("deadline") ?? "",
  });

  if (!parsed.success) {
    throw new Error("Invalid assessment data.");
  }

  const data = parsed.data;
  const sanitizedDescription = data.description?.trim() || null;
  const trimmedTitle = data.title.trim();

  const supabase = await createClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, slug")
    .eq("id", data.courseId)
    .eq("trainer_id", user.id)
    .maybeSingle();

  if (courseError) {
    console.error(
      "Unable to verify course ownership for assessment create:",
      courseError
    );

    throw new Error("Unable to verify course ownership.");
  }

  if (!course) {
    throw new Error(
      "You are not authorized to create assessments for this course."
    );
  }

  const normalizedDeadline = data.deadline
    ? new Date(data.deadline).toISOString()
    : null;

  const { error: insertError } = await supabase.from("assessments").insert({
    course_id: course.id,
    title: trimmedTitle,
    description: sanitizedDescription,
    passing_score: Number(data.passingScore),
    deadline: normalizedDeadline,
    status: "draft",
    created_by: user.id,
  });

  if (insertError) {
    console.error(
      "Unable to create assessment:",
      insertError
    );

    throw new Error("Unable to create assessment.");
  }

  revalidatePath(`/trainer/courses/${course.slug}/assessments`);
  redirect(`/trainer/courses/${course.slug}/assessments`);
}
