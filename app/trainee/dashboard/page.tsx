import { requireRole } from "@/lib/auth/require-role";

export default async function TraineeDashboard() {
  const { user } = await requireRole("trainee");

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">
        Trainee Dashboard
      </h1>

      <p className="mt-4">
        Signed in as {user.email}
      </p>
    </main>
  );
}