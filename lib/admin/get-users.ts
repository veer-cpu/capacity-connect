import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type AdminUser = {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  designation: string | null;
  department: string | null;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  organizationalUnitId: string | null;
  jobRoleId: string | null;
};

type AdminUserRow = {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  designation: string | null;
  department: string | null;
  is_approved: boolean | null;
  is_active: boolean | null;
  created_at: string;
};

type ProfileAssignmentRow = {
  id: string;
  organizational_unit_id: string | null;
  job_role_id: string | null;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  await requireRole("admin");

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("admin_list_users");

  if (error) {
    console.error("Unable to load admin users:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    throw new Error(`Unable to load users: ${error.message}`);
  }

  const rows = (data ?? []) as AdminUserRow[];
  const userIds = rows.map((row) => row.user_id);

  const assignmentById = new Map<
    string,
    { organizationalUnitId: string | null; jobRoleId: string | null }
  >();

  if (userIds.length > 0) {
    const { data: assignmentRows, error: assignmentError } = await supabase
      .from("profiles")
      .select("id, organizational_unit_id, job_role_id")
      .in("id", userIds);

    if (assignmentError) {
      console.error("Unable to load user organization assignments:", {
        message: assignmentError.message,
        code: assignmentError.code,
        details: assignmentError.details,
        hint: assignmentError.hint,
      });

      throw new Error(`Unable to load users: ${assignmentError.message}`);
    }

    for (const row of (assignmentRows ?? []) as ProfileAssignmentRow[]) {
      assignmentById.set(row.id, {
        organizationalUnitId: row.organizational_unit_id,
        jobRoleId: row.job_role_id,
      });
    }
  }

  return rows.map((row) => ({
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    designation: row.designation,
    department: row.department,
    isApproved: Boolean(row.is_approved),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    organizationalUnitId:
      assignmentById.get(row.user_id)?.organizationalUnitId ?? null,
    jobRoleId: assignmentById.get(row.user_id)?.jobRoleId ?? null,
  }));
}
