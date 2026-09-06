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

const competencyFields = {
    name: z.string().trim().min(2).max(120),
    description: optionalText(1000),
    category: optionalText(120),
    defaultTargetScore: z.coerce.number().min(0).max(100),
};

const competencySchema = z.object(competencyFields);
const updateSchema = competencySchema.extend({
    competencyId: z.string().uuid(),
});

function revalidateCompetencyPages() {
    revalidatePath("/admin/competencies");
    revalidatePath("/admin/heatmap");
    revalidatePath("/admin/dashboard");
}

export async function createCompetency(formData: FormData): Promise<void> {
    await requireRole("admin");

    const parsed = competencySchema.safeParse({
        name: formData.get("name"),
        description: formData.get("description"),
        category: formData.get("category"),
        defaultTargetScore: formData.get("defaultTargetScore"),
    });

    if (!parsed.success) throw new Error("Invalid competency details.");

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_create_competency", {
        p_name: parsed.data.name,
        p_description: parsed.data.description ?? null,
        p_category: parsed.data.category ?? null,
        p_default_target_score: parsed.data.defaultTargetScore,
    });

    if (error) {
        console.error("Unable to create competency:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(`Unable to create competency: ${error.message}`);
    }

    revalidateCompetencyPages();
}

export async function updateCompetency(formData: FormData): Promise<void> {
    await requireRole("admin");

    const parsed = updateSchema.safeParse({
        competencyId: formData.get("competencyId"),
        name: formData.get("name"),
        description: formData.get("description"),
        category: formData.get("category"),
        defaultTargetScore: formData.get("defaultTargetScore"),
    });

    if (!parsed.success) throw new Error("Invalid competency details.");

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_update_competency", {
        p_competency_id: parsed.data.competencyId,
        p_name: parsed.data.name,
        p_description: parsed.data.description ?? null,
        p_category: parsed.data.category ?? null,
        p_default_target_score: parsed.data.defaultTargetScore,
    });

    if (error) {
        console.error("Unable to update competency:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(`Unable to update competency: ${error.message}`);
    }

    revalidateCompetencyPages();
}

export async function setCompetencyActive(formData: FormData): Promise<void> {
    await requireRole("admin");

    const parsed = z
        .object({
            competencyId: z.string().uuid(),
            isActive: z.enum(["true", "false"]),
        })
        .safeParse({
            competencyId: formData.get("competencyId"),
            isActive: formData.get("isActive"),
        });

    if (!parsed.success) throw new Error("Invalid competency status request.");

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_set_competency_active", {
        p_competency_id: parsed.data.competencyId,
        p_is_active: parsed.data.isActive === "true",
    });

    if (error) {
        console.error("Unable to update competency status:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(`Unable to update competency status: ${error.message}`);
    }

    revalidateCompetencyPages();
}
