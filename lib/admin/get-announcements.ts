import "server-only";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type AnnouncementAudience =
    | "all"
    | "trainees"
    | "trainers"
    | "organizational_unit";

export type AnnouncementPriority = "normal" | "important" | "urgent";

export type AnnouncementStatus = "draft" | "published" | "archived";

export type Announcement = {
    id: string;
    title: string;
    message: string;
    audienceType: AnnouncementAudience;
    organizationalUnitId: string | null;
    organizationalUnitName: string | null;
    priority: AnnouncementPriority;
    actionUrl: string | null;
    expiresAt: string | null;
    status: AnnouncementStatus;
    createdAt: string;
    updatedAt: string;
};

type AnnouncementRow = {
    id: string;
    title: string;
    message: string;
    audience_type: AnnouncementAudience;
    organizational_unit_id: string | null;
    priority: AnnouncementPriority;
    action_url: string | null;
    expires_at: string | null;
    status: AnnouncementStatus;
    created_at: string;
    updated_at: string;
};

export async function getAdminAnnouncements(): Promise<Announcement[]> {
    await requireRole("admin");
    const supabase = await createClient();

    const [{ data, error }, unitsResult] = await Promise.all([
        supabase
            .from("announcements")
            .select(
                "id, title, message, audience_type, organizational_unit_id, priority, action_url, expires_at, status, created_at, updated_at"
            )
            .order("created_at", { ascending: false }),
        supabase.from("organizational_units").select("id, name"),
    ]);

    if (error) {
        console.error("Unable to load announcements:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error("Unable to load announcements.");
    }

    if (unitsResult.error) {
        console.error("Unable to load organizational units for announcements:", {
            message: unitsResult.error.message,
            code: unitsResult.error.code,
            details: unitsResult.error.details,
            hint: unitsResult.error.hint,
        });
        throw new Error("Unable to load announcements.");
    }

    const unitNameById = new Map(
        (unitsResult.data ?? []).map((unit) => [unit.id as string, unit.name as string])
    );

    return ((data ?? []) as AnnouncementRow[]).map((row) => ({
        id: row.id,
        title: row.title,
        message: row.message,
        audienceType: row.audience_type,
        organizationalUnitId: row.organizational_unit_id,
        organizationalUnitName: row.organizational_unit_id
            ? (unitNameById.get(row.organizational_unit_id) ?? null)
            : null,
        priority: row.priority,
        actionUrl: row.action_url,
        expiresAt: row.expires_at,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
}
