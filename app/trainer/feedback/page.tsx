import Link from "next/link";

import { getTrainerFeedbackDetails } from "@/lib/trainer/get-feedback-details";
import { getTrainerFeedbackSummary } from "@/lib/trainer/get-feedback-summary";

export default async function TrainerFeedbackPage() {
  const [summary, details] = await Promise.all([
    getTrainerFeedbackSummary(),
    getTrainerFeedbackDetails(),
  ]);

  const distribution = [
    ["5 Star", summary.fiveStarCount],
    ["4 Star", summary.fourStarCount],
    ["3 Star", summary.threeStarCount],
    ["2 Star", summary.twoStarCount],
    ["1 Star", summary.oneStarCount],
  ] as const;

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-8">
        <Link
          href="/trainer/dashboard"
          className="text-sm text-gray-500 hover:text-black"
        >
          Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">Trainee Feedback</h1>
        <p className="mt-2 text-gray-600">
          Anonymous feedback from trainees across your assigned courses.
        </p>
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Average Trainer Rating"
          value={formatRating(summary.averageTrainerRating)}
        />
        <SummaryCard
          label="Average Course Rating"
          value={formatRating(summary.averageCourseRating)}
        />
        <SummaryCard label="Total Feedback" value={summary.totalFeedback} />
      </section>

      <section className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Rating Distribution</h2>
        <div className="mt-4 space-y-3">
          {distribution.map(([label, count]) => (
            <div
              key={label}
              className="flex items-center justify-between border-b pb-3 text-sm last:border-b-0 last:pb-0"
            >
              <span>{label}</span>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Feedback Details</h2>
        {details.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">
            No trainee feedback is available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {details.map((feedback) => (
              <article
                key={feedback.feedbackId}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <h3 className="font-semibold">{feedback.courseTitle}</h3>
                  <span className="text-sm text-gray-500">
                    Updated {formatDate(feedback.updatedAt)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>
                    Course rating: {formatRating(feedback.courseRating)}
                  </span>
                  <span>
                    Trainer rating: {formatRating(feedback.trainerRating)}
                  </span>
                  <span>Submitted: {formatDate(feedback.createdAt)}</span>
                </div>
                {feedback.comments && (
                  <p className="mt-4 whitespace-pre-wrap text-gray-700">
                    {feedback.comments}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function formatRating(value: number | null) {
  return value === null || !Number.isFinite(value) ? "N/A" : value.toFixed(1);
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}
