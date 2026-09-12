import Link from "next/link";

import { AnnouncementForm } from "@/components/admin/announcements/announcement-form";
import { AnnouncementList } from "@/components/admin/announcements/announcement-list";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getAdminAnnouncements } from "@/lib/admin/get-announcements";
import { getOrganizationalUnits } from "@/lib/admin/get-organization";
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminAnnouncementsPage() {
  await requireRole("admin");

  const [announcements, units] = await Promise.all([
    getAdminAnnouncements(),
    getOrganizationalUnits(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Announcements"
        description="Publish institution-wide or targeted updates for trainees and trainers."
        actions={
          <Link
            href="/admin/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to dashboard
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Create Announcement</CardTitle>
          <CardDescription>
            Draft a new announcement, then publish it when ready.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnnouncementForm units={units} />
        </CardContent>
      </Card>

      <AnnouncementList announcements={announcements} units={units} />
    </div>
  );
}
