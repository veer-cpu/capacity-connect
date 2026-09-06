import Link from "next/link";

import { getTrainerRecommendations } from "@/lib/competency/get-trainer-recommendations";

export default async function TrainerRecommendationsPage() {
  const { activeGaps, recommendations } = await getTrainerRecommendations();

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div>
        <p className="text-sm font-medium text-gray-500">
          Capacity Connect Intelligence
        </p>

        <h1 className="mt-2 text-3xl font-semibold">Recommended Trainers</h1>

        <p className="mt-3 max-w-3xl text-gray-600">
          Trainer recommendations are calculated from your active competency
          gaps using verified expertise, experience, course alignment, and
          availability.
        </p>
      </div>

      {activeGaps.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">
            Your Active Development Areas
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {activeGaps.map((gap) => (
              <span
                key={gap.competencyId}
                className="rounded-full border px-3 py-1 text-sm"
              >
                {gap.competencyName}: {gap.gapScore.toFixed(1)} pt gap
              </span>
            ))}
          </div>
        </section>
      )}

      {activeGaps.length === 0 && (
        <section className="mt-10 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">
            No trainer matching required
          </h2>

          <p className="mt-2 text-gray-600">
            All current competency targets are met. There are no active
            competency gaps requiring trainer support right now.
          </p>

          <Link
            href="/trainee/competencies"
            className="mt-5 inline-block rounded-md border px-4 py-2"
          >
            View My Competencies
          </Link>
        </section>
      )}

      {activeGaps.length > 0 && recommendations.length === 0 && (
        <section className="mt-10 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">No matching trainers found</h2>

          <p className="mt-2 text-gray-600">
            No currently available, approved trainer has a verified competency
            match for your active development areas.
          </p>
        </section>
      )}

      {recommendations.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Best Matches</h2>

          <div className="mt-5 space-y-6">
            {recommendations.map((recommendation, index) => {
              const { trainer, matchScore, primaryDriver } = recommendation;

              return (
                <article key={trainer.userId} className="rounded-xl border p-6">
                  <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          #{index + 1}
                        </span>

                        <span className="rounded-full border px-3 py-1 text-sm font-medium">
                          {matchScore.toFixed(1)}% Match
                        </span>
                      </div>

                      <h3 className="mt-4 text-2xl font-semibold">
                        {trainer.fullName}
                      </h3>

                      {trainer.designation && (
                        <p className="mt-1 text-gray-600">
                          {trainer.designation}
                        </p>
                      )}

                      {trainer.department && (
                        <p className="text-sm text-gray-500">
                          {trainer.department}
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg bg-gray-50 px-4 py-3">
                      <p className="text-sm text-gray-500">Primary Match</p>

                      <p className="mt-1 font-semibold">
                        {primaryDriver.competencyName}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        Your gap: {primaryDriver.gapScore.toFixed(1)} pts
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                    <Metric
                      label="Verified Expertise"
                      value={`${primaryDriver.expertiseScore.toFixed(0)}/100`}
                    />

                    <Metric
                      label="Experience Score"
                      value={`${primaryDriver.experienceScore.toFixed(0)}/100`}
                    />

                    <Metric
                      label="Course Alignment"
                      value={`${primaryDriver.relevanceScore.toFixed(0)}/100`}
                    />

                    <Metric
                      label="Availability"
                      value={`${primaryDriver.availabilityScore.toFixed(
                        0,
                      )}/100`}
                    />

                    <Metric
                      label="Training Performance"
                      value={`${primaryDriver.performanceScore.toFixed(1)}/100`}
                    />

                    <Metric
                      label="Learner Feedback"
                      value={`${primaryDriver.feedbackScore.toFixed(1)}/100`}
                    />
                  </div>

                  <div className="mt-6 rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-medium">Why this trainer?</p>

                    <p className="mt-2 text-sm text-gray-600">
                      {primaryDriver.explanation}
                    </p>
                  </div>

                  {trainer.trainerBio && (
                    <div className="mt-5">
                      <p className="text-sm font-medium">Trainer Profile</p>

                      <p className="mt-2 text-sm text-gray-600">
                        {trainer.trainerBio}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/trainee/recommendations"
          className="rounded-md bg-black px-4 py-2 text-white"
        >
          View Recommended Courses
        </Link>

        <Link
          href="/trainee/competencies"
          className="rounded-md border px-4 py-2"
        >
          View My Competencies
        </Link>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
