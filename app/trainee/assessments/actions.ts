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
    if (
      key.startsWith("answer_") &&
      typeof value === "string"
    ) {
      const questionId = key.replace("answer_", "");

      answers[questionId] = value;
    }
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
      `Unable to submit assessment: ${error.message}`
    );
  }

  const result = data as {
    attempt_id: string;
  };

  redirect(
    `/trainee/assessments/results/${result.attempt_id}`
  );
}