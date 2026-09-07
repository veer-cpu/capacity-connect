import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
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
    <div className="space-y-8">
      <PageHeader
        title="Certificate Management"
        description="Review issued credentials and revoke certificates when necessary."
        actions={
          <Link
            href="/admin/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to dashboard
          </Link>
        }
      />

      <Alert>
        <AlertTitle>Credential integrity</AlertTitle>
        <AlertDescription>
          Revoking a certificate invalidates public verification and blocks
          future PDF downloads.
        </AlertDescription>
      </Alert>

      <Separator />

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No certificates have been issued yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Issued Certificates</CardTitle>
            <CardDescription>
              Review credential validity and record revocation reasons when
              required.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Certificate Number</TableHead>
                  <TableHead>Learner</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-72">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((certificate) => (
                  <CertificateRow
                    key={certificate.id}
                    certificate={certificate}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CertificateRow({ certificate }: { certificate: AdminCertificate }) {
  return (
    <TableRow className="align-top">
      <TableCell className="font-medium">
        {certificate.certificateNumber}
      </TableCell>
      <TableCell>{certificate.traineeName ?? "Unnamed learner"}</TableCell>
      <TableCell>{certificate.courseTitle}</TableCell>
      <TableCell>{formatDate(certificate.issuedAt)}</TableCell>
      <TableCell>
        <StatusBadge status={certificate.revokedAt ? "Revoked" : "Valid"} />
      </TableCell>
      <TableCell>
        {certificate.revokedAt ? (
          <div className="space-y-1 text-sm">
            <p className="font-medium text-muted-foreground">
              Revocation reason
            </p>
            <p className="max-w-xs whitespace-pre-wrap text-muted-foreground">
              {certificate.revocationReason ?? "No reason provided."}
            </p>
          </div>
        ) : (
          <form
            action={revokeCertificate}
            className="flex min-w-64 flex-col gap-2"
          >
            <input type="hidden" name="certificateId" value={certificate.id} />
            <Textarea
              name="reason"
              minLength={3}
              maxLength={500}
              required
              rows={2}
              placeholder="Reason for revocation"
              aria-label={`Revocation reason for ${certificate.certificateNumber}`}
            />
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              className="self-start"
            >
              Revoke Certificate
            </Button>
          </form>
        )}
      </TableCell>
    </TableRow>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}
