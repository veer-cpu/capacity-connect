import Link from "next/link";

import {
  getAdminFeedbackOverview,
  type AdminFeedbackOverview,
} from "@/lib/admin/get-feedback-overview";

export default async function AdminFeedbackPage() {
  const feedback = await getAdminFeedbackOverview();

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="text-sm text-gray-500 hover:text-black"
        >
          Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">
          Trainer Feedback Overview
        </h1>
        <p className="mt-2 text-gray-600">
          Aggregate trainee feedback across active trainers.
        </p>
      </div>

      {feedback.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">
          No trainee feedback is available yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Trainer</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Feedback Count</th>
                  <th className="px-4 py-3 font-medium">Avg Trainer Rating</th>
                  <th className="px-4 py-3 font-medium">Avg Course Rating</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((row) => (
                  <FeedbackRow key={row.trainerId} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}

function FeedbackRow({ row }: { row: AdminFeedbackOverview }) {
  return (
    <tr className="border-t">
      <td className="px-4 py-4 font-medium">
        {row.trainerName ?? "Unnamed trainer"}
      </td>
      <td className="px-4 py-4">{row.trainerEmail}</td>
      <td className="px-4 py-4">{row.feedbackCount}</td>
      <td className="px-4 py-4">{formatRating(row.averageTrainerRating)}</td>
      <td className="px-4 py-4">{formatRating(row.averageCourseRating)}</td>
    </tr>
  );
}

function formatRating(value: number | null) {
  return value === null || !Number.isFinite(value) ? "N/A" : value.toFixed(1);
}
