import "server-only";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type TrainerAssignmentSubmissionStatus =
  | "submitted"
  | "evaluated"
  | "resubmission_required";

export type TrainerAssignmentStatus = "draft" | "published" | "closed";

export type TrainerAssignmentSubmission = {
  id: string;
  assignmentId: string;
  traineeId: string;
  traineeName: string;
  traineeEmail: string;
  submissionText: string | null;
  submissionUrl: string | null;
  score: number | null;
  feedback: string | null;
  status: TrainerAssignmentSubmissionStatus;
  submittedAt: string;
  evaluatedAt: string | null;
};

export type TrainerAssignment = {
  id: string;
  courseId: string;
  moduleId: string | null;
  moduleTitle: string | null;
  title: string;
  description: string | null;
  maxScore: number;
  dueAt: string | null;
  status: TrainerAssignmentStatus;
  createdAt: string;
  updatedAt: string;
  submissions: TrainerAssignmentSubmission[];
};

export async function getTrainerCourseAssignments(
  courseId: string
): Promise<TrainerAssignment[]> {
  await requireRole("trainer");
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
      created_at,
      updated_at,
      modules (
        title
      )
    `
    )
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (assignmentsError) {
    console.error("Unable to load trainer course assignments:", {
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
      trainee_id,
      submission_text,
      submission_url,
      score,
      feedback,
      status,
      submitted_at,
      evaluated_at,
      profiles (
        full_name,
        email
      )
    `
    )
    .in("assignment_id", assignmentIds)
    .order("submitted_at", { ascending: false });

  if (submissionsError) {
    console.error("Unable to load assignment submissions:", {
      message: submissionsError.message,
      code: submissionsError.code,
      details: submissionsError.details,
      hint: submissionsError.hint,
    });
  }

  const submissionsList = submissionsData ?? [];

  return assignmentsList.map((raw) => {
    const rawModule = Array.isArray(raw.modules) ? raw.modules[0] : raw.modules;
    const assignmentSubmissions = submissionsList
      .filter((sub) => sub.assignment_id === raw.id)
      .map((sub) => {
        const rawProfile = Array.isArray(sub.profiles)
          ? sub.profiles[0]
          : sub.profiles;
        return {
          id: sub.id,
          assignmentId: sub.assignment_id,
          traineeId: sub.trainee_id,
          traineeName: rawProfile?.full_name ?? "Trainee",
          traineeEmail: rawProfile?.email ?? "",
          submissionText: sub.submission_text,
          submissionUrl: sub.submission_url,
          score: sub.score !== null ? Number(sub.score) : null,
          feedback: sub.feedback,
          status: sub.status as TrainerAssignmentSubmissionStatus,
          submittedAt: sub.submitted_at,
          evaluatedAt: sub.evaluated_at,
        };
      });

    return {
      id: raw.id,
      courseId: raw.course_id,
      moduleId: raw.module_id,
      moduleTitle: rawModule?.title ?? null,
      title: raw.title,
      description: raw.description,
      maxScore: Number(raw.max_score ?? 100),
      dueAt: raw.due_at,
      status: raw.status as TrainerAssignmentStatus,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      submissions: assignmentSubmissions,
    };
  });
}
