import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

import { submitAssessment } from "../actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AssessmentPage({ params }: PageProps) {
  await requireRole("trainee");

  const { id } = await params;

  const supabase = await createClient();

  const { data: assessment, error } = await supabase
    .from("assessments")
    .select(
      `
      id,
      title,
      description,
      passing_score,
      deadline,
      status,

      assessment_questions (
        id,
        question_text,
        points,
        position,

        question_options (
          id,
          option_text,
          position
        )
      )
    `,
    )
    .eq("id", id)
  .eq("status", "published")
    .single();

  if (error || !assessment) {
    notFound();
  }

  // const deadlinePassed = Boolean(
  //   assessment.deadline &&
  //   new Date(assessment.deadline).getTime() <= Date.now(),
  // );
  const canSubmit = assessment.status === "published" ;
  // && !deadlinePassed;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-semibold">{assessment.title}</h1>

      <p className="mt-3 text-gray-600">{assessment.description}</p>

      <p className="mt-2 text-sm">
        Passing Score: {Number(assessment.passing_score)}%
      </p>

      <p className="mt-2 text-sm font-medium capitalize">
        Status: {assessment.status}
      </p>

      <p className="mt-2 text-sm">
        Deadline:{" "}
        {assessment.deadline
          ? new Date(assessment.deadline).toLocaleString()
          : "No deadline"}
      </p>

      {!canSubmit && (
        <p className="mt-6 font-medium text-slate-700">
          {assessment.status === "closed" ? "Closed" : "Deadline passed"}
        </p>
      )}

      {canSubmit && (
        <form action={submitAssessment} className="mt-10 space-y-8">
          <input type="hidden" name="assessmentId" value={assessment.id} />

          {assessment.assessment_questions
            ?.sort((a, b) => a.position - b.position)
            .map((question, index) => (
              <section key={question.id} className="rounded-xl border p-5">
                <h2 className="font-semibold">
                  {index + 1}. {question.question_text}
                </h2>

                <div className="mt-4 space-y-3">
                  {question.question_options
                    ?.sort((a, b) => a.position - b.position)
                    .map((option) => (
                      <label
                        key={option.id}
                        className="flex cursor-pointer gap-3 rounded-md border p-3"
                      >
                        <input
                          type="radio"
                          name={`answer_${question.id}`}
                          value={option.id}
                          required
                        />

                        <span>{option.option_text}</span>
                      </label>
                    ))}
                </div>
              </section>
            ))}

          <button
            type="submit"
            className="rounded-md bg-black px-5 py-2 text-white"
          >
            Submit Assessment
          </button>
        </form>
      )}
    </main>
  );
}
