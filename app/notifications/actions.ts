"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import {
  requireAuthenticatedProfile,
} from "@/lib/auth/require-role";



export async function markNotificationRead(formData: FormData): Promise<void> {
    const parsed = z.string().uuid().safeParse(formData.get("notificationId"));

    if (!parsed.success) {
        throw new Error("Invalid notification ID.");
    }

const { supabase } =
  await requireAuthenticatedProfile();    const { error } = await supabase.rpc("mark_notification_read", {
        p_notification_id: parsed.data,
    });

    if (error) {
        console.error("Unable to mark notification as read:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error("Unable to mark notification as read");
    }

    revalidatePath("/notifications");
}

export async function markAllNotificationsRead(): Promise<void> {
const { supabase } =
  await requireAuthenticatedProfile();    const { error } = await supabase.rpc("mark_all_notifications_read");

    if (error) {
        console.error("Unable to mark all notifications as read:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error("Unable to mark all notifications as read");
    }

    revalidatePath("/notifications");
}
