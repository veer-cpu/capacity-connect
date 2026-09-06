import Link from "next/link";

import {
  getAdminTrainerCompetencies,
  type AdminTrainerCompetency,
} from "@/lib/admin/get-trainer-competencies";
import { requireRole } from "@/lib/auth/require-role";
import { updateTrainerCompetency } from "./actions";

export default async function AdminTrainerCompetenciesPage() {
  await requireRole("admin");
  const rows = await getAdminTrainerCompetencies();
  const trainers = groupByTrainer(rows);

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="text-sm text-gray-500 hover:text-black"
        >
          Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">
          Trainer Competency Verification
        </h1>
        <p className="mt-2 text-gray-600">
          Review trainer expertise and control which competencies are verified
          for trainer matching.
        </p>
      </div>

      {trainers.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">
          No active approved trainers or active competencies found.
        </div>
      ) : (
        <div className="space-y-8">
          {trainers.map((trainer) => (
            <section
              key={trainer.trainerId}
              className="overflow-hidden rounded-xl border bg-white shadow-sm"
            >
              <div className="border-b bg-gray-50 px-5 py-4">
                <h2 className="text-xl font-semibold">
                  {trainer.trainerName ?? "Unnamed trainer"}
                </h2>
                <p className="text-sm text-gray-500">{trainer.trainerEmail}</p>
              </div>

              <div className="divide-y">
                {trainer.competencies.map((competency) => {
                  const formId = `competency-${competency.trainerId}-${competency.competencyId}`;

                  return (
                    <form
                      key={competency.competencyId}
                      id={formId}
                      action={updateTrainerCompetency}
                      className="grid gap-4 p-5 md:grid-cols-[minmax(12rem,1fr)_8rem_8rem_auto_auto] md:items-end"
                    >
                      <input
                        type="hidden"
                        name="trainerId"
                        value={competency.trainerId}
                      />
                      <input
                        type="hidden"
                        name="competencyId"
                        value={competency.competencyId}
                      />

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Competency
                        </p>
                        <p className="mt-1 font-medium">
                          {competency.competencyName}
                        </p>
                      </div>

                      <label className="text-sm">
                        <span className="mb-1 block text-gray-600">
                          Expertise score
                        </span>
                        <input
                          type="number"
                          name="expertiseScore"
                          min={0}
                          max={100}
                          step={1}
                          defaultValue={competency.expertiseScore}
                          required
                          className="w-full rounded-md border px-3 py-2"
                        />
                      </label>

                      <label className="text-sm">
                        <span className="mb-1 block text-gray-600">
                          Years experience
                        </span>
                        <input
                          type="number"
                          name="yearsExperience"
                          min={0}
                          step={0.5}
                          defaultValue={competency.yearsExperience}
                          required
                          className="w-full rounded-md border px-3 py-2"
                        />
                      </label>

                      <label className="flex items-center gap-2 pb-2 text-sm">
                        <input
                          type="checkbox"
                          name="verified"
                          defaultChecked={competency.verified}
                          className="h-4 w-4"
                        />
                        <span>Verified</span>
                      </label>

                      <div className="flex items-center gap-3">
                        <StatusBadge verified={competency.verified} />
                        <button
                          type="submit"
                          className="rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

type TrainerGroup = {
  trainerId: string;
  trainerName: string | null;
  trainerEmail: string;
  competencies: AdminTrainerCompetency[];
};

function groupByTrainer(
  rows: Awaited<ReturnType<typeof getAdminTrainerCompetencies>>,
): TrainerGroup[] {
  const grouped = new Map<string, TrainerGroup>();

  for (const row of rows) {
    const trainer = grouped.get(row.trainerId);

    if (trainer) {
      trainer.competencies.push(row);
      continue;
    }

    grouped.set(row.trainerId, {
      trainerId: row.trainerId,
      trainerName: row.trainerName,
      trainerEmail: row.trainerEmail,
      competencies: [row],
    });
  }

  return Array.from(grouped.values());
}

function StatusBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        verified
          ? "border-emerald-200 bg-emerald-100 text-emerald-800"
          : "border-amber-200 bg-amber-100 text-amber-800"
      }`}
    >
      {verified ? "Verified" : "Unverified"}
    </span>
  );
}
