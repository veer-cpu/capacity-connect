"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const addAssessmentQuestionSchema = z.object({
  assessmentId: z.string().uuid(),
  courseSlug: z.string().trim().min(1),
  questionText: z.string().trim().min(2).max(1000),
  competencyId: z.string().uuid().optional().or(z.literal("")),
  points: z.coerce.number().gt(0).lte(100),
  option1: z.string().trim().min(1).max(500),
  option2: z.string().trim().min(1).max(500),
  option3: z.string().trim().max(500).optional().or(z.literal("")),
  option4: z.string().trim().max(500).optional().or(z.literal("")),
  correctOption: z.coerce.number().int().refine((value) => [1, 2, 3, 4].includes(value), {
    message: "Correct option must be 1, 2, 3, or 4.",
  }),
});

const assessmentIdSchema = z.object({
  assessmentId: z.string().uuid(),
});

const deadlineSchema = assessmentIdSchema.extend({
  deadline: z.preprocess(
    (value) => (value === "" ? null : value),
    z.union([
      z.null(),
      z.string().refine(
        (value) => !Number.isNaN(new Date(value).getTime()),
        "Deadline must be a valid date and time.",
      ),
    ]),
  ),
});

function revalidateAssessmentPages() {
  revalidatePath("/trainer/courses/[slug]/assessments", "page");
  revalidatePath(
    "/trainer/courses/[slug]/assessments/[assessmentId]",
    "page",
  );
}

async function runAssessmentLifecycleRpc(
  rpcName: string,
  assessmentId: string,
  params: Record<string, unknown> = {},
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc(rpcName, {
    p_assessment_id: assessmentId,
    ...params,
  });

  if (error) {
    console.error(`Unable to run ${rpcName}:`, {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`Unable to update assessment: ${error.message}`);
  }
}

async function requireDraftAssessment(assessmentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("status")
    .eq("id", assessmentId)
    .maybeSingle();

  if (error || !data || data.status !== "draft") {
    throw new Error("Questions can only be changed while the assessment is a draft.");
  }
}

export async function closeAssessment(formData: FormData): Promise<void> {
  await requireRole("trainer");

  const parsed = assessmentIdSchema.safeParse({
    assessmentId: formData.get("assessmentId"),
  });

  if (!parsed.success) {
    throw new Error("Invalid assessment closing request.");
  }

  await runAssessmentLifecycleRpc(
    "close_trainer_assessment",
    parsed.data.assessmentId,
  );
  revalidateAssessmentPages();
}

export async function reopenAssessment(formData: FormData): Promise<void> {
  await requireRole("trainer");

  const parsed = assessmentIdSchema.safeParse({
    assessmentId: formData.get("assessmentId"),
  });

  if (!parsed.success) {
    throw new Error("Invalid assessment reopening request.");
  }

  await runAssessmentLifecycleRpc(
    "reopen_trainer_assessment",
    parsed.data.assessmentId,
  );
  revalidateAssessmentPages();
}

export async function updateAssessmentDeadline(
  formData: FormData,
): Promise<void> {
  await requireRole("trainer");

  const parsed = deadlineSchema.safeParse({
    assessmentId: formData.get("assessmentId"),
    deadline: formData.get("deadline"),
  });

  if (!parsed.success) {
    throw new Error("Invalid assessment deadline.");
  }

  await runAssessmentLifecycleRpc(
    "update_trainer_assessment_deadline",
    parsed.data.assessmentId,
    {
      p_deadline: parsed.data.deadline
        ? new Date(parsed.data.deadline).toISOString()
        : null,
    },
  );
  revalidateAssessmentPages();
}

export async function publishAssessment(
  formData: FormData
): Promise<void> {
  await requireRole("trainer");

  const assessmentIdResult =
    z.string().uuid().safeParse(
      formData.get("assessmentId")
    );

  const courseSlugResult =
    z.string().min(1).safeParse(
      formData.get("courseSlug")
    );

  if (
    !assessmentIdResult.success ||
    !courseSlugResult.success
  ) {
    throw new Error(
      "Invalid assessment publishing request."
    );
  }

  const supabase =
    await createClient();

  const {
    error,
  } = await supabase.rpc(
    "publish_trainer_assessment",
    {
      p_assessment_id:
        assessmentIdResult.data,
    }
  );

  if (error) {
    console.error(
      "Unable to publish assessment:",
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }
    );

    throw new Error(
      `Unable to publish assessment: ${error.message}`
    );
  }

  revalidatePath(
    `/trainer/courses/${courseSlugResult.data}/assessments`
  );

  revalidatePath(
    `/trainer/courses/${courseSlugResult.data}/assessments/${assessmentIdResult.data}`
  );
}

export async function addAssessmentQuestion(
  formData: FormData
): Promise<void> {
  await requireRole("trainer");

  const parsed = addAssessmentQuestionSchema.safeParse({
    assessmentId: formData.get("assessmentId"),
    courseSlug: formData.get("courseSlug"),
    questionText: formData.get("questionText"),
    competencyId: formData.get("competencyId") ?? "",
    points: formData.get("points"),
    option1: formData.get("option1"),
    option2: formData.get("option2"),
    option3: formData.get("option3") ?? "",
    option4: formData.get("option4") ?? "",
    correctOption: formData.get("correctOption"),
  });

  if (!parsed.success) {
    throw new Error("Invalid question data.");
  }

  const data = parsed.data;
  await requireDraftAssessment(data.assessmentId);

  const optionEntries = [
    { key: "option1", value: data.option1 },
    { key: "option2", value: data.option2 },
    { key: "option3", value: data.option3 ?? "" },
    { key: "option4", value: data.option4 ?? "" },
  ]
    .filter((item) => item.value.trim().length > 0)
    .map((item, index) => {
      const position = index + 1;
      const optionNumber = Number(item.key.replace("option", ""));

      return {
        option_text: item.value.trim(),
        is_correct: optionNumber === data.correctOption,
        position,
      };
    });

  if (optionEntries.length < 2) {
    throw new Error("At least two valid options are required.");
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("create_trainer_assessment_question", {
    p_assessment_id: data.assessmentId,
    p_question_text: data.questionText.trim(),
    p_competency_id: data.competencyId && data.competencyId.trim() ? data.competencyId : null,
    p_points: Number(data.points),
    p_options: optionEntries,
  });

  if (error) {
    console.error("Assessment question creation RPC error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    throw new Error(
      `Unable to create assessment question: ${error.message}`
    );
  }

  revalidatePath(
    `/trainer/courses/${data.courseSlug}/assessments/${data.assessmentId}`
  );
}
export async function deleteAssessmentQuestion(
  formData: FormData
): Promise<void> {
  await requireRole("trainer");

  const questionIdResult =
    z.string().uuid().safeParse(
      formData.get("questionId")
    );

  const assessmentIdResult =
    z.string().uuid().safeParse(
      formData.get("assessmentId")
    );

  const courseSlugResult =
    z.string().min(1).safeParse(
      formData.get("courseSlug")
    );

  if (
    !questionIdResult.success ||
    !assessmentIdResult.success ||
    !courseSlugResult.success
  ) {
    throw new Error(
      "Invalid question deletion request."
    );
  }

  await requireDraftAssessment(assessmentIdResult.data);

  const supabase =
    await createClient();

  const {
    error,
  } = await supabase.rpc(
    "delete_trainer_assessment_question",
    {
      p_question_id:
        questionIdResult.data,
    }
  );

  if (error) {
    console.error(
      "Unable to delete assessment question:",
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }
    );

    throw new Error(
      `Unable to delete question: ${error.message}`
    );
  }

  revalidatePath(
    `/trainer/courses/${courseSlugResult.data}/assessments/${assessmentIdResult.data}`
  );
}