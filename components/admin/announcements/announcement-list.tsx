import {
  archiveAnnouncement,
  publishAnnouncement,
} from "@/app/admin/announcements/actions";
import { AnnouncementForm } from "@/components/admin/announcements/announcement-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import type {
  Announcement,
  AnnouncementPriority,
} from "@/lib/admin/get-announcements";
import type { OrganizationalUnit } from "@/lib/admin/get-organization";

type AnnouncementListProps = {
  announcements: Announcement[];
  units: OrganizationalUnit[];
};

function formatAudience(announcement: Announcement): string {
  switch (announcement.audienceType) {
    case "all":
      return "All users";
    case "trainees":
      return "Trainees";
    case "trainers":
      return "Trainers";
    case "organizational_unit":
      return announcement.organizationalUnitName
        ? `Unit: ${announcement.organizationalUnitName}`
        : "Organizational unit";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AnnouncementList({
  announcements,
  units,
}: AnnouncementListProps) {
  if (announcements.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No announcements have been created yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {announcements.map((announcement) => (
        <Card key={`${announcement.id}-${announcement.updatedAt}`}>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{announcement.title}</CardTitle>
                <CardDescription className="mt-1">
                  {formatAudience(announcement)}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <PriorityBadge priority={announcement.priority} />
                <StatusBadge status={announcement.status} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {announcement.message}
            </p>

            {announcement.actionUrl && (
              <a
                href={announcement.actionUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                View linked action
              </a>
            )}

            <p className="text-xs text-muted-foreground">
              {announcement.expiresAt
                ? `Expires ${formatDate(announcement.expiresAt)}`
                : "No expiry set"}
            </p>

            <div className="flex flex-wrap gap-2">
              {announcement.status !== "published" && (
                <form action={publishAnnouncement}>
                  <input type="hidden" name="id" value={announcement.id} />
                  <Button type="submit" size="sm">
                    Publish
                  </Button>
                </form>
              )}

              {announcement.status !== "archived" && (
                <form action={archiveAnnouncement}>
                  <input type="hidden" name="id" value={announcement.id} />
                  <Button type="submit" size="sm" variant="destructive">
                    Archive
                  </Button>
                </form>
              )}
            </div>

            <Separator />

            <AnnouncementForm announcement={announcement} units={units} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: AnnouncementPriority }) {
  if (priority === "urgent") {
    return <Badge variant="destructive">Urgent</Badge>;
  }
  if (priority === "important") {
    return <Badge variant="secondary">Important</Badge>;
  }
  return <Badge variant="outline">Normal</Badge>;
}
