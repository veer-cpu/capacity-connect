import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type CapacityPriority =
  | "critical"
  | "high"
  | "medium"
  | "low";

export type CapacityImportance =
  | "core"
  | "important"
  | "supporting";

export type CapacityGridRow = {
  traineeId: string;
  traineeName: string;
  employeeCode: string | null;
  designation: string | null;
  department: string;
  organizationalUnitId: string | null;
  organizationalUnitName: string | null;
  jobRoleId: string | null;
  jobRoleName: string | null;
  competencyId: string;
  competencyName: string;
  competencyCategory: string | null;
  importance: CapacityImportance;
  currentScore: number | null;
  targetScore: number;
  gapScore: number;
  priority: CapacityPriority;
  gapStatus: string;
  lastUpdatedAt: string | null;
};

type CapacityGridRpcRow = {
  trainee_id: string;
  trainee_name: string;
  employee_code: string | null;
  designation: string | null;
  department: string;
  organizational_unit_id: string | null;
  organizational_unit_name: string | null;
  job_role_id: string | null;
  job_role_name: string | null;
  competency_id: string;
  competency_name: string;
  competency_category: string | null;
  importance: CapacityImportance;
  current_score: number | string | null;
  target_score: number | string | null;
  gap_score: number | string;
  priority: CapacityPriority;
  gap_status: string;
  last_updated_at: string | null;
};

export async function getAdminCapacityGrid(): Promise<
  CapacityGridRow[]
> {
  await requireRole("admin");

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "admin_capacity_grid",
  );

  if (error) {
    console.error("Unable to load capacity grid:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    throw new Error(
      "Unable to load organizational capacity data.",
    );
  }

  return (data ?? []).map(
    (row: CapacityGridRpcRow) => ({
      traineeId: row.trainee_id,
      traineeName: row.trainee_name,
      employeeCode: row.employee_code,
      designation: row.designation,
      department: row.department,
      organizationalUnitId: row.organizational_unit_id,
      organizationalUnitName: row.organizational_unit_name,
      jobRoleId: row.job_role_id,
      jobRoleName: row.job_role_name,
      competencyId: row.competency_id,
      competencyName: row.competency_name,
      competencyCategory: row.competency_category,
      importance: row.importance,

      currentScore:
        row.current_score === null
          ? null
          : Number(row.current_score),

      targetScore:
        row.target_score === null
          ? 80
          : Number(row.target_score),

      gapScore: Number(row.gap_score),
      priority: row.priority,
      gapStatus: row.gap_status,
      lastUpdatedAt: row.last_updated_at,
    }),
  );
}