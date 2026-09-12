import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type TrainerCourseLesson = {
  id: string;
  title: string;
  lessonType: string | null;
  durationMinutes: number | null;
  isRequired: boolean;
  position: number;
};

export type TrainerCourseModule = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  lessons: TrainerCourseLesson[];
};

export type TrainerCourseCompetency = {
  id: string;
  name: string;
};

export type TrainerCourseDetail = {
  id: string;
  title: string;
  slug: string;
  status: string;
  approvalStatus: "draft" | "submitted" | "approved" | "rejected";
  submittedForReviewAt: string | null;
  reviewedAt: string | null;
  reviewReason: string | null;
  category: string | null;
  difficulty: string;
  description: string | null;
  estimatedDurationMinutes: number | null;
  assessmentCount: number;
  competencies: TrainerCourseCompetency[];
  modules: TrainerCourseModule[];
};

export async function getTrainerCourseDetail(
  slug: string
): Promise<TrainerCourseDetail> {
  const { user } = await requireRole("trainer");

  const supabase = await createClient();

  const {
    data: course,
    error: courseError,
  } = await supabase
    .from("courses")
    .select(`
      id,
      title,
      slug,
      status,
      approval_status,
      submitted_for_review_at,
      reviewed_at,
      review_reason,
      category,
      difficulty,
      description,
      estimated_duration_minutes
    `)
    .eq("slug", slug)
    .eq("trainer_id", user.id)
    .maybeSingle();

  if (courseError) {
    console.error(
      "Unable to load trainer course:",
      courseError
    );

    throw new Error(
      "Unable to load course."
    );
  }

  if (!course) {
    notFound();
  }

  const {
    data: courseCompetencies,
    error: courseCompetenciesError,
  } = await supabase
    .from("course_competencies")
    .select(`
      competency_id,
      competencies (
        id,
        name
      )
    `)
    .eq("course_id", course.id);

  if (courseCompetenciesError) {
    console.error(
      "Unable to load course competencies:",
      courseCompetenciesError
    );

    throw new Error(
      "Unable to load course competencies."
    );
  }

  const {
    data: modules,
    error: modulesError,
  } = await supabase
    .from("modules")
    .select(`
      id,
      title,
      description,
      position
    `)
    .eq("course_id", course.id)
    .order("position");

 if (modulesError) {
  console.error("Unable to load trainer course modules:", {
    message: modulesError.message,
    code: modulesError.code,
    details: modulesError.details,
    hint: modulesError.hint,
  });

  throw new Error(
    `Unable to load course modules: ${modulesError.message}`
  );
}

  const moduleRows = modules ?? [];

  const moduleIds =
    moduleRows.map((module) => module.id);

  let lessonRows: Array<{
    id: string;
    module_id: string;
    title: string;
    lesson_type: string | null;
    estimated_duration_minutes: number | null;
    is_required: boolean;
    position: number;
  }> = [];

  if (moduleIds.length > 0) {
    const {
      data: lessons,
      error: lessonsError,
    } = await supabase
      .from("lessons")
      .select(`
        id,
        module_id,
        title,
        lesson_type,
        estimated_duration_minutes,
        is_required,
        position
      `)
      .in("module_id", moduleIds)
      .order("position");

if (lessonsError) {
  console.error(
    "Unable to load trainer course lessons:",
    {
      message: lessonsError.message,
      code: lessonsError.code,
      details: lessonsError.details,
      hint: lessonsError.hint,
    }
  );

  throw new Error(
    `Unable to load course lessons: ${lessonsError.message}`
  );
}

    lessonRows = lessons ?? [];
  }

  const {
    count: assessmentCount,
    error: assessmentError,
  } = await supabase
    .from("assessments")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("course_id", course.id);

  if (assessmentError) {
    console.error(
      "Unable to count course assessments:",
      assessmentError
    );

    throw new Error(
      "Unable to load assessment count."
    );
  }

  const mappedModules: TrainerCourseModule[] =
    moduleRows.map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      position: module.position,

      lessons: lessonRows
        .filter(
          (lesson) =>
            lesson.module_id === module.id
        )
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          lessonType: lesson.lesson_type,
          durationMinutes:
            lesson.estimated_duration_minutes,
          isRequired:
            lesson.is_required,
          position:
            lesson.position,
        })),
    }));

  const mappedCompetencies: TrainerCourseCompetency[] =
    (courseCompetencies ?? [])
      .map((row) => {
        const competency = Array.isArray(
          row.competencies
        )
          ? row.competencies[0]
          : row.competencies;

        if (!competency) {
          return null;
        }

        return {
          id: competency.id,
          name: competency.name,
        };
      })
      .filter(
        (
          item
        ): item is TrainerCourseCompetency =>
          item !== null
      );

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    status: course.status,
    approvalStatus: (course.approval_status as "draft" | "submitted" | "approved" | "rejected") ?? "draft",
    submittedForReviewAt: course.submitted_for_review_at ?? null,
    reviewedAt: course.reviewed_at ?? null,
    reviewReason: course.review_reason ?? null,
    category: course.category,
    difficulty: course.difficulty,
    description: course.description,
    estimatedDurationMinutes:
      course.estimated_duration_minutes,
    assessmentCount:
      assessmentCount ?? 0,
    competencies:
      mappedCompetencies,
    modules:
      mappedModules,
  };
}