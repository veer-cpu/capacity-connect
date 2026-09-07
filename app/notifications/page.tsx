import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getMyNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications/get-notifications";
import { markAllNotificationsRead, markNotificationRead } from "./actions";

export default async function NotificationsPage() {
  const [notifications, unreadCount] = await Promise.all([
    getMyNotifications(),
    getUnreadNotificationCount(),
  ]);
  return (
    <div className="space-y-8">
      <PageHeader
        title="Notifications"
        description="Updates about your learning, assessments, development plan, and platform activity."
        actions={
          <Link
            href="/trainee/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to dashboard
          </Link>
        }
      />
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-muted-foreground">
            Unread notifications:{" "}
            <span className="font-semibold text-foreground">{unreadCount}</span>
          </p>
          {unreadCount > 0 && (
            <form action={markAllNotificationsRead}>
              <Button type="submit" variant="outline">
                Mark All as Read
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      <Separator />
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No notifications yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={
                !notification.isRead
                  ? "border-primary/40 bg-primary/5"
                  : undefined
              }
            >
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{notification.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {formatDate(notification.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">
                      {notification.type}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {notification.priority}
                    </Badge>
                    <Badge
                      variant={notification.isRead ? "outline" : "default"}
                    >
                      {notification.isRead ? "Read" : "Unread"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {notification.message}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {notification.actionUrl && (
                    <Link
                      href={notification.actionUrl}
                      className={buttonVariants({ size: "sm" })}
                    >
                      Open
                    </Link>
                  )}
                  {!notification.isRead && (
                    <form action={markNotificationRead}>
                      <input
                        type="hidden"
                        name="notificationId"
                        value={notification.id}
                      />
                      <Button type="submit" size="sm" variant="outline">
                        Mark as Read
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
}
