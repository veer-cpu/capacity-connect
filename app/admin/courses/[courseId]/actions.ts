"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const courseCompetencySchema = z.object({
    courseId: z.string().uuid(),
    competencyId: z.string().uuid(),
});

const upsertSchema = courseCompetencySchema.extend({
    relevanceWeight: z.coerce.number().min(0).max(100),
});

export async function upsertCourseCompetency(
    formData: FormData
): Promise<void> {
    await requireRole("admin");

    const parsed = upsertSchema.safeParse({
        courseId: formData.get("courseId"),
        competencyId: formData.get("competencyId"),
        relevanceWeight: formData.get("relevanceWeight"),
    });

    if (!parsed.success) {
        throw new Error("Invalid course competency mapping.");
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_upsert_course_competency", {
        p_course_id: parsed.data.courseId,
        p_competency_id: parsed.data.competencyId,
        p_relevance_weight: parsed.data.relevanceWeight,
    });

    if (error) {
        console.error("Unable to save course competency mapping:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });

        throw new Error(`Unable to save course competency mapping: ${error.message}`);
    }

    revalidatePath(`/admin/courses/${parsed.data.courseId}`);
    revalidatePath("/admin/courses");
}

export async function removeCourseCompetency(
    formData: FormData
): Promise<void> {
    await requireRole("admin");

    const parsed = courseCompetencySchema.safeParse({
        courseId: formData.get("courseId"),
        competencyId: formData.get("competencyId"),
    });

    if (!parsed.success) {
        throw new Error("Invalid course competency mapping.");
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_remove_course_competency", {
        p_course_id: parsed.data.courseId,
        p_competency_id: parsed.data.competencyId,
    });

    if (error) {
        console.error("Unable to remove course competency mapping:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });

        throw new Error(`Unable to remove course competency mapping: ${error.message}`);
    }

    revalidatePath(`/admin/courses/${parsed.data.courseId}`);
    revalidatePath("/admin/courses");
}