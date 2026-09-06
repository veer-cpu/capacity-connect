import Link from "next/link";

import {
  getAdminCertificates,
  type AdminCertificate,
} from "@/lib/certificates/get-admin-certificates";
import { requireRole } from "@/lib/auth/require-role";
import { revokeCertificate } from "./actions";

export default async function AdminCertificatesPage() {
  await requireRole("admin");
  const certificates = await getAdminCertificates();

  return (
    <main className="mx-auto max-w-7xl p-8">
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="text-sm text-gray-500 hover:text-black"
        >
          Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">Certificate Management</h1>
        <p className="mt-2 text-gray-600">
          Review and revoke certificates issued through CAPACITY CONNECT.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-gray-500">
          No certificates have been issued yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3">Certificate Number</th>
                  <th className="px-4 py-3">Learner</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Issued</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((certificate) => (
                  <CertificateRow
                    key={certificate.id}
                    certificate={certificate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}

function CertificateRow({ certificate }: { certificate: AdminCertificate }) {
  return (
    <tr className="border-t align-top">
      <td className="px-4 py-4 font-medium">{certificate.certificateNumber}</td>
      <td className="px-4 py-4">
        {certificate.traineeName ?? "Unnamed learner"}
      </td>
      <td className="px-4 py-4">{certificate.courseTitle}</td>
      <td className="px-4 py-4">{formatDate(certificate.issuedAt)}</td>
      <td className="px-4 py-4">
        <span
          className={`rounded-full border px-2.5 py-1 text-xs ${certificate.revokedAt ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
        >
          {certificate.revokedAt ? "Revoked" : "Valid"}
        </span>
      </td>
      <td className="px-4 py-4">
        {certificate.revokedAt ? (
          <p className="max-w-xs text-sm text-gray-600">
            {certificate.revocationReason ?? "No reason provided."}
          </p>
        ) : (
          <form
            action={revokeCertificate}
            className="flex min-w-64 flex-col gap-2"
          >
            <input type="hidden" name="certificateId" value={certificate.id} />
            <textarea
              name="reason"
              minLength={3}
              maxLength={500}
              required
              rows={2}
              placeholder="Reason for revocation"
              className="rounded-md border px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="self-start rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
            >
              Revoke Certificate
            </button>
          </form>
        )}
      </td>
    </tr>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}
