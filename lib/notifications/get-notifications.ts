import {
  requireAuthenticatedProfile,
} from "@/lib/auth/require-role";

export type NotificationItem = {
    id: string;
    type: string;
    title: string;
    message: string;
    entityType: string | null;
    entityId: string | null;
    actionUrl: string | null;
    priority: string;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
};

type NotificationRow = {
    id: string;
    type: string;
    title: string;
    message: string;
    entity_type: string | null;
    entity_id: string | null;
    action_url: string | null;
    priority: string;
    is_read: boolean | null;
    read_at: string | null;
    created_at: string;
};



export async function getMyNotifications(limit = 50): Promise<NotificationItem[]> {
const { supabase } =
  await requireAuthenticatedProfile();    const { data, error } = await supabase.rpc("get_my_notifications", {
        p_limit: limit,
    });

    if (error) {
        console.error("Unable to load notifications:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error("Unable to load notifications");
    }

    return (data ?? []).map((row: NotificationRow) => ({
        id: row.id,
        type: row.type,
        title: row.title,
        message: row.message,
        entityType: row.entity_type,
        entityId: row.entity_id,
        actionUrl: row.action_url,
        priority: row.priority,
        isRead: Boolean(row.is_read),
        readAt: row.read_at,
        createdAt: row.created_at,
    }));
}

export async function getUnreadNotificationCount(): Promise<number> {
const { supabase } =
  await requireAuthenticatedProfile();    const { data, error } = await supabase.rpc(
        "get_my_unread_notification_count"
    );

    if (error) {
        console.error("Unable to load unread notification count:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error("Unable to load unread notification count");
    }

    return Number(data ?? 0);
}
