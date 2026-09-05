import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type TrainerCoursePerformance = {
  traineeId: string;
  fullName: string;
  designation: string | null;
  department: string | null;
  progressPercentage: number;
  assessmentsCompleted: number;
  averagePercentage: number;
  passRate: number;
  latestSubmission: string | null;
  performanceStatus: "No Assessment Data" | "Strong" | "On Track" | "Needs Attention";
};

type TrainerCoursePerformanceRow = {
  trainee_id: string;
  full_name: string;
  designation: string | null;
  department: string | null;
  progress_percentage: number | null;
  assessments_completed: number | null;
  average_percentage: number | null;
  pass_rate: number | null;
  latest_submission: string | null;
};

export async function getTrainerCoursePerformance(
  courseId: string
): Promise<TrainerCoursePerformance[]> {
  await requireRole("trainer");

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_trainer_course_performance",
    { p_course_id: courseId }
  );

  if (error) {
    console.error(
      "Unable to load trainer course performance:",
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }
    );

    throw new Error(
      `Unable to load course performance: ${error.message}`
    );
  }

  return (data ?? []).map((row: TrainerCoursePerformanceRow) => {
    const assessmentsCompleted = Number(row.assessments_completed ?? 0);
    const averagePercentage = Number(row.average_percentage ?? 0);
    const progressPercentage = Number(row.progress_percentage ?? 0);

    let performanceStatus: TrainerCoursePerformance["performanceStatus"] =
      "Needs Attention";

    if (assessmentsCompleted === 0) {
      performanceStatus = "No Assessment Data";
    } else if (
      averagePercentage >= 80 &&
      progressPercentage >= 70
    ) {
      performanceStatus = "Strong";
    } else if (
      averagePercentage >= 60 &&
      progressPercentage >= 50
    ) {
      performanceStatus = "On Track";
    }

    return {
      traineeId: row.trainee_id,
      fullName: row.full_name,
      designation: row.designation,
      department: row.department,
      progressPercentage: progressPercentage,
      assessmentsCompleted,
      averagePercentage,
      passRate: Number(row.pass_rate ?? 0),
      latestSubmission: row.latest_submission,
      performanceStatus,
    };
  });
}
