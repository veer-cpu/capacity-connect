import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type AdminCertificate = {
    id: string;
    certificateNumber: string;
    traineeId: string;
    traineeName: string | null;
    courseId: string;
    courseTitle: string;
    issuedAt: string;
    revokedAt: string | null;
    revocationReason: string | null;
};

type AdminCertificateRow = {
    certificate_id: string;
    certificate_number: string;
    trainee_id: string;
    trainee_name: string | null;
    course_id: string;
    course_title: string;
    issued_at: string;
    revoked_at: string | null;
    revocation_reason: string | null;
};

export async function getAdminCertificates(): Promise<AdminCertificate[]> {
    await requireRole("admin");

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("admin_list_certificates");

    if (error) {
        console.error("Unable to load admin certificates:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(`Unable to load certificates: ${error.message}`);
    }

    return (data ?? []).map((row: AdminCertificateRow) => ({
        id: row.certificate_id,
        certificateNumber: row.certificate_number,
        traineeId: row.trainee_id,
        traineeName: row.trainee_name,
        courseId: row.course_id,
        courseTitle: row.course_title,
        issuedAt: row.issued_at,
        revokedAt: row.revoked_at,
        revocationReason: row.revocation_reason,
    }));
}
