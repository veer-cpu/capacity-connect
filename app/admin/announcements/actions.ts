"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const optionalUuid = z.preprocess(
    (value) => (value === "" || value === "none" ? undefined : value),
    z.string().uuid().optional()
);

const optionalUrl = z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().url().max(2048).optional()
);

const optionalDateTime = z.preprocess(
    (value) => (value === "" ? null : value),
    z.union([
        z.null(),
        z
            .string()
            .refine(
                (value) => !Number.isNaN(new Date(value).getTime()),
                "Expiry must be a valid date and time."
            ),
    ])
);

const audienceSchema = z.enum([
    "all",
    "trainees",
    "trainers",
    "organizational_unit",
]);
const prioritySchema = z.enum(["normal", "important", "urgent"]);
const statusSchema = z.enum(["draft", "published", "archived"]);

const announcementSchema = z
    .object({
        id: optionalUuid,
        title: z.string().trim().min(2).max(150),
        message: z.string().trim().min(1).max(2000),
        audienceType: audienceSchema,
        organizationalUnitId: optionalUuid,
        priority: prioritySchema,
        actionUrl: optionalUrl,
        expiresAt: optionalDateTime,
        status: statusSchema,
    })
    .refine(
        (value) =>
            value.audienceType !== "organizational_unit" ||
            Boolean(value.organizationalUnitId),
        {
            message: "Select an organizational unit for this audience.",
            path: ["organizationalUnitId"],
        }
    );

function revalidateAnnouncementsPage() {
    revalidatePath("/admin/announcements");
}

export async function saveAnnouncement(formData: FormData): Promise<void> {
    await requireRole("admin");

    const parsed = announcementSchema.safeParse({
        id: formData.get("id"),
        title: formData.get("title"),
        message: formData.get("message"),
        audienceType: formData.get("audienceType"),
        organizationalUnitId: formData.get("organizationalUnitId"),
        priority: formData.get("priority"),
        actionUrl: formData.get("actionUrl"),
        expiresAt: formData.get("expiresAt"),
        status: formData.get("status"),
    });

    if (!parsed.success) {
        throw new Error("Invalid announcement details.");
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_save_announcement", {
        p_id: parsed.data.id ?? null,
        p_title: parsed.data.title,
        p_message: parsed.data.message,
        p_audience_type: parsed.data.audienceType,
        p_organizational_unit_id:
            parsed.data.audienceType === "organizational_unit"
                ? (parsed.data.organizationalUnitId ?? null)
                : null,
        p_priority: parsed.data.priority,
        p_action_url: parsed.data.actionUrl ?? null,
        p_expires_at: parsed.data.expiresAt
            ? new Date(parsed.data.expiresAt).toISOString()
            : null,
        p_status: parsed.data.status,
    });

    if (error) {
        console.error("Unable to save announcement:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error("Unable to save the announcement. Please try again.");
    }

    revalidateAnnouncementsPage();
}

const announcementIdSchema = z.object({
    id: z.string().uuid(),
});

async function transitionAnnouncementStatus(
    formData: FormData,
    nextStatus: "published" | "archived"
): Promise<void> {
    await requireRole("admin");

    const parsed = announcementIdSchema.safeParse({
        id: formData.get("id"),
    });

    if (!parsed.success) {
        throw new Error("Invalid announcement request.");
    }

    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
        .from("announcements")
        .select(
            "id, title, message, audience_type, organizational_unit_id, priority, action_url, expires_at"
        )
        .eq("id", parsed.data.id)
        .maybeSingle();

    if (fetchError || !existing) {
        console.error("Unable to load announcement for status change:", {
            message: fetchError?.message,
            code: fetchError?.code,
            details: fetchError?.details,
            hint: fetchError?.hint,
        });
        throw new Error("Unable to update the announcement. Please try again.");
    }

    const { error } = await supabase.rpc("admin_save_announcement", {
        p_id: existing.id,
        p_title: existing.title,
        p_message: existing.message,
        p_audience_type: existing.audience_type,
        p_organizational_unit_id: existing.organizational_unit_id,
        p_priority: existing.priority,
        p_action_url: existing.action_url,
        p_expires_at: existing.expires_at,
        p_status: nextStatus,
    });

    if (error) {
        console.error("Unable to update announcement status:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error("Unable to update the announcement. Please try again.");
    }

    revalidateAnnouncementsPage();
}

export async function publishAnnouncement(formData: FormData): Promise<void> {
    await transitionAnnouncementStatus(formData, "published");
}

export async function archiveAnnouncement(formData: FormData): Promise<void> {
    await transitionAnnouncementStatus(formData, "archived");
}
