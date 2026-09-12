"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const optionalUuid = z.preprocess(
  (val) => (val === "" || val === "none" ? undefined : val),
  z.string().uuid().optional()
);

const optionalDateTime = z.preprocess(
  (val) => (val === "" ? null : val),
  z.union([
    z.null(),
    z.string().refine((val) => !Number.isNaN(new Date(val).getTime()), {
      message: "Due date must be a valid date and time.",
    }),
  ])
);

const assignmentSaveSchema = z.object({
  id: optionalUuid,
  courseId: z.string().uuid(),
  slug: z.string().trim().min(1),
  moduleId: optionalUuid,
  title: z.string().trim().min(2).max(150),
  description: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().trim().max(2000).nullable().optional()
  ),
  maxScore: z.coerce.number().int().min(1).max(1000).default(100),
  dueAt: optionalDateTime,
  status: z.enum(["draft", "published", "closed"]),
});

export async function saveAssignment(formData: FormData): Promise<void> {
  await requireRole("trainer");

  const parsed = assignmentSaveSchema.safeParse({
    id: formData.get("id"),
    courseId: formData.get("courseId"),
    slug: formData.get("slug"),
    moduleId: formData.get("moduleId"),
    title: formData.get("title"),
    description: formData.get("description"),
    maxScore: formData.get("maxScore"),
    dueAt: formData.get("dueAt"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    console.error("Assignment save validation error:", parsed.error.format());
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid assignment details."
    );
  }

  const {
    id,
    courseId,
    slug,
    moduleId,
    title,
    description,
    maxScore,
    dueAt,
    status,
  } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.rpc("trainer_save_assignment", {
    p_id: id ?? null,
    p_course_id: courseId,
    p_module_id: moduleId ?? null,
    p_title: title,
    p_description: description ?? null,
    p_max_score: maxScore,
    p_due_at: dueAt ? new Date(dueAt).toISOString() : null,
    p_status: status,
  });

  if (error) {
    console.error("Unable to save assignment:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`Unable to save assignment: ${error.message}`);
  }

  revalidatePath(`/trainer/courses/${slug}`);
}

const evaluateSubmissionSchema = z.object({
  submissionId: z.string().uuid(),
  slug: z.string().trim().min(1),
  score: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.number().min(0).max(1000).nullable().optional()
  ),
  feedback: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().trim().max(2000).nullable().optional()
  ),
  status: z.enum(["evaluated", "resubmission_required"]),
});

export async function evaluateSubmission(formData: FormData): Promise<void> {
  await requireRole("trainer");

  const parsed = evaluateSubmissionSchema.safeParse({
    submissionId: formData.get("submissionId"),
    slug: formData.get("slug"),
    score: formData.get("score"),
    feedback: formData.get("feedback"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid submission evaluation details."
    );
  }

  const { submissionId, slug, score, feedback, status } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.rpc("trainer_evaluate_assignment", {
    p_submission_id: submissionId,
    p_score: score ?? null,
    p_feedback: feedback ?? null,
    p_status: status,
  });

  if (error) {
    console.error("Unable to evaluate assignment submission:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`Unable to evaluate assignment: ${error.message}`);
  }

  revalidatePath(`/trainer/courses/${slug}`);
}

const submitForReviewSchema = z.object({
  courseId: z.string().uuid(),
  slug: z.string().trim().min(1),
});

export async function submitCourseForReview(formData: FormData): Promise<void> {
  await requireRole("trainer");

  const parsed = submitForReviewSchema.safeParse({
    courseId: formData.get("courseId"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    throw new Error("Invalid course review request.");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("trainer_submit_course_for_review", {
    p_course_id: parsed.data.courseId,
  });

  if (error) {
    console.error("Unable to submit course for review:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`Unable to submit course for review: ${error.message}`);
  }

  revalidatePath(`/trainer/courses/${parsed.data.slug}`);
  revalidatePath("/trainer/courses");
}
