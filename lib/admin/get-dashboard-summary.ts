import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type AdminDashboardSummary = {
    totalUsers: number;
    pendingUsers: number;
    activeTrainees: number;
    activeTrainers: number;
    publishedCourses: number;
    criticalGapGroups: number;
    highGapGroups: number;
};

type AdminDashboardSummaryRow = {
    total_users: number | string;
    pending_users: number | string;
    active_trainees: number | string;
    active_trainers: number | string;
    published_courses: number | string;
    critical_gap_groups: number | string;
    high_gap_groups: number | string;
};

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
    await requireRole("admin");

    const supabase = await createClient();
    const { data, error } = await supabase
        .rpc("admin_dashboard_summary")
        .maybeSingle();

    if (error) {
        console.error("Unable to load admin dashboard summary:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });

        throw new Error(`Unable to load dashboard summary: ${error.message}`);
    }

    const summary = (data ?? {}) as Partial<AdminDashboardSummaryRow>;

    return {
        totalUsers: Number(summary.total_users ?? 0),
        pendingUsers: Number(summary.pending_users ?? 0),
        activeTrainees: Number(summary.active_trainees ?? 0),
        activeTrainers: Number(summary.active_trainers ?? 0),
        publishedCourses: Number(summary.published_courses ?? 0),
        criticalGapGroups: Number(summary.critical_gap_groups ?? 0),
        highGapGroups: Number(summary.high_gap_groups ?? 0),
    };
}
