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

  return (data ?? []).map((row: AdminUserRow) => ({
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    designation: row.designation,
    department: row.department,
    isApproved: Boolean(row.is_approved),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  }));
}
