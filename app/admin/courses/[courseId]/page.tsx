import Link from "next/link";

import { getAdminCourseCompetencies } from "@/lib/admin/get-course-competencies";
import { requireRole } from "@/lib/auth/require-role";
import { removeCourseCompetency, upsertCourseCompetency } from "./actions";

type AdminCourseCompetenciesPageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function AdminCourseCompetenciesPage({
  params,
}: AdminCourseCompetenciesPageProps) {
  await requireRole("admin");
  const { courseId } = await params;
  const competencies = await getAdminCourseCompetencies(courseId);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-8">
        <Link
          href="/admin/courses"
          className="text-sm text-gray-500 hover:text-black"
        >
          Back to courses
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">
          Course Competency Mapping
        </h1>
        <p className="mt-2 text-sm text-gray-500">Course ID: {courseId}</p>
      </div>

      {competencies.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">
          No active competencies found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="divide-y">
            {competencies.map((competency) => (
              <div
                key={competency.competencyId}
                className="grid gap-4 p-5 md:grid-cols-[minmax(14rem,1fr)_8rem_auto_auto] md:items-end"
              >
                <div>
                  <p className="font-medium">{competency.competencyName}</p>
                  <MappingBadge mapped={competency.mapped} />
                </div>

                <form action={upsertCourseCompetency} className="contents">
                  <input type="hidden" name="courseId" value={courseId} />
                  <input
                    type="hidden"
                    name="competencyId"
                    value={competency.competencyId}
                  />
                  <label className="text-sm">
                    <span className="mb-1 block text-gray-600">Weight</span>
                    <input
                      type="number"
                      name="relevanceWeight"
                      min={0}
                      max={100}
                      step={1}
                      defaultValue={competency.relevanceWeight}
                      required
                      className="w-full rounded-md border px-3 py-2"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    {competency.mapped ? "Save Weight" : "Add Mapping"}
                  </button>
                </form>

                {competency.mapped && (
  <form
    action={removeCourseCompetency}
  >
    <input
      type="hidden"
      name="courseId"
      value={courseId}
    />

    <input
      type="hidden"
      name="competencyId"
      value={competency.competencyId}
    />

    <button
      type="submit"
      className="rounded-md border px-3 py-2 text-sm"
    >
      Remove Mapping
    </button>
  </form>
)}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function MappingBadge({ mapped }: { mapped: boolean }) {
  return (
    <span
      className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        mapped
          ? "border-emerald-200 bg-emerald-100 text-emerald-800"
          : "border-gray-200 bg-gray-100 text-gray-700"
      }`}
    >
      {mapped ? "Mapped" : "Not Mapped"}
    </span>
  );
}
