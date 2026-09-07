import Link from "next/link";
import { notFound } from "next/navigation";

import {
  createLesson,
  createModule,
  moveLesson,
  moveModule,
  updateCourseMetadata,
  updateLesson,
  updateModule,
} from "./actions";
import {
  getAdminCourseContent,
  type AdminCourseLesson,
  type AdminCourseModule,
} from "@/lib/admin/get-course-content";
import { requireRole } from "@/lib/auth/require-role";

type PageProps = { params: Promise<{ courseId: string }> };

export default async function AdminCourseContentPage({ params }: PageProps) {
  await requireRole("admin");
  const { courseId } = await params;
  const course = await getAdminCourseContent(courseId);
  if (!course) notFound();
  const isArchived = course.status === "archived";

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-8">
        <Link
          href="/admin/courses"
          className="text-sm text-gray-500 hover:text-black"
        >
          Back to courses
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold">Course Content Authoring</h1>
          <StatusBadge status={course.status} />
        </div>
        <p className="mt-2 text-lg text-gray-700">{course.title}</p>
        <p className="mt-1 text-sm text-gray-500">/{course.slug}</p>
      </div>

      <section className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Course Metadata</h2>
        <fieldset disabled={isArchived}>
          <form
            action={updateCourseMetadata}
            className="mt-5 grid gap-5 md:grid-cols-2"
          >
            <input type="hidden" name="courseId" value={course.id} />
            <TextInput
              name="title"
              label="Title"
              defaultValue={course.title}
              required
            />
            <TextInput
              name="category"
              label="Category"
              defaultValue={course.category ?? ""}
              maxLength={120}
            />
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block font-medium">Description</span>
              <textarea
                name="description"
                defaultValue={course.description ?? ""}
                maxLength={3000}
                rows={4}
                className="w-full rounded-md border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Difficulty</span>
              <select
                name="difficulty"
                defaultValue={course.difficulty}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">
                Estimated Duration Minutes
              </span>
              <input
                type="number"
                name="estimatedDurationMinutes"
                min={1}
                step={1}
                required
                defaultValue={course.estimatedDurationMinutes ?? 1}
                className="w-full rounded-md border px-3 py-2"
              />
            </label>
            <div>
              <SubmitButton>Save Course Details</SubmitButton>
            </div>
          </form>
        </fieldset>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Modules &amp; Lessons</h2>
        <div className="space-y-6">
          {course.modules.map((module) => (
            <ModuleEditor
              key={module.id}
              courseId={course.id}
              module={module}
              isArchived={isArchived}
            />
          ))}
          {course.modules.length === 0 && (
            <p className="rounded-xl border border-dashed p-6 text-gray-500">
              No modules have been added yet.
            </p>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Add Module</h2>
        <fieldset disabled={isArchived}>
          <form
            action={createModule}
            className="mt-5 grid gap-5 md:grid-cols-2"
          >
            <input type="hidden" name="courseId" value={course.id} />
            <TextInput name="title" label="Title" required />
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block font-medium">Description</span>
              <textarea
                name="description"
                maxLength={2000}
                rows={3}
                className="w-full rounded-md border px-3 py-2"
              />
            </label>
            <div>
              <SubmitButton>Add Module</SubmitButton>
            </div>
          </form>
        </fieldset>
      </section>
    </main>
  );
}

function ModuleEditor({
  courseId,
  module,
  isArchived,
}: {
  courseId: string;
  module: AdminCourseModule;
  isArchived: boolean;
}) {
  return (
    <article className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Module {module.sequenceOrder}</h3>
        <div className="flex gap-2">
          <MoveForm
            action={moveModule}
            idName="moduleId"
            id={module.id}
            courseId={courseId}
            direction="up"
            disabled={isArchived}
            label="Move Up"
          />
          <MoveForm
            action={moveModule}
            idName="moduleId"
            id={module.id}
            courseId={courseId}
            direction="down"
            disabled={isArchived}
            label="Move Down"
          />
        </div>
      </div>
      <fieldset disabled={isArchived}>
        <form action={updateModule} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="moduleId" value={module.id} />
          <input type="hidden" name="courseId" value={courseId} />
          <TextInput
            name="title"
            label="Title"
            defaultValue={module.title}
            required
          />
          <label className="text-sm">
            <span className="mb-1 block font-medium">Description</span>
            <textarea
              name="description"
              defaultValue={module.description ?? ""}
              maxLength={2000}
              rows={2}
              className="w-full rounded-md border px-3 py-2"
            />
          </label>
          <div>
            <SubmitButton>Save Module</SubmitButton>
          </div>
        </form>
      </fieldset>
      <div className="mt-6 space-y-4 border-t pt-5">
        {module.lessons.map((lesson) => (
          <LessonEditor
            key={lesson.id}
            courseId={courseId}
            moduleId={module.id}
            lesson={lesson}
            isArchived={isArchived}
          />
        ))}
      </div>
      <fieldset disabled={isArchived}>
        <form
          action={createLesson}
          className="mt-6 grid gap-4 border-t pt-5 md:grid-cols-2"
        >
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="moduleId" value={module.id} />
          <h4 className="text-base font-semibold md:col-span-2">Add Lesson</h4>
          <TextInput name="title" label="Title" required />
          <label className="text-sm">
            <span className="mb-1 block font-medium">Content</span>
            <textarea
              name="content"
              maxLength={20000}
              rows={4}
              className="w-full rounded-md border px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" name="isRequired" defaultChecked /> Required
          </label>
          <div>
            <SubmitButton>Add Lesson</SubmitButton>
          </div>
        </form>
      </fieldset>
    </article>
  );
}

function LessonEditor({
  courseId,
  moduleId,
  lesson,
  isArchived,
}: {
  courseId: string;
  moduleId: string;
  lesson: AdminCourseLesson;
  isArchived: boolean;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h4 className="font-semibold">Lesson {lesson.sequenceOrder}</h4>
        <div className="flex gap-2">
          <MoveForm
            action={moveLesson}
            idName="lessonId"
            id={lesson.id}
            courseId={courseId}
            direction="up"
            disabled={isArchived}
            label="Move Up"
          />
          <MoveForm
            action={moveLesson}
            idName="lessonId"
            id={lesson.id}
            courseId={courseId}
            direction="down"
            disabled={isArchived}
            label="Move Down"
          />
        </div>
      </div>
      <fieldset disabled={isArchived}>
        <form action={updateLesson} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="lessonId" value={lesson.id} />
          <input type="hidden" name="moduleId" value={moduleId} />
          <input type="hidden" name="courseId" value={courseId} />
          <TextInput
            name="title"
            label="Title"
            defaultValue={lesson.title}
            required
          />
          <label className="text-sm">
            <span className="mb-1 block font-medium">Content</span>
            <textarea
              name="content"
              defaultValue={lesson.content ?? ""}
              maxLength={20000}
              rows={5}
              className="w-full rounded-md border px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              name="isRequired"
              defaultChecked={lesson.isRequired}
            />{" "}
            Required
          </label>
          <div>
            <SubmitButton>Save Lesson</SubmitButton>
          </div>
        </form>
      </fieldset>
    </div>
  );
}

function MoveForm({
  action,
  idName,
  id,
  courseId,
  direction,
  disabled,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  idName: string;
  id: string;
  courseId: string;
  direction: "up" | "down";
  disabled: boolean;
  label: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name={idName} value={id} />
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="direction" value={direction} />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {label}
      </button>
    </form>
  );
}

function TextInput({
  name,
  label,
  defaultValue,
  maxLength,
  required = false,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  maxLength?: number;
  required?: boolean;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        maxLength={maxLength}
        minLength={required ? 2 : undefined}
        required={required}
        className="w-full rounded-md border px-3 py-2"
      />
    </label>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status: "draft" | "published" | "archived";
}) {
  return (
    <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize">
      {status}
    </span>
  );
}
