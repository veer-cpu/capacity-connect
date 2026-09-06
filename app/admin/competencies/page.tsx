import Link from "next/link";

import {
  getAdminCompetencies,
  type AdminCompetency,
} from "@/lib/admin/get-competencies";
import { requireRole } from "@/lib/auth/require-role";
import {
  createCompetency,
  setCompetencyActive,
  updateCompetency,
} from "./actions";

export default async function AdminCompetenciesPage() {
  await requireRole("admin");
  const competencies = await getAdminCompetencies();

  return (
    <main className="mx-auto max-w-7xl p-8">
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="text-sm text-gray-500 hover:text-black"
        >
          Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">Competency Management</h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Configure the competency framework used for assessment, skill-gap
          analysis, recommendations, and development planning.
        </p>
        <p className="mt-3 text-sm text-gray-500">
          Inactive competencies are retained for historical data but excluded
          from new active workflows.
        </p>
      </div>

      <section className="mb-10 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Create Competency</h2>
        <form
          action={createCompetency}
          className="mt-5 grid gap-5 md:grid-cols-2"
        >
          <Field label="Name" name="name" required maxLength={120} />
          <Field label="Category" name="category" maxLength={120} />
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-medium">Description</span>
            <textarea
              name="description"
              maxLength={1000}
              rows={3}
              className="w-full rounded-md border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Default Target Score</span>
            <input
              type="number"
              name="defaultTargetScore"
              min={0}
              max={100}
              step="any"
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
            >
              Create Competency
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Existing Competencies</h2>
        {competencies.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">
            No competencies have been created yet.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {competencies.map((competency) => (
              <CompetencyCard key={competency.id} competency={competency} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function CompetencyCard({ competency }: { competency: AdminCompetency }) {
  return (
    <article className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">{competency.name}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {competency.category ?? "Uncategorized"}
          </p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs ${competency.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-100 text-gray-700"}`}
        >
          {competency.isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <p className="mt-4 text-sm text-gray-600">
        {competency.description ?? "No description provided."}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat
          label="Default Target"
          value={competency.defaultTargetScore.toFixed(0)}
        />
        <Stat label="Mapped Courses" value={competency.mappedCourseCount} />
        <Stat label="Learners" value={competency.traineeCount} />
        <Stat
          label="Verified Trainers"
          value={competency.verifiedTrainerCount}
        />
      </div>
      <form action={updateCompetency} className="mt-6 space-y-4 border-t pt-5">
        <input type="hidden" name="competencyId" value={competency.id} />
        <Field
          label="Name"
          name="name"
          defaultValue={competency.name}
          required
          maxLength={120}
        />
        <Field
          label="Category"
          name="category"
          defaultValue={competency.category ?? ""}
          maxLength={120}
        />
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Description</span>
          <textarea
            name="description"
            defaultValue={competency.description ?? ""}
            maxLength={1000}
            rows={3}
            className="w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Default Target Score</span>
          <input
            type="number"
            name="defaultTargetScore"
            min={0}
            max={100}
            step="any"
            defaultValue={competency.defaultTargetScore}
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Save Changes
        </button>
      </form>
      <form action={setCompetencyActive} className="mt-3">
        <input type="hidden" name="competencyId" value={competency.id} />
        <input
          type="hidden"
          name="isActive"
          value={String(!competency.isActive)}
        />
        <button
          type="submit"
          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
        >
          {competency.isActive ? "Deactivate" : "Activate"}
        </button>
      </form>
    </article>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required = false,
  maxLength,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        maxLength={maxLength}
        className="w-full rounded-md border px-3 py-2"
      />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
