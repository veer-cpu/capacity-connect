import { requireRole } from "@/lib/auth/require-role";

export default async function AdminDashboard() {
  const { user } = await requireRole("admin");

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">
        Admin Dashboard
      </h1>

      <p className="mt-4">
        Signed in as {user.email}
      </p>
    </main>
  );
}