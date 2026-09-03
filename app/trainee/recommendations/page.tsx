import Link from "next/link";
import { getCourseRecommendations } from "@/lib/competency/get-course-recommendations";

export default async function TraineeRecommendationsPage() {
  const { activeGaps, recommendations } = await getCourseRecommendations();

  return (
    <main className="p-6 sm:p-8">
      <div>
        <h1 className="text-2xl font-semibold">Recommended Learning</h1>
        <p className="mt-1 text-sm text-gray-600">
          Courses recommended based on your active competency gaps and development targets.
        </p>
      </div>

      {activeGaps.length === 0 ? (
        <section className="mt-8 rounded-xl border p-8 text-center shadow-sm">
          <div className="mx-auto max-w-md">
            <h2 className="text-lg font-semibold text-gray-900">
              No Active Gaps
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              All current competency targets are met. No gap-driven learning
              recommendations are needed right now.
            </p>
            <div className="mt-6">
              <Link
                href="/courses"
                className="inline-block rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Browse Course Catalogue
              </Link>
            </div>
          </div>
        </section>
      ) : recommendations.length === 0 ? (
        <section className="mt-8 rounded-xl border border-dashed p-8 text-center text-gray-500">
          <p className="text-base font-medium">
            No published courses currently match your active skill gaps.
          </p>
          <p className="mt-1 text-sm">
            Check back later as new training materials are published.
          </p>
          <div className="mt-6">
            <Link
              href="/courses"
              className="inline-block rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Browse All Courses
            </Link>
          </div>
        </section>
      ) : (
        <>
          {/* Active Gaps Driving Recommendations */}
          <section className="mt-6 rounded-lg bg-gray-50 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Active Skill Gaps Driving Recommendations
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {activeGaps.map((gap) => (
                <span
                  key={gap.competencyId}
                  className="inline-flex items-center rounded-md bg-white px-3 py-1 text-xs font-medium text-gray-800 border"
                >
                  {gap.competencyName}:{" "}
                  <strong className="ml-1 text-black">
                    {gap.gapScore} pts gap
                  </strong>
                </span>
              ))}
            </div>
          </section>

          {/* Recommendations Cards */}
          <section className="mt-8 space-y-6">
            {recommendations.map((rec) => {
              const course = rec.course;
              const primary = rec.primaryDriver;
              const secondaryMatches = rec.allMatchingScores.slice(1);

              return (
                <article
                  key={course.id}
                  className="rounded-xl border p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {course.category && <span>{course.category}</span>}
                        {course.category && course.difficulty && <span>•</span>}
                        {course.difficulty && (
                          <span className="capitalize">{course.difficulty}</span>
                        )}
                      </div>

                      <h2 className="mt-1 text-xl font-semibold text-gray-900">
                        {course.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-block rounded-full bg-black px-3.5 py-1 text-sm font-bold text-white">
                        {rec.recommendationScore}% Match
                      </span>
                    </div>
                  </div>

                  {course.description && (
                    <p className="mt-3 text-sm text-gray-600">
                      {course.description}
                    </p>
                  )}

                  {/* Deterministic Recommendation Explanation Box */}
                  <div className="mt-4 rounded-lg bg-blue-50/70 border border-blue-100 p-4">
                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
                      Why Recommended
                    </p>
                    <p className="mt-1 text-sm text-blue-950 font-medium">
                      {primary.explanation}
                    </p>
                  </div>

                  {/* Secondary Mapped Competencies if any */}
                  {secondaryMatches.length > 0 && (
                    <div className="mt-3 text-xs text-gray-500">
                      <span>Also addresses: </span>
                      {secondaryMatches.map((m, idx) => (
                        <span key={m.competencyId}>
                          {m.competencyName} ({m.score}% match)
                          {idx < secondaryMatches.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t pt-4 text-xs text-gray-500">
                    <span>
                      Duration:{" "}
                      {course.estimatedDurationMinutes
                        ? `${course.estimatedDurationMinutes} mins`
                        : "Self-paced"}
                    </span>

                    <Link
                      href={`/courses/${course.slug}`}
                      className="inline-block rounded-md bg-black px-4 py-2 text-xs font-medium text-white hover:bg-gray-800"
                    >
                      View Course Details →
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
}
