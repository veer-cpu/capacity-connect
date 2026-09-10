import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type TrainingImpactRow = {
  courseId: string;
  courseTitle: string;

  trainerId: string | null;
  trainerName: string;

  completedTrainees: number;

  preTrainingSample: number;
  postTrainingSample: number;

  averageBeforeScore: number | null;
  averageAfterScore: number | null;
  averageImprovement: number | null;

  improvedTrainees: number;
  targetAttainmentCount: number;

  improvementRate: number;
  targetAttainmentRate: number;
};

type TrainingImpactRpcRow = {
  course_id: string;
  course_title: string;

  trainer_id: string | null;
  trainer_name: string;

  completed_trainees: number | string;

  pre_training_sample: number | string;
  post_training_sample: number | string;

  average_before_score:
    | number
    | string
    | null;

  average_after_score:
    | number
    | string
    | null;

  average_improvement:
    | number
    | string
    | null;

  improved_trainees:
    | number
    | string;

  target_attainment_count:
    | number
    | string;

  improvement_rate:
    | number
    | string;

  target_attainment_rate:
    | number
    | string;
};

export async function getAdminTrainingImpact():
  Promise<TrainingImpactRow[]> {
  await requireRole("admin");

  const supabase = await createClient();

  const { data, error } =
    await supabase.rpc(
      "admin_training_impact",
    );

  if (error) {
    console.error(
      "Unable to load training impact analytics:",
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      },
    );

    throw new Error(
      "Unable to load training impact analytics.",
    );
  }

  return (data ?? []).map(
    (row: TrainingImpactRpcRow) => ({
      courseId: row.course_id,
      courseTitle: row.course_title,

      trainerId: row.trainer_id,
      trainerName: row.trainer_name,

      completedTrainees:
        Number(row.completed_trainees),

      preTrainingSample:
        Number(row.pre_training_sample),

      postTrainingSample:
        Number(row.post_training_sample),

      averageBeforeScore:
        row.average_before_score === null
          ? null
          : Number(
              row.average_before_score,
            ),

      averageAfterScore:
        row.average_after_score === null
          ? null
          : Number(
              row.average_after_score,
            ),

      averageImprovement:
        row.average_improvement === null
          ? null
          : Number(
              row.average_improvement,
            ),

      improvedTrainees:
        Number(row.improved_trainees),

      targetAttainmentCount:
        Number(
          row.target_attainment_count,
        ),

      improvementRate:
        Number(row.improvement_rate),

      targetAttainmentRate:
        Number(
          row.target_attainment_rate,
        ),
    }),
  );
}