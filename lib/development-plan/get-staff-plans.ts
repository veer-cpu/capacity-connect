import { requireAnyRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type StaffDevelopmentPlanSummary = {
    planId: string;
    traineeId: string;
    traineeName: string | null;
    department: string | null;
    designation: string | null;
    planTitle: string;
    planStatus: string;
    startDate: string | null;
    targetDate: string | null;
    completedItems: number;
    totalItems: number;
    progressPercentage: number;
};

type StaffDevelopmentPlanSummaryRow = {
    plan_id: string;
    trainee_id: string;
    trainee_name: string | null;
    department: string | null;
    designation: string | null;
    plan_title: string;
    plan_status: string;
    start_date: string | null;
    target_date: string | null;
    completed_items: number | string;
    total_items: number | string;
    progress_percentage: number | string;
};



export async function getStaffDevelopmentPlans(): Promise<
    StaffDevelopmentPlanSummary[]
> {
   await requireAnyRole(["admin", "trainer"]);

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("staff_list_development_plans");

    if (error) {
        console.error("Unable to load staff development plans:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(`Unable to load development plans: ${error.message}`);
    }

    return (data ?? []).map((row: StaffDevelopmentPlanSummaryRow) => ({
        planId: row.plan_id,
        traineeId: row.trainee_id,
        traineeName: row.trainee_name,
        department: row.department,
        designation: row.designation,
        planTitle: row.plan_title,
        planStatus: row.plan_status,
        startDate: row.start_date,
        targetDate: row.target_date,
        completedItems: Number(row.completed_items),
        totalItems: Number(row.total_items),
        progressPercentage: Number(row.progress_percentage),
    }));
}
