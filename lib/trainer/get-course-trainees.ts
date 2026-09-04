import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type TrainerCourseTrainee = {
  traineeId: string;
  fullName: string;
  designation: string | null;
  department: string | null;
  enrollmentStatus: string;
  progressPercentage: number;
  enrolledAt: string;
  completedAt: string | null;
};

type TrainerCourseTraineeRow = {
  trainee_id: string;
  full_name: string;
  designation: string | null;
  department: string | null;
  enrollment_status: string;
  progress_percentage: number | null;
  enrolled_at: string;
  completed_at: string | null;
};

export async function getTrainerCourseTrainees(
  courseId: string
): Promise<TrainerCourseTrainee[]> {
  await requireRole("trainer");

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_trainer_course_trainees",
    {
      p_course_id: courseId,
    }
  );

  if (error) {
    console.error(
      "Unable to load trainer course trainees:",
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }
    );

    throw new Error(
      `Unable to load course trainees: ${error.message}`
    );
  }

  const rows =
    (data ?? []) as TrainerCourseTraineeRow[];

  return rows.map((row) => ({
    traineeId: row.trainee_id,
    fullName: row.full_name,
    designation: row.designation,
    department: row.department,
    enrollmentStatus: row.enrollment_status,
    progressPercentage:
      Number(row.progress_percentage ?? 0),
    enrolledAt: row.enrolled_at,
    completedAt: row.completed_at,
  }));
}