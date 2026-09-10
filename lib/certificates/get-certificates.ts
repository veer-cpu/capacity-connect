import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type TraineeCertificate = {
    id: string;
    certificateNumber: string;
    verificationCode: string;
    courseId: string;
    courseTitle: string;
    courseSlug: string;
    issuedAt: string;
    revokedAt: string | null;
};

type CertificateRow = {
    certificate_id: string;
    certificate_number: string;
    verification_code: string;
    course_id: string;
    course_title: string;
    course_slug: string;
    issued_at: string;
    revoked_at: string | null;
};

export async function getMyCertificates(): Promise<TraineeCertificate[]> {
    await requireRole("trainee");

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_my_certificates");

    if (error) {
        console.error("Unable to load certificates:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(
  "Unable to load certificates."
);
    }

    return (data ?? []).map((row: CertificateRow) => ({
        id: row.certificate_id,
        certificateNumber: row.certificate_number,
        verificationCode: row.verification_code,
        courseId: row.course_id,
        courseTitle: row.course_title,
        courseSlug: row.course_slug,
        issuedAt: row.issued_at,
        revokedAt: row.revoked_at,
    }));
}
