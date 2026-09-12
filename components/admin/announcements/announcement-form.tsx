import { saveAnnouncement } from "@/app/admin/announcements/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Announcement } from "@/lib/admin/get-announcements";
import type { OrganizationalUnit } from "@/lib/admin/get-organization";

type AnnouncementFormProps = {
  announcement?: Announcement;
  units: OrganizationalUnit[];
};

function toDateTimeLocalValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function AnnouncementForm({
  announcement,
  units,
}: AnnouncementFormProps) {
  return (
    <form
      key={
        announcement
          ? `${announcement.id}-${announcement.updatedAt}`
          : "create-announcement"
      }
      action={saveAnnouncement}
      className="grid gap-4 sm:grid-cols-2"
    >
      {announcement && (
        <input type="hidden" name="id" value={announcement.id} />
      )}

      <label className="space-y-1.5 text-sm sm:col-span-2">
        <span className="block font-medium">Title</span>
        <Input
          name="title"
          defaultValue={announcement?.title ?? ""}
          required
          minLength={2}
          maxLength={150}
        />
      </label>

      <label className="space-y-1.5 text-sm sm:col-span-2">
        <span className="block font-medium">Message</span>
        <Textarea
          name="message"
          defaultValue={announcement?.message ?? ""}
          required
          maxLength={2000}
          rows={4}
        />
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">Audience</span>
        <Select
          name="audienceType"
          defaultValue={announcement?.audienceType ?? "all"}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="trainees">Trainees</SelectItem>
            <SelectItem value="trainers">Trainers</SelectItem>
            <SelectItem value="organizational_unit">
              Organizational Unit
            </SelectItem>
          </SelectContent>
        </Select>
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">
          Organizational Unit
          <span className="ml-1 font-normal text-muted-foreground">
            (used when audience is Organizational Unit)
          </span>
        </span>
        <Select
          name="organizationalUnitId"
          defaultValue={announcement?.organizationalUnitId ?? "none"}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {units.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">Priority</span>
        <Select
          name="priority"
          defaultValue={announcement?.priority ?? "normal"}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="important">Important</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">Status</span>
        <Select name="status" defaultValue={announcement?.status ?? "draft"}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">Action URL (optional)</span>
        <Input
          name="actionUrl"
          type="url"
          defaultValue={announcement?.actionUrl ?? ""}
          maxLength={2048}
          placeholder="https://example.com/details"
        />
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="block font-medium">Expiry (optional)</span>
        <Input
          name="expiresAt"
          type="datetime-local"
          defaultValue={toDateTimeLocalValue(announcement?.expiresAt ?? null)}
        />
      </label>

      <div className="flex items-end sm:col-span-2">
        <Button type="submit" variant={announcement ? "outline" : "default"}>
          {announcement ? "Save Changes" : "Create Announcement"}
        </Button>
      </div>
    </form>
  );
}
