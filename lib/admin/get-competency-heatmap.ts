import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type CompetencyRiskLevel = "Critical" | "High" | "Medium" | "Low";

export type AdminCompetencyHeatmapRow = {
    department: string;
    competencyId: string;
    competencyName: string;
    learnerCount: number;
    averageCurrentScore: number;
    averageTargetScore: number;
    averageGap: number;
    usersBelowTarget: number;
    criticalGapCount: number;
    highGapCount: number;
    riskLevel: CompetencyRiskLevel;
};

type AdminCompetencyHeatmapRpcRow = {
    department: string;
    competency_id: string;
    competency_name: string;
    learner_count: number | string;
    average_current_score: number | string;
    average_target_score: number | string;
    average_gap: number | string;
    users_below_target: number | string;
    critical_gap_count: number | string;
    high_gap_count: number | string;
};

function deriveRiskLevel(
    averageGap: number,
    criticalGapCount: number,
    highGapCount: number
): CompetencyRiskLevel {
    if (averageGap >= 35 || criticalGapCount > 0) {
        return "Critical";
    }

    if (averageGap >= 20 || highGapCount > 0) {
        return "High";
    }

    if (averageGap >= 10) {
        return "Medium";
    }

    return "Low";
}

export async function getAdminCompetencyHeatmap(): Promise<
    AdminCompetencyHeatmapRow[]
> {
    await requireRole("admin");

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("admin_competency_heatmap");

    if (error) {
        console.error("Unable to load competency heatmap:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
throw new Error(
  "Unable to load competency heatmap."
);
    }

    return (data ?? []).map((row: AdminCompetencyHeatmapRpcRow) => {
        const averageGap = Number(row.average_gap);
        const criticalGapCount = Number(row.critical_gap_count);
        const highGapCount = Number(row.high_gap_count);

        return {
            department: row.department,
            competencyId: row.competency_id,
            competencyName: row.competency_name,
            learnerCount: Number(row.learner_count),
            averageCurrentScore: Number(row.average_current_score),
            averageTargetScore: Number(row.average_target_score),
            averageGap,
            usersBelowTarget: Number(row.users_below_target),
            criticalGapCount,
            highGapCount,
            riskLevel: deriveRiskLevel(
                averageGap,
                criticalGapCount,
                highGapCount
            ),
        };
    });
}
