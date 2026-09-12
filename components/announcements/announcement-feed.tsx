import { Megaphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAnnouncementFeed,
  type AnnouncementFeedItem,
  type AnnouncementFeedPriority,
} from "@/lib/announcements/get-announcement-feed";

function formatPublishedDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function PriorityBadge({ priority }: { priority: AnnouncementFeedPriority }) {
  if (priority === "urgent") {
    return <Badge variant="destructive">Urgent</Badge>;
  }
  if (priority === "important") {
    return <Badge variant="secondary">Important</Badge>;
  }
  return <Badge variant="outline">Normal</Badge>;
}

export async function AnnouncementFeed() {
  const announcements = await getAnnouncementFeed();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="size-4" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No announcements right now.
          </p>
        ) : (
          <ul className="space-y-4">
            {announcements.map((announcement) => (
              <AnnouncementFeedItemRow
                key={announcement.id}
                announcement={announcement}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function AnnouncementFeedItemRow({
  announcement,
}: {
  announcement: AnnouncementFeedItem;
}) {
  const publishedDate = formatPublishedDate(announcement.publishedAt);

  return (
    <li className="space-y-1.5 border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium">{announcement.title}</p>
        <PriorityBadge priority={announcement.priority} />
      </div>

      <p className="text-sm text-muted-foreground">{announcement.message}</p>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {publishedDate && <span>{publishedDate}</span>}
        {announcement.actionUrl && (
          <a
            href={announcement.actionUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            View details
          </a>
        )}
      </div>
    </li>
  );
}
