import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type StaffDevelopmentPlanDetailItem = {
    id: string;
    sequenceOrder: number;
    competencyId: string;
    competencyName: string;
    originalCurrentScore: number;
    targetScore: number;
    originalGapScore: number;
    originalPriority: string;
    latestCurrentScore: number | null;
    latestGapScore: number | null;
    latestPriority: string | null;
    recommendedCourseId: string | null;
    recommendedCourseTitle: string | null;
    recommendedTrainerId: string | null;
    recommendedTrainerName: string | null;
    status: string;
    rationale: string | null;
    startedAt: string | null;
    completedAt: string | null;
    lastEvaluatedAt: string | null;
};

export type StaffDevelopmentPlanDetail = {
    id: string;
    traineeId: string;
    traineeName: string | null;
    department: string | null;
    designation: string | null;
    title: string;
    status: string;
    startDate: string | null;
    targetDate: string | null;
    items: StaffDevelopmentPlanDetailItem[];
};

type StaffDevelopmentPlanDetailRow = {
    plan_id: string;
    trainee_id: string;
    trainee_name: string | null;
    department: string | null;
    designation: string | null;
    plan_title: string;
    plan_status: string;
    start_date: string | null;
    target_date: string | null;
    item_id: string;
    sequence_order: number | string;
    competency_id: string;
    competency_name: string;
    original_current_score: number | string;
    target_score: number | string;
    original_gap_score: number | string;
    original_priority: string;
    latest_current_score: number | string | null;
    latest_gap_score: number | string | null;
    latest_priority: string | null;
    recommended_course_id: string | null;
    recommended_course_title: string | null;
    recommended_trainer_id: string | null;
    recommended_trainer_name: string | null;
    item_status: string;
    rationale: string | null;
    started_at: string | null;
    completed_at: string | null;
    last_evaluated_at: string | null;
};

async function requireStaffRole() {
    return requireRole("admin").catch(() => requireRole("trainer"));
}

export async function getStaffDevelopmentPlanDetail(
    planId: string
): Promise<StaffDevelopmentPlanDetail | null> {
    await requireStaffRole();

    const parsed = z.string().uuid().safeParse(planId);
    if (!parsed.success) {
        throw new Error("Invalid development plan ID.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("staff_get_development_plan", {
        p_plan_id: parsed.data,
    });

    if (error) {
        console.error("Unable to load development plan detail:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(`Unable to load development plan: ${error.message}`);
    }

    const rows = (data ?? []) as StaffDevelopmentPlanDetailRow[];
    if (rows.length === 0) return null;

    const first = rows[0];
    return {
        id: first.plan_id,
        traineeId: first.trainee_id,
        traineeName: first.trainee_name,
        department: first.department,
        designation: first.designation,
        title: first.plan_title,
        status: first.plan_status,
        startDate: first.start_date,
        targetDate: first.target_date,
        items: rows
            .map((row) => ({
                id: row.item_id,
                sequenceOrder: Number(row.sequence_order),
                competencyId: row.competency_id,
                competencyName: row.competency_name,
                originalCurrentScore: Number(row.original_current_score),
                targetScore: Number(row.target_score),
                originalGapScore: Number(row.original_gap_score),
                originalPriority: row.original_priority,
                latestCurrentScore:
                    row.latest_current_score === null
                        ? null
                        : Number(row.latest_current_score),
                latestGapScore:
                    row.latest_gap_score === null ? null : Number(row.latest_gap_score),
                latestPriority: row.latest_priority,
                recommendedCourseId: row.recommended_course_id,
                recommendedCourseTitle: row.recommended_course_title,
                recommendedTrainerId: row.recommended_trainer_id,
                recommendedTrainerName: row.recommended_trainer_name,
                status: row.item_status,
                rationale: row.rationale,
                startedAt: row.started_at,
                completedAt: row.completed_at,
                lastEvaluatedAt: row.last_evaluated_at,
            }))
            .sort((left, right) => left.sequenceOrder - right.sequenceOrder),
    };
}