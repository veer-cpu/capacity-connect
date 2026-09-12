import "server-only";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type OrganizationalUnit = {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
    parentUnitId: string | null;
    parentUnitName: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

type OrganizationalUnitRow = {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
    parent_unit_id: string | null;
    is_active: boolean | null;
    created_at: string;
    updated_at: string;
};

export async function getOrganizationalUnits(): Promise<
    OrganizationalUnit[]
> {
    await requireRole("admin");
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("organizational_units")
        .select(
            "id, name, code, description, parent_unit_id, is_active, created_at, updated_at"
        )
        .order("name");

    if (error) {
        console.error("Unable to load organizational units:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error("Unable to load organizational units.");
    }

    const rows = (data ?? []) as OrganizationalUnitRow[];
    const nameById = new Map(rows.map((row) => [row.id, row.name]));

    return rows.map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        description: row.description,
        parentUnitId: row.parent_unit_id,
        parentUnitName: row.parent_unit_id
            ? (nameById.get(row.parent_unit_id) ?? null)
            : null,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
}

export type JobRole = {
    id: string;
    organizationalUnitId: string | null;
    organizationalUnitName: string | null;
    name: string;
    code: string | null;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

type JobRoleRow = {
    id: string;
    organizational_unit_id: string | null;
    name: string;
    code: string | null;
    description: string | null;
    is_active: boolean | null;
    created_at: string;
    updated_at: string;
};

export async function getJobRoles(): Promise<JobRole[]> {
    await requireRole("admin");
    const supabase = await createClient();

    const [{ data, error }, unitsResult] = await Promise.all([
        supabase
            .from("job_roles")
            .select(
                "id, organizational_unit_id, name, code, description, is_active, created_at, updated_at"
            )
            .order("name"),
        supabase.from("organizational_units").select("id, name"),
    ]);

    if (error) {
        console.error("Unable to load job roles:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error("Unable to load job roles.");
    }

    if (unitsResult.error) {
        console.error("Unable to load organizational units for job roles:", {
            message: unitsResult.error.message,
            code: unitsResult.error.code,
            details: unitsResult.error.details,
            hint: unitsResult.error.hint,
        });
        throw new Error("Unable to load job roles.");
    }

    const unitNameById = new Map(
        (unitsResult.data ?? []).map((unit) => [unit.id as string, unit.name as string])
    );

    return ((data ?? []) as JobRoleRow[]).map((row) => ({
        id: row.id,
        organizationalUnitId: row.organizational_unit_id,
        organizationalUnitName: row.organizational_unit_id
            ? (unitNameById.get(row.organizational_unit_id) ?? null)
            : null,
        name: row.name,
        code: row.code,
        description: row.description,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
}

export type JobRoleCompetencyImportance = "core" | "important" | "supporting";

export type JobRoleCompetency = {
    id: string;
    jobRoleId: string;
    competencyId: string;
    competencyName: string;
    requiredScore: number;
    importance: JobRoleCompetencyImportance;
    rationale: string | null;
};

type JobRoleCompetencyRow = {
    id: string;
    job_role_id: string;
    competency_id: string;
    required_score: number | string;
    importance: string;
    rationale: string | null;
};

export async function getJobRoleCompetencies(
    jobRoleId: string
): Promise<JobRoleCompetency[]> {
    await requireRole("admin");
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("job_role_competencies")
        .select("id, job_role_id, competency_id, required_score, importance, rationale")
        .eq("job_role_id", jobRoleId)
        .order("importance");

    if (error) {
        console.error("Unable to load job role competencies:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error("Unable to load required competencies.");
    }

    const rows = (data ?? []) as JobRoleCompetencyRow[];

    if (rows.length === 0) {
        return [];
    }

    const competencyIds = Array.from(
        new Set(rows.map((row) => row.competency_id))
    );

    const { data: competencyRows, error: competencyError } = await supabase
        .from("competencies")
        .select("id, name")
        .in("id", competencyIds);

    if (competencyError) {
        console.error("Unable to load competency names:", {
            message: competencyError.message,
            code: competencyError.code,
            details: competencyError.details,
            hint: competencyError.hint,
        });
        throw new Error("Unable to load required competencies.");
    }

    const nameById = new Map(
        (competencyRows ?? []).map((row) => [row.id as string, row.name as string])
    );

    return rows.map((row) => ({
        id: row.id,
        jobRoleId: row.job_role_id,
        competencyId: row.competency_id,
        competencyName: nameById.get(row.competency_id) ?? "Unknown competency",
        requiredScore: Number(row.required_score),
        importance: row.importance as JobRoleCompetencyImportance,
        rationale: row.rationale,
    }));
}

export type CompetencyOption = {
    id: string;
    name: string;
};

export async function getActiveCompetencyOptions(): Promise<
    CompetencyOption[]
> {
    await requireRole("admin");
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("competencies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

    if (error) {
        console.error("Unable to load active competencies:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error("Unable to load active competencies.");
    }

    return data ?? [];
}
