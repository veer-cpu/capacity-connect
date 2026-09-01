import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export default async function TraineeCompetenciesPage() {
  const { user } = await requireRole("trainee");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_competencies")
    .select(`
      current_score,
      target_score,
      competencies (
        name,
        category
      )
    `)
    .eq("user_id", user.id)
    .order("current_score", { ascending: true });

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold">My Competencies</h1>

        <p className="mt-4">
          Unable to load competency information.
        </p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">
        My Competencies
      </h1>

      <p className="mt-2 text-gray-600">
        Your current competency profile and development targets.
      </p>

      <div className="mt-8 space-y-4">
        {data?.map((item) => {
          const competency = Array.isArray(item.competencies)
            ? item.competencies[0]
            : item.competencies;

          const current = Number(item.current_score);
          const target = Number(item.target_score);

          const gap = Math.max(target - current, 0);

          return (
            <div
              key={competency?.name}
              className="rounded-lg border p-5"
            >
              <h2 className="font-semibold">
                {competency?.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {competency?.category}
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <p>
                  Current: <strong>{current}</strong>
                </p>

                <p>
                  Target: <strong>{target}</strong>
                </p>

                <p>
                  Gap: <strong>{gap}</strong>
                </p>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded bg-gray-200">
                <div
                  className="h-full bg-black"
                  style={{
                    width: `${Math.min(current, 100)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}