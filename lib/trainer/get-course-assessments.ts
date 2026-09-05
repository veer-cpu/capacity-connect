import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type TrainerCourseAssessment = {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  deadline: string | null;
  status: string;
  createdAt: string;
};

export async function getCourseAssessments(
  courseId: string
): Promise<TrainerCourseAssessment[]> {
  const { user } = await requireRole("trainer");

  const supabase = await createClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .eq("trainer_id", user.id)
    .maybeSingle();

  if (courseError) {
    console.error(
      "Unable to verify assessment course ownership:",
      courseError
    );

    throw new Error("Unable to verify course ownership.");
  }

  if (!course) {
    throw new Error(
      "You are not authorized to view assessments for this course."
    );
  }

  const { data: assessments, error } = await supabase
    .from("assessments")
    .select(`
      id,
      title,
      description,
      passing_score,
      deadline,
      status,
      created_at
    `)
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "Unable to load course assessments:",
      error
    );

    throw new Error("Unable to load course assessments.");
  }

  return (assessments ?? []).map((assessment) => ({
    id: assessment.id,
    title: assessment.title,
    description: assessment.description,
    passingScore: Number(assessment.passing_score ?? 0),
    deadline: assessment.deadline,
    status: assessment.status,
    createdAt: assessment.created_at,
  }));
}
