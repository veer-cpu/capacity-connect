import { createClient } from "@/lib/supabase/server";

type VerifyPageProps = {
  params: Promise<{ code: string }>;
};

type VerificationResult = {
  valid: boolean;
  certificate_number: string | null;
  trainee_name: string | null;
  course_title: string | null;
  issued_at: string | null;
  revoked: boolean | null;
};

export default async function VerifyCertificatePage({
  params,
}: VerifyPageProps) {
  const { code } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("verify_certificate", {
    p_verification_code: code,
  });

  if (error) {
    console.error("Unable to verify certificate:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }

  const result = ((Array.isArray(data) ? data[0] : data) ??
    null) as VerificationResult | null;

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
        {!result ? (
          <>
            <h1 className="text-2xl font-semibold">Certificate not found</h1>
            <p className="mt-3 text-gray-600">
              No certificate matches this verification code.
            </p>
          </>
        ) : result.revoked ? (
          <>
            <h1 className="text-2xl font-semibold text-red-700">
              Certificate revoked
            </h1>
            <p className="mt-3 text-gray-600">
              This certificate is no longer valid.
            </p>
          </>
        ) : result.valid ? (
          <>
            <h1 className="text-2xl font-semibold text-emerald-700">
              Certificate Verified
            </h1>
            <div className="mt-6 space-y-3 text-left text-sm">
              <Detail
                label="Certificate Number"
                value={result.certificate_number ?? "Unknown"}
              />
              <Detail
                label="Learner"
                value={result.trainee_name ?? "Unknown"}
              />
              <Detail label="Course" value={result.course_title ?? "Unknown"} />
              <Detail
                label="Issued Date"
                value={formatDate(result.issued_at)}
              />
            </div>
            <p className="mt-8 text-sm font-medium text-gray-600">
              Verified by CAPACITY CONNECT
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Certificate not found</h1>
            <p className="mt-3 text-gray-600">
              This certificate could not be verified.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}
