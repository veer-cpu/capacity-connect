"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  requireAuthenticatedProfile,
} from "@/lib/auth/require-role";
const passwordSchema = z
    .object({
        newPassword: z.string().min(8).max(128),
        confirmPassword: z.string(),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
        path: ["confirmPassword"],
    });

export async function changePassword(formData: FormData): Promise<never> {
    const parsed = passwordSchema.safeParse({
        newPassword: formData.get("newPassword"),
        confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
        redirect("/settings?password=invalid");
    }

    const { supabase } =
  await requireAuthenticatedProfile();

    const { error } = await supabase.auth.updateUser({
        password: parsed.data.newPassword,
    });

    if (error) {
        redirect("/settings?password=error");
    }

    redirect("/settings?password=updated");
}

export async function signOut(): Promise<never> {
const { supabase } =
  await requireAuthenticatedProfile();
    await supabase.auth.signOut({
        scope: "local",
    });

    redirect("/login");
}
