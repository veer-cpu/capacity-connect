import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type TrainerAssessmentAnalytics = {
  assessmentId: string;
  title: string;
  submittedCount: number;
  averagePercentage: number;
  passRate: number;
  highestPercentage: number;
  lowestPercentage: number;
};

type TrainerAssessmentAnalyticsRow = {
  assessment_id: string;
  title: string;
  submitted_count: number | null;
  average_percentage: number | null;
  pass_rate: number | null;
  highest_percentage: number | null;
  lowest_percentage: number | null;
};

export async function getTrainerAssessmentAnalytics(
  courseId: string
): Promise<TrainerAssessmentAnalytics[]> {
  await requireRole("trainer");

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_trainer_assessment_analytics",
    { p_course_id: courseId }
  );

  if (error) {
    console.error(
      "Unable to load trainer assessment analytics:",
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }
    );

    throw new Error(
      `Unable to load assessment analytics: ${error.message}`
    );
  }

  return (data ?? []).map((row: TrainerAssessmentAnalyticsRow) => ({
    assessmentId: row.assessment_id,
    title: row.title,
    submittedCount: Number(row.submitted_count ?? 0),
    averagePercentage: Number(row.average_percentage ?? 0),
    passRate: Number(row.pass_rate ?? 0),
    highestPercentage: Number(row.highest_percentage ?? 0),
    lowestPercentage: Number(row.lowest_percentage ?? 0),
  }));
}
