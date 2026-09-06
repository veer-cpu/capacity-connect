import Link from "next/link";
import {
  archiveCourse,
  assignCourseTrainer,
  createCourse,
  publishCourse,
} from "./actions";
import {
  getAssignableTrainers,
  type AssignableTrainer,
} from "@/lib/admin/get-assignable-trainers";
import { getAdminCourses, type AdminCourse } from "@/lib/admin/get-courses";
import { requireRole } from "@/lib/auth/require-role";


export default async function AdminCoursesPage() {
  await requireRole("admin");
  const [courses, trainers] = await Promise.all([
    getAdminCourses(),
    getAssignableTrainers(),
  ]);

  const totalCourses = courses.length;
  const draftCourses = courses.filter(
    (course) => course.status === "draft",
  ).length;
  const publishedCourses = courses.filter(
    (course) => course.status === "published",
  ).length;
  const archivedCourses = courses.filter(
    (course) => course.status === "archived",
  ).length;

  return (
    <main className="mx-auto max-w-7xl p-8">
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="text-sm text-gray-500 hover:text-black"
        >
          Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">Course Management</h1>
        <p className="mt-2 text-gray-600">
          Create and manage MoES/IMD capacity-building courses.
        </p>
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total Courses" value={totalCourses} />
        <SummaryCard label="Draft" value={draftCourses} />
        <SummaryCard label="Published" value={publishedCourses} />
        <SummaryCard label="Archived" value={archivedCourses} />
      </section>

      <section className="mb-10 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Create Course</h2>
        <form action={createCourse} className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Course Title</span>
            <input
              name="title"
              required
              minLength={2}
              maxLength={150}
              className="w-full rounded-md border px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Slug</span>
            <input
              name="slug"
              required
              minLength={2}
              maxLength={150}
              pattern="[a-z0-9-]+"
              placeholder="doppler-weather-radar-operations"
              className="w-full rounded-md border px-3 py-2"
            />
          </label>

          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-medium">Description</span>
            <textarea
              name="description"
              maxLength={2000}
              rows={4}
              className="w-full rounded-md border px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Category</span>
            <input
              name="category"
              maxLength={100}
              placeholder="Radar Meteorology"
              className="w-full rounded-md border px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Difficulty</span>
            <select
              name="difficulty"
              defaultValue="beginner"
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">
              Estimated Duration (minutes)
            </span>
            <input
              type="number"
              name="estimatedDurationMinutes"
              min={0}
              step={1}
              className="w-full rounded-md border px-3 py-2"
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create Draft Course
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Course Directory</h2>
        {courses.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">
            No courses have been created yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-medium">Course</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Difficulty</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Trainer</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">Management</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <CourseRow
                      key={course.courseId}
                      course={course}
                      trainers={trainers}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function CourseRow({
  course,
  trainers,
}: {
  course: AdminCourse;
  trainers: AssignableTrainer[];
}) {
  return (
    <tr className="border-t align-top">
      <td className="px-4 py-4">
        <p className="font-medium">{course.title}</p>
        <p className="mt-1 text-xs text-gray-500">/{course.slug}</p>
      </td>
      <td className="px-4 py-4">
        <StatusBadge status={course.status} />
      </td>
      <td className="px-4 py-4 capitalize">{course.difficulty}</td>
      <td className="px-4 py-4">{course.category ?? "—"}</td>
      <td className="px-4 py-4">
              {course.status === "draft" && (
  <form action={publishCourse}>
    <input
      type="hidden"
      name="courseId"
      value={course.courseId}
    />

    <button
      type="submit"
      className="rounded-md border px-3 py-2 text-sm"
    >
      Publish Course
    </button>
  </form>
)}
{course.status === "published" && (
  <form action={archiveCourse}>
    <input
      type="hidden"
      name="courseId"
      value={course.courseId}
    />

    <button
      type="submit"
      className="rounded-md border px-3 py-2 text-sm"
    >
      Archive Course
    </button>
  </form>
)}
        <p>{course.trainerName ?? "Unassigned"}</p>
        {trainers.length === 0 ? (
          <p className="mt-2 text-xs text-gray-500">
            No active approved trainers available.
          </p>
        ) : (
          <form action={assignCourseTrainer} className="mt-3 space-y-2">
            <input type="hidden" name="courseId" value={course.courseId} />
            <select
              name="trainerId"
              defaultValue={course.trainerId ?? ""}
              required
              className="w-full min-w-48 rounded-md border px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Select trainer
              </option>
              {trainers.map((trainer) => (
                <option key={trainer.trainerId} value={trainer.trainerId}>
                  {trainer.fullName || trainer.email}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              Assign Trainer
            </button>
          </form>
          
        )}
      </td>
      <td className="px-4 py-4">
        {course.estimatedDurationMinutes === null
          ? "—"
          : `${course.estimatedDurationMinutes} min`}
      </td>
      <td className="px-4 py-4">{formatDate(course.createdAt)}</td>
      <td className="px-4 py-4">
        <Link
          href={`/admin/courses/${course.courseId}`}
          className="inline-flex rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50"
        >
          Manage Competencies
        </Link>
      </td>

    </tr>
    
  );
  
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminCourse["status"] }) {
  const styles = {
    draft: "border-amber-200 bg-amber-100 text-amber-800",
    published: "border-emerald-200 bg-emerald-100 text-emerald-800",
    archived: "border-gray-200 bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}
