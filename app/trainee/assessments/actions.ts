"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  assessmentId: z.string().uuid(),
});

export async function submitAssessment(formData: FormData) {
  await requireRole("trainee");

  const parsed = schema.safeParse({
    assessmentId: formData.get("assessmentId"),
  });

  if (!parsed.success) {
    throw new Error("Invalid assessment.");
  }

  const assessmentId = parsed.data.assessmentId;

  const answers: Record<string, string> = {};

for (const [key, value] of formData.entries()) {
  if (!key.startsWith("answer_")) {
    continue;
  }

  if (typeof value !== "string") {
    throw new Error(
      "Invalid assessment answer.",
    );
  }

  const questionId =
    key.slice("answer_".length);

  const questionResult =
    z.string().uuid().safeParse(questionId);

  const optionResult =
    z.string().uuid().safeParse(value);

  if (
    !questionResult.success ||
    !optionResult.success
  ) {
    throw new Error(
      "Invalid assessment answer.",
    );
  }

  answers[questionResult.data] =
    optionResult.data;
}

if (Object.keys(answers).length === 0) {
  throw new Error(
    "Please answer the assessment before submitting.",
  );
}

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "submit_assessment",
    {
      p_assessment_id: assessmentId,
      p_answers: answers,
    }
  );

  if (error) {
    console.error("Assessment RPC error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    throw new Error(
  "Unable to submit the assessment. Please verify your answers and try again.",);
  }

  const result = data as {
    attempt_id: string;
  };

  redirect(
    `/trainee/assessments/results/${result.attempt_id}`
  );
}