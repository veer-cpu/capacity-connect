import Link from "next/link";

import { requireRole } from "@/lib/auth/require-role";
import { getAdminUsers } from "@/lib/admin/get-users";
import { approveUser, deactivateUser, reactivateUser, setUserRole } from "./actions";

export default async function AdminUsersPage() {
  const { user } = await requireRole("admin");
  const currentUserId = user.id;
  const users = await getAdminUsers();

  const totalUsers = users.length;
  const pendingApproval = users.filter((user) => !user.isApproved).length;
  const activeUsers = users.filter((user) => user.isActive).length;
  const inactiveUsers = users.filter((user) => !user.isActive).length;

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }

    return date.toLocaleDateString();
  };

  return (
    <main className="mx-auto max-w-7xl p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/dashboard"
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-semibold">User Management</h1>
        </div>
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total Users" value={totalUsers} />
        <SummaryCard label="Pending Approval" value={pendingApproval} />
        <SummaryCard label="Active Users" value={activeUsers} />
        <SummaryCard label="Inactive Users" value={inactiveUsers} />
      </section>

      {users.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">
          No users found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Designation</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Approval</th>
                  <th className="px-4 py-3 font-medium">Active</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.userId} className="border-t align-top">
                    <td className="px-4 py-4">{user.fullName}</td>
                    <td className="px-4 py-4">{user.email}</td>
                    <td className="px-4 py-4 capitalize">{user.role}</td>
                    <td className="px-4 py-4">{user.designation ?? "—"}</td>
                    <td className="px-4 py-4">{user.department ?? "—"}</td>
                    <td className="px-4 py-4">
                      <StatusBadge
                        active={user.isApproved}
                        trueLabel="Approved"
                        falseLabel="Pending"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge
                        active={user.isActive}
                        trueLabel="Active"
                        falseLabel="Inactive"
                      />
                    </td>
                    <td className="px-4 py-4">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {!user.isApproved && (
                          <form action={approveUser}>
                            <input
                              type="hidden"
                              name="userId"
                              value={user.userId}
                            />
                            <button
                              type="submit"
                              className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                          </form>
                        )}

                        {user.isApproved &&
                          user.isActive &&
                          user.userId !== currentUserId && (
                            <form action={deactivateUser}>
                              <input
                                type="hidden"
                                name="userId"
                                value={user.userId}
                              />
                              <button
                                type="submit"
                                className="rounded-md bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700"
                              >
                                Deactivate
                              </button>
                            </form>
                          )}

                        {user.isApproved && !user.isActive && (
                          <form action={reactivateUser}>
                            <input
                              type="hidden"
                              name="userId"
                              value={user.userId}
                            />
                            <button
                              type="submit"
                              className="rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                            >
                              Reactivate
                            </button>
                          </form>
                        )}
                         {user.role !== "admin" && (
    <form
      action={setUserRole}
      className="flex items-center gap-2"
    >
      <input
        type="hidden"
        name="userId"
        value={user.userId}
      />

      <select
        name="newRole"
        defaultValue={user.role}
        className="rounded-md border px-2 py-1 text-sm"
      >
        <option value="trainee">
          Trainee
        </option>

        <option value="trainer">
          Trainer
        </option>
      </select>

      <button
        type="submit"
        className="rounded-md border px-3 py-1 text-sm"
      >
        Change Role
      </button>
    </form>
  )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
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

function StatusBadge({
  active,
  trueLabel,
  falseLabel,
}: {
  active: boolean;
  trueLabel: string;
  falseLabel: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        active
          ? "border-emerald-200 bg-emerald-100 text-emerald-800"
          : "border-amber-200 bg-amber-100 text-amber-800"
      }`}
    >
      {active ? trueLabel : falseLabel}
    </span>
  );
}
