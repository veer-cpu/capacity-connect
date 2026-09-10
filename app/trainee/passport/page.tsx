import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  History,
  ShieldCheck,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  getMyCompetencyPassport,
  type CompetencyPassportItem,
  type ProficiencyBand,
} from "@/lib/competency/get-competency-passport";
import { requireRole } from "@/lib/auth/require-role";

export default async function CompetencyPassportPage() {
  await requireRole("trainee");

  const items =
    await getMyCompetencyPassport();

  const assessedCompetencies =
    items.length;

  const atTarget =
    items.filter(
      (item) =>
        item.currentScore >=
        item.targetScore,
    ).length;

  const evidenceCount =
    items.reduce(
      (total, item) =>
        total +
        item.assessmentEvidenceCount +
        item.certificateCount,
      0,
    );

  const averageScore =
    items.length === 0
      ? 0
      : Math.round(
          items.reduce(
            (total, item) =>
              total + item.currentScore,
            0,
          ) / items.length,
        );

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Verified Capability Record
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Competency Passport
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          A consolidated view of your measured
          competencies, capability targets and
          supporting training evidence.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Measured Competencies"
          value={String(assessedCompetencies)}
          icon={ShieldCheck}
        />

        <SummaryCard
          title="Average Competency"
          value={`${averageScore}%`}
          icon={Target}
        />

        <SummaryCard
          title="Targets Achieved"
          value={`${atTarget}/${assessedCompetencies}`}
          icon={CheckCircle2}
        />

        <SummaryCard
          title="Evidence Records"
          value={String(evidenceCount)}
          icon={ClipboardCheck}
        />
      </section>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-medium">
              No competency evidence yet
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Complete a competency assessment
              to begin building your passport.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <CompetencyCard
              key={item.competencyId}
              item={item}
            />
          ))}
        </section>
      )}
    </main>
  );
}
function CompetencyCard({
  item,
}: {
  item: CompetencyPassportItem;
}) {
  const targetMet =
    item.currentScore >=
    item.targetScore;

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>
              {item.competencyName}
            </CardTitle>

            {item.competencyCategory && (
              <p className="mt-1 text-sm text-muted-foreground">
                {item.competencyCategory}
              </p>
            )}
          </div>

          <BandBadge
            band={item.proficiencyBand}
          />
        </div>

        {item.competencyDescription && (
          <p className="text-sm text-muted-foreground">
            {item.competencyDescription}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>
              Current capability
            </span>

            <span className="font-medium">
              {item.currentScore.toFixed(0)}
              {" / "}
              {item.targetScore.toFixed(0)}
            </span>
          </div>

          <Progress
            value={item.currentScore}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <EvidenceMetric
            label="Gap"
            value={
              targetMet
                ? "Target met"
                : item.gapScore.toFixed(0)
            }
          />

          <EvidenceMetric
            label="Assessments"
            value={String(
              item.assessmentEvidenceCount,
            )}
          />

          <EvidenceMetric
            label="Certificates"
            value={String(
              item.certificateCount,
            )}
          />

          <EvidenceMetric
            label="Score Updates"
            value={String(
              item.scoreHistoryCount,
            )}
          />
        </div>

        {item.latestAssessmentPercentage !==
          null && (
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="size-4 text-muted-foreground" />

              <span className="text-sm font-medium">
                Latest assessment
              </span>
            </div>

            <p className="mt-2 text-2xl font-semibold">
              {item.latestAssessmentPercentage.toFixed(
                0,
              )}
              %
            </p>

            {item.latestAssessmentAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(
                  item.latestAssessmentAt,
                )}
              </p>
            )}
          </div>
        )}

        {item.improvement !== null && (
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <History className="size-4 text-muted-foreground" />

              <span className="text-sm">
                Latest competency movement
              </span>
            </div>

            <Badge
              variant={
                item.improvement >= 0
                  ? "secondary"
                  : "outline"
              }
            >
              {item.improvement >= 0
                ? "+"
                : ""}
              {item.improvement.toFixed(1)}
            </Badge>
          </div>
        )}

        {item.certificateCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="size-4" />
            Supported by active course
            certification
          </div>
        )}

        {item.lastScoreUpdate && (
          <p className="text-xs text-muted-foreground">
            Competency record updated{" "}
            {formatDate(item.lastScoreUpdate)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
function EvidenceMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>
    </div>
  );
}
function BandBadge({
  band,
}: {
  band: ProficiencyBand;
}) {
  if (band === "Advanced") {
    return (
      <Badge>
        Advanced
      </Badge>
    );
  }

  if (band === "Proficient") {
    return (
      <Badge variant="secondary">
        Proficient
      </Badge>
    );
  }

  if (band === "Developing") {
    return (
      <Badge variant="outline">
        Developing
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      Beginner
    </Badge>
  );
}
function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {value}
          </p>
        </div>

        <Icon className="size-5 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
    },
  ).format(new Date(value));
}