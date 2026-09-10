import { Award } from "lucide-react";

import { ExternalCertificationSection } from "./external-certification-section";
import { ExperienceSection } from "./experience-section";
import { InterestSection } from "./interest-section";
import { QualificationSection } from "./qualification-section";
import type { ProfessionalProfile as ProfessionalProfileData } from "@/lib/profile/get-professional-profile";
import type { TraineeCertificate } from "@/lib/certificates/get-certificates";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export function ProfessionalProfile({
  profile,
  profilePath,
  certificates = [],
}: {
  profile: ProfessionalProfileData;
  profilePath: "/trainee/profile" | "/trainer/profile";
  certificates?: TraineeCertificate[];
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow={`${profile.role} workspace`}
        title="Professional Profile"
        description="Maintain your professional record and review your competency evidence."
      />
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Your account identity and role are managed separately from
            professional profile details.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Detail label="Full Name" value={profile.fullName} />
          <Detail label="Email" value={profile.email} />
          <Detail
            label="Role"
            value={
              <Badge variant="secondary" className="capitalize">
                {profile.role}
              </Badge>
            }
          />
          <Detail label="Designation" value={profile.designation} />
          <Detail label="Department" value={profile.department} />
          <Detail label="Professional Bio" value={profile.bio} />
        </CardContent>
      </Card>
      <QualificationSection
        items={profile.qualifications}
        profilePath={profilePath}
      />
      <ExperienceSection
        items={profile.experiences}
        profilePath={profilePath}
      />
      <InterestSection items={profile.interests} profilePath={profilePath} />
      <CompetencySection items={profile.competencies} />
      <ExternalCertificationSection
        items={profile.externalCertifications}
        profilePath={profilePath}
      />
      <CertificatesSection items={certificates} />
    </div>
  );
}
function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="text-sm leading-6">{value || "Not provided"}</div>
    </div>
  );
}
function CompetencySection({
  items,
}: {
  items: ProfessionalProfileData["competencies"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Competency Profile</CardTitle>
        <CardDescription>
          Current and target scores are maintained through CAPACITY CONNECT
          competency workflows.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No competency records are available yet.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => {
              const gap = item.targetScore - item.currentScore;
              return (
                <div
                  key={item.id}
                  className="grid gap-2 py-3 sm:grid-cols-[1fr_auto_auto]"
                >
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Current: {item.currentScore}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Target: {item.targetScore}{" "}
                    {gap > 0 ? `(${gap} to target)` : "(target met)"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function CertificatesSection({ items }: { items: TraineeCertificate[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>CAPACITY CONNECT Certificates</CardTitle>
        <CardDescription>
          Certificates issued through CAPACITY CONNECT are managed separately
          from external certifications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No CAPACITY CONNECT certificates are available yet.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 py-3">
                <Award className="mt-0.5 size-4 text-[var(--institutional-saffron)]" />
                <div>
                  <p className="font-medium">{item.courseTitle}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Issued {new Date(item.issuedAt).toLocaleDateString()}
                  </p>
                  {item.revokedAt ? (
                    <Badge variant="destructive" className="mt-2">
                      Revoked
                    </Badge>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
