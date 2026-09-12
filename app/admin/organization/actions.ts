"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const optionalText = (max: number) =>
    z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().trim().max(max).optional()
    );

const optionalUuid = z.preprocess(
    (value) => (value === "" || value === "none" ? undefined : value),
    z.string().uuid().optional()
);

function revalidateOrganizationPage() {
    revalidatePath("/admin/organization");
}

const organizationalUnitSchema = z.object({
    unitId: optionalUuid,
    name: z.string().trim().min(2).max(150),
    code: optionalText(50),
    description: optionalText(1000),
    parentUnitId: optionalUuid,
    isActive: z.enum(["true", "false"]),
});

export async function upsertOrganizationalUnit(
    formData: FormData
): Promise<void> {
    await requireRole("admin");

    const parsed = organizationalUnitSchema.safeParse({
        unitId: formData.get("unitId"),
        name: formData.get("name"),
        code: formData.get("code"),
        description: formData.get("description"),
        parentUnitId: formData.get("parentUnitId"),
        isActive: formData.get("isActive"),
    });

    if (!parsed.success) {
        throw new Error("Invalid organizational unit details.");
    }

    if (
        parsed.data.unitId &&
        parsed.data.parentUnitId &&
        parsed.data.unitId === parsed.data.parentUnitId
    ) {
        throw new Error("An organizational unit cannot be its own parent.");
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_upsert_organizational_unit", {
        p_id: parsed.data.unitId ?? null,
        p_name: parsed.data.name,
        p_code: parsed.data.code ?? null,
        p_description: parsed.data.description ?? null,
        p_parent_unit_id: parsed.data.parentUnitId ?? null,
        p_is_active: parsed.data.isActive === "true",
    });

    if (error) {
        console.error("Unable to save organizational unit:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error("Unable to save organizational unit. Please try again.");
    }

    revalidateOrganizationPage();
}

const jobRoleSchema = z.object({
    roleId: optionalUuid,
    organizationalUnitId: optionalUuid,
    name: z.string().trim().min(2).max(150),
    code: optionalText(50),
    description: optionalText(1000),
    isActive: z.enum(["true", "false"]),
});

export async function upsertJobRole(formData: FormData): Promise<void> {
    await requireRole("admin");

    const parsed = jobRoleSchema.safeParse({
        roleId: formData.get("roleId"),
        organizationalUnitId: formData.get("organizationalUnitId"),
        name: formData.get("name"),
        code: formData.get("code"),
        description: formData.get("description"),
        isActive: formData.get("isActive"),
    });

    if (!parsed.success) {
        throw new Error("Invalid job role details.");
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_upsert_job_role", {
        p_id: parsed.data.roleId ?? null,
        p_organizational_unit_id: parsed.data.organizationalUnitId ?? null,
        p_name: parsed.data.name,
        p_code: parsed.data.code ?? null,
        p_description: parsed.data.description ?? null,
        p_is_active: parsed.data.isActive === "true",
    });

    if (error) {
        console.error("Unable to save job role:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error("Unable to save job role. Please try again.");
    }

    revalidateOrganizationPage();
}

const jobRoleCompetencySchema = z.object({
    jobRoleId: z.string().uuid(),
    competencyId: z.string().uuid(),
    requiredScore: z.coerce.number().min(0).max(100),
    importance: z.enum(["core", "important", "supporting"]),
    rationale: optionalText(1000),
});

export async function setJobRoleCompetency(formData: FormData): Promise<void> {
    await requireRole("admin");

    const parsed = jobRoleCompetencySchema.safeParse({
        jobRoleId: formData.get("jobRoleId"),
        competencyId: formData.get("competencyId"),
        requiredScore: formData.get("requiredScore"),
        importance: formData.get("importance"),
        rationale: formData.get("rationale"),
    });

    if (!parsed.success) {
        throw new Error("Invalid competency requirement details.");
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_set_job_role_competency", {
        p_job_role_id: parsed.data.jobRoleId,
        p_competency_id: parsed.data.competencyId,
        p_required_score: parsed.data.requiredScore,
        p_importance: parsed.data.importance,
        p_rationale: parsed.data.rationale ?? null,
    });

    if (error) {
        console.error("Unable to save job role competency:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(
            "Unable to save the competency requirement. Please try again."
        );
    }

    revalidateOrganizationPage();
}

const removeJobRoleCompetencySchema = z.object({
    jobRoleId: z.string().uuid(),
    competencyId: z.string().uuid(),
});

export async function removeJobRoleCompetency(
    formData: FormData
): Promise<void> {
    await requireRole("admin");

    const parsed = removeJobRoleCompetencySchema.safeParse({
        jobRoleId: formData.get("jobRoleId"),
        competencyId: formData.get("competencyId"),
    });

    if (!parsed.success) {
        throw new Error("Invalid competency requirement request.");
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_remove_job_role_competency", {
        p_job_role_id: parsed.data.jobRoleId,
        p_competency_id: parsed.data.competencyId,
    });

    if (error) {
        console.error("Unable to remove job role competency:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(
            "Unable to remove the competency requirement. Please try again."
        );
    }

    revalidateOrganizationPage();
}
