import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type CapacityPriority =
  | "critical"
  | "high"
  | "medium"
  | "low";

export type CapacityGridRow = {
  traineeId: string;
  traineeName: string;
  employeeCode: string | null;
  designation: string | null;
  department: string;
  competencyId: string;
  competencyName: string;
  competencyCategory: string | null;
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
  competency_id: string;
  competency_name: string;
  competency_category: string | null;
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
      competencyId: row.competency_id,
      competencyName: row.competency_name,
      competencyCategory: row.competency_category,

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