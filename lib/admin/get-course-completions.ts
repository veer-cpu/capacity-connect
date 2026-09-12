import "server-only";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type AdminCourseCompletionRow = {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  traineeId: string;
  traineeName: string;
  traineeEmail: string;
  status: string;
  progressPercentage: number;
  enrolledAt: string;
  completedAt: string | null;
  trainerName: string | null;
};

type AdminCourseCompletionRpcRow = {
  enrollment_id: string;
  course_id: string;
  course_title: string;
  trainee_id: string;
  trainee_name: string;
  trainee_email: string;
  enrollment_status: string;
  progress_percentage: number | string | null;
  enrolled_at: string;
  completed_at: string | null;
  trainer_name: string | null;
};

export async function getAdminCourseCompletions(): Promise<
  AdminCourseCompletionRow[]
> {
  await requireRole("admin");

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "admin_course_completion_report"
  );

  if (error) {
    console.error("Unable to load course completions for admin:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    return [];
  }

  const rows = (data ?? []) as AdminCourseCompletionRpcRow[];

  return rows.map((row) => ({
    enrollmentId: row.enrollment_id,
    courseId: row.course_id,
    courseTitle: row.course_title,
    traineeId: row.trainee_id,
    traineeName: row.trainee_name,
    traineeEmail: row.trainee_email,
    status: row.enrollment_status,
    progressPercentage: Number(row.progress_percentage ?? 0),
    enrolledAt: row.enrolled_at,
    completedAt: row.completed_at,
    trainerName: row.trainer_name ?? "Unassigned",
  }));
}