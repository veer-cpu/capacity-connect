"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { buildDevelopmentPlanPreview } from "@/lib/competency/build-development-plan";
import { createClient } from "@/lib/supabase/server";

const createPlanSchema = z.object({
    title: z.string().trim().min(1).max(120),
    targetDate: z.preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().date().optional()
    ),
});

export async function refreshDevelopmentPlan(): Promise<void> {
  await requireRole("trainee");

  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "refresh_development_plan"
  );

  if (error) {
    console.error(
      "Unable to refresh development plan:",
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }
    );

    throw new Error(
      `Unable to refresh development plan: ${error.message}`
    );
  }

  revalidatePath(
    "/trainee/development-plan"
  );
}

export async function createDevelopmentPlan(formData: FormData): Promise<void> {
    await requireRole("trainee");
    const parsed = createPlanSchema.safeParse({
        title: formData.get("title"),
        targetDate: formData.get("targetDate"),
    });

    if (!parsed.success) throw new Error("Invalid development plan details.");

    const preview = await buildDevelopmentPlanPreview();
    if (preview.items.length === 0) {
        throw new Error("At least one active competency gap is required.");
    }

    const supabase = await createClient();
    const items = preview.items.map((item) => ({
        competencyId: item.competencyId,
        recommendedCourseId: item.recommendedCourse?.id ?? null,
        recommendedTrainerId: item.recommendedTrainer?.id ?? null,
        currentScore: item.currentScore,
        targetScore: item.targetScore,
        gapScore: item.gapScore,
        priority: item.priority,
        courseRecommendationScore: item.recommendedCourse?.recommendationScore ?? null,
        trainerMatchScore: item.recommendedTrainer?.matchScore ?? null,
        sequenceOrder: item.sequenceOrder,
        rationale: item.rationale,
    }));

    const { error } = await supabase.rpc("create_development_plan", {
        p_title: parsed.data.title,
        p_target_date: parsed.data.targetDate ?? null,
        p_items: items,
    });

    if (error) {
        console.error("Unable to create development plan:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(`Unable to create development plan: ${error.message}`);
    }

    revalidatePath("/trainee/development-plan");
}

const updateItemSchema = z.object({
    itemId: z.string().uuid(),
    status: z.enum(["pending", "in_progress", "completed", "skipped"]),
});

export async function updateDevelopmentPlanItemStatus(
    formData: FormData
): Promise<void> {
    await requireRole("trainee");
    const parsed = updateItemSchema.safeParse({
        itemId: formData.get("itemId"),
        status: formData.get("status"),
    });

    if (!parsed.success) throw new Error("Invalid development plan item update.");

    const supabase = await createClient();
    const { error } = await supabase.rpc("update_development_plan_item_status", {
        p_item_id: parsed.data.itemId,
        p_status: parsed.data.status,
    });

    if (error) {
        console.error("Unable to update development plan item:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(`Unable to update development plan item: ${error.message}`);
    }

    revalidatePath("/trainee/development-plan");
}