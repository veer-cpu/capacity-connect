"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const revokeSchema = z.object({
    certificateId: z.string().uuid(),
    reason: z.string().trim().min(3).max(500),
});

export async function revokeCertificate(formData: FormData): Promise<void> {
    await requireRole("admin");

    const parsed = revokeSchema.safeParse({
        certificateId: formData.get("certificateId"),
        reason: formData.get("reason"),
    });

    if (!parsed.success) {
        throw new Error("A certificate ID and valid revocation reason are required.");
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_revoke_certificate", {
        p_certificate_id: parsed.data.certificateId,
        p_reason: parsed.data.reason,
    });

    if (error) {
        console.error("Unable to revoke certificate:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error("Unable to revoke certificate");
    }

    revalidatePath("/admin/certificates");
}