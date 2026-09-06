"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export async function issueCertificate(formData: FormData): Promise<void> {
    await requireRole("trainee");

    const parsed = z.string().uuid().safeParse(formData.get("enrollmentId"));
    if (!parsed.success) {
        throw new Error("Invalid enrollment ID.");
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("issue_course_certificate", {
        p_enrollment_id: parsed.data,
    });

    if (error) {
        console.error("Unable to issue certificate:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(`Unable to issue certificate: ${error.message}`);
    }

    revalidatePath("/trainee/certificates");
    revalidatePath("/trainee/courses");
}
