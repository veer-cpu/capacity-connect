import Link from "next/link";

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
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Notifications</h1>
        <p className="mt-2 text-gray-600">
          Updates about your learning, assessments, development plan, and
          platform activity.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Unread notifications:{" "}
          <span className="font-semibold">{unreadCount}</span>
        </p>
        {unreadCount > 0 && (
          <form action={markAllNotificationsRead}>
            <button
              type="submit"
              className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Mark all as read
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-xl border p-5 shadow-sm ${
                notification.isRead
                  ? "bg-white"
                  : "border-blue-200 bg-blue-50/40"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{notification.title}</h2>
                    <span className="rounded-full border px-2 py-1 text-xs capitalize">
                      {notification.type}
                    </span>
                    <span className="rounded-full border px-2 py-1 text-xs capitalize">
                      {notification.priority}
                    </span>
                    <span className="text-xs text-gray-500">
                      {notification.isRead ? "Read" : "Unread"}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                    {notification.message}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(notification.createdAt)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {notification.actionUrl && (
                  <Link
                    href={notification.actionUrl}
                    className="rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
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
                    <button
                      type="submit"
                      className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-white"
                    >
                      Mark as read
                    </button>
                  </form>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
}
