import "server-only";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type TraineeAssignmentSubmissionStatus =
  | "submitted"
  | "evaluated"
  | "resubmission_required";

export type TraineeAssignmentSubmission = {
  id: string;
  submissionText: string | null;
  submissionUrl: string | null;
  score: number | null;
  feedback: string | null;
  status: TraineeAssignmentSubmissionStatus;
  submittedAt: string;
  evaluatedAt: string | null;
};

export type TraineeAssignment = {
  id: string;
  courseId: string;
  moduleId: string | null;
  moduleTitle: string | null;
  title: string;
  description: string | null;
  maxScore: number;
  dueAt: string | null;
  status: "published" | "closed";
  submission: TraineeAssignmentSubmission | null;
};

export async function getTraineeCourseAssignments(
  courseId: string
): Promise<TraineeAssignment[]> {
  const { user } = await requireRole("trainee");
  const supabase = await createClient();

  const { data: assignmentsData, error: assignmentsError } = await supabase
    .from("assignments")
    .select(
      `
      id,
      course_id,
      module_id,
      title,
      description,
      max_score,
      due_at,
      status,
      modules (
        title
      )
    `
    )
    .eq("course_id", courseId)
    .in("status", ["published", "closed"])
    .order("created_at", { ascending: false });

  if (assignmentsError) {
    console.error("Unable to load trainee course assignments:", {
      message: assignmentsError.message,
      code: assignmentsError.code,
      details: assignmentsError.details,
      hint: assignmentsError.hint,
    });
    return [];
  }

  const assignmentsList = assignmentsData ?? [];
  if (assignmentsList.length === 0) {
    return [];
  }

  const assignmentIds = assignmentsList.map((item) => item.id);

  const { data: submissionsData, error: submissionsError } = await supabase
    .from("assignment_submissions")
    .select(
      `
      id,
      assignment_id,
      submission_text,
      submission_url,
      score,
      feedback,
      status,
      submitted_at,
      evaluated_at
    `
    )
    .eq("trainee_id", user.id)
    .in("assignment_id", assignmentIds);

  if (submissionsError) {
    console.error("Unable to load trainee assignment submissions:", {
      message: submissionsError.message,
      code: submissionsError.code,
      details: submissionsError.details,
      hint: submissionsError.hint,
    });
  }

  const submissionsList = submissionsData ?? [];

  return assignmentsList.map((raw) => {
    const rawModule = Array.isArray(raw.modules) ? raw.modules[0] : raw.modules;
    const sub = submissionsList.find((item) => item.assignment_id === raw.id);

    const submission: TraineeAssignmentSubmission | null = sub
      ? {
          id: sub.id,
          submissionText: sub.submission_text,
          submissionUrl: sub.submission_url,
          score: sub.score !== null ? Number(sub.score) : null,
          feedback: sub.feedback,
          status: sub.status as TraineeAssignmentSubmissionStatus,
          submittedAt: sub.submitted_at,
          evaluatedAt: sub.evaluated_at,
        }
      : null;

    return {
      id: raw.id,
      courseId: raw.course_id,
      moduleId: raw.module_id,
      moduleTitle: rawModule?.title ?? null,
      title: raw.title,
      description: raw.description,
      maxScore: Number(raw.max_score ?? 100),
      dueAt: raw.due_at,
      status: raw.status as "published" | "closed",
      submission,
    };
  });
}
