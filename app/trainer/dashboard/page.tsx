import { requireRole } from "@/lib/auth/require-role";

export default async function TrainerDashboard() {
  const { user } = await requireRole("trainer");

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">
        Trainer Dashboard
      </h1>

      <p className="mt-4">
        Signed in as {user.email}
      </p>
    </main>
  );
}