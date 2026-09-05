import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type TrainerAssessmentEditorCourse = {
  id: string;
  title: string;
  slug: string;
};

export type TrainerAssessmentEditorAssessment = {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  deadline: string | null;
  status: string;
};

export type TrainerAssessmentEditorCompetency = {
  id: string;
  name: string;
};

export type TrainerAssessmentEditorOption = {
  id: string;
  questionId: string;
  optionText: string;
  position: number;
};

export type TrainerAssessmentEditorQuestion = {
  id: string;
  questionText: string;
  competencyId: string | null;
  points: number;
  position: number;
  options: TrainerAssessmentEditorOption[];
};

export type TrainerAssessmentEditorData = {
  course: TrainerAssessmentEditorCourse;
  assessment: TrainerAssessmentEditorAssessment;
  competencies: TrainerAssessmentEditorCompetency[];
  questions: TrainerAssessmentEditorQuestion[];
};

export async function getTrainerAssessmentEditor(
  slug: string,
  assessmentId: string
): Promise<TrainerAssessmentEditorData> {
  const { user } = await requireRole("trainer");

  const supabase = await createClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select(`
      id,
      title,
      slug
    `)
    .eq("slug", slug)
    .eq("trainer_id", user.id)
    .maybeSingle();

  if (courseError) {
    console.error(
      "Unable to verify trainer assessment editor course:",
      courseError
    );

    throw new Error("Unable to load assessment editor course.");
  }

  if (!course) {
    notFound();
  }

  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select(`
      id,
      title,
      description,
      passing_score,
      deadline,
      status
    `)
    .eq("id", assessmentId)
    .eq("course_id", course.id)
    .maybeSingle();

  if (assessmentError) {
    console.error(
      "Unable to verify trainer assessment ownership:",
      assessmentError
    );

    throw new Error("Unable to load assessment.");
  }

  if (!assessment) {
    notFound();
  }

  const { data: courseCompetencies, error: courseCompetenciesError } =
    await supabase
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
      "Unable to load trainer assessment competencies:",
      courseCompetenciesError
    );

    throw new Error("Unable to load course competencies.");
  }

  const competencies = (courseCompetencies ?? [])
    .map((entry) => {
      const competency = Array.isArray(entry.competencies)
        ? entry.competencies[0]
        : entry.competencies;

      return competency
        ? {
            id: competency.id,
            name: competency.name,
          }
        : null;
    })
    .filter((item): item is TrainerAssessmentEditorCompetency => item !== null);

  const { data: questionRows, error: questionsError } = await supabase
    .from("assessment_questions")
    .select(`
      id,
      question_text,
      competency_id,
      points,
      position,
      question_options (
        id,
        question_id,
        option_text,
        position
      )
    `)
    .eq("assessment_id", assessment.id)
    .order("position");

  if (questionsError) {
    console.error(
      "Unable to load assessment questions:",
      questionsError
    );

    throw new Error("Unable to load assessment questions.");
  }

  const questions = (questionRows ?? [])
    .sort((a, b) => Number(a.position) - Number(b.position))
    .map((question) => ({
      id: question.id,
      questionText: question.question_text,
      competencyId: question.competency_id ?? null,
      points: Number(question.points ?? 0),
      position: Number(question.position ?? 0),
      options: (question.question_options ?? [])
        .sort((a, b) => Number(a.position) - Number(b.position))
        .map((option) => ({
          id: option.id,
          questionId: option.question_id,
          optionText: option.option_text,
          position: Number(option.position ?? 0),
        })),
    }));

  return {
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
    },
    assessment: {
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      passingScore: Number(assessment.passing_score ?? 0),
      deadline: assessment.deadline,
      status: assessment.status,
    },
    competencies,
    questions,
  };
}
