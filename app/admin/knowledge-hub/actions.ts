"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const reviewSchema = z.object({
    resourceId: z.string().uuid(),
    action: z.enum(["approve", "reject", "archive"]),
    reason: z.string().trim().max(500).optional(),
});

export async function reviewKnowledgeResource(formData: FormData): Promise<void> {
    await requireRole("admin");

    const parsed = reviewSchema.safeParse({
        resourceId: formData.get("resourceId"),
        action: formData.get("action"),
        reason: formData.get("reason") || undefined,
    });

    if (!parsed.success) {
        throw new Error("Invalid knowledge resource review request.");
    }

    const { resourceId, action, reason } = parsed.data;

    if (action === "reject" && !reason) {
        throw new Error("A reason is required to reject a knowledge resource.");
    }

    const supabase = await createClient();

    // All status transitions are performed through the existing trusted RPC,
    // never via a direct client-side status update.
    const { error } = await supabase.rpc("admin_review_knowledge_resource", {
        p_resource_id: resourceId,
        p_action: action,
        p_reason: reason ?? null,
    });

    if (error) {
        console.error("Unable to review knowledge resource:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });

        throw new Error(`Unable to update knowledge resource: ${error.message}`);
    }

    revalidatePath("/admin/knowledge-hub");
    revalidatePath("/trainer/knowledge-hub");
}
