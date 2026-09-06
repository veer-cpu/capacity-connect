import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type AdminCompetency = {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    defaultTargetScore: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    mappedCourseCount: number;
    traineeCount: number;
    verifiedTrainerCount: number;
};

type AdminCompetencyRow = {
    competency_id: string;
    name: string;
    description: string | null;
    category: string | null;
    default_target_score: number | string;
    is_active: boolean | null;
    created_at: string;
    updated_at: string;
    mapped_course_count: number | string;
    trainee_count: number | string;
    verified_trainer_count: number | string;
};

export async function getAdminCompetencies(): Promise<AdminCompetency[]> {
    await requireRole("admin");

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("admin_list_competencies");

    if (error) {
        console.error("Unable to load admin competencies:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(`Unable to load competencies: ${error.message}`);
    }

    return (data ?? []).map((row: AdminCompetencyRow) => ({
        id: row.competency_id,
        name: row.name,
        description: row.description,
        category: row.category,
        defaultTargetScore: Number(row.default_target_score),
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        mappedCourseCount: Number(row.mapped_course_count),
        traineeCount: Number(row.trainee_count),
        verifiedTrainerCount: Number(row.verified_trainer_count),
    }));
}
