import "server-only";

import { createClient } from "@/lib/supabase/server";

export type AnnouncementFeedPriority = "normal" | "important" | "urgent";

export type AnnouncementFeedItem = {
    id: string;
    title: string;
    message: string;
    priority: AnnouncementFeedPriority;
    actionUrl: string | null;
    publishedAt: string | null;
};

type AnnouncementFeedRow = {
    id: string;
    title: string;
    message: string;
    priority: AnnouncementFeedPriority;
    action_url: string | null;
    published_at: string | null;
};

const FEED_LIMIT = 5;

// RLS on public.announcements already restricts rows to what this user's
// audience is allowed to see; this only filters by status and orders/limits.
export async function getAnnouncementFeed(): Promise<AnnouncementFeedItem[]> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("announcements")
            .select("id, title, message, priority, action_url, published_at")
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .limit(FEED_LIMIT);

        if (error) {
            console.error("Unable to load announcement feed:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
            });
            return [];
        }

        return ((data ?? []) as AnnouncementFeedRow[]).map((row) => ({
            id: row.id,
            title: row.title,
            message: row.message,
            priority: row.priority,
            actionUrl: row.action_url,
            publishedAt: row.published_at,
        }));
    } catch (error) {
        console.error("Unexpected error loading announcement feed:", error);
        return [];
    }
}
