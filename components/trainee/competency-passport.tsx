import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  History,
  ShieldCheck,
  Target,
} from "lucide-react";
import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type {
  CompetencyPassportItem,
  ProficiencyBand,
} from "@/lib/trainee/get-competency-passport";

type GapPriority = "critical" | "high" | "medium" | "low";

// Display-only classification for the KPI summary; does not alter backend scores.
function deriveGapPriority(gapScore: number): GapPriority {
  if (gapScore >= 35) return "critical";
  if (gapScore >= 20) return "high";
  if (gapScore >= 10) return "medium";
  return "low";
}

function isNotYetAssessed(item: CompetencyPassportItem): boolean {
  return (
    item.currentScore === 0 &&
    item.assessmentEvidenceCount === 0 &&
    item.scoreHistoryCount === 0
  );
}

export function CompetencyPassport({
  items,
}: {
  items: CompetencyPassportItem[];
}) {
  const competenciesTracked = items.length;

  const competenciesAtTarget = items.filter(
    (item) => item.currentScore >= item.targetScore,
  ).length;

  const criticalHighGaps = items.filter((item) => {
    const priority = deriveGapPriority(item.gapScore);
    return priority === "critical" || priority === "high";
  }).length;

  const assessedItems = items.filter((item) => !isNotYetAssessed(item));

  const averageCurrentScore =
    assessedItems.length === 0
      ? 0
      : assessedItems.reduce((total, item) => total + item.currentScore, 0) /
        assessedItems.length;

  const averageRequiredScore =
    items.length === 0
      ? 0
      : items.reduce((total, item) => total + item.targetScore, 0) /
        items.length;

  const sortedItems = [...items].sort(
    (left, right) => right.gapScore - left.gapScore,
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Competencies Tracked"
          value={String(competenciesTracked)}
          icon={ShieldCheck}
        />
        <SummaryCard
          title="Competencies At Target"
          value={`${competenciesAtTarget}/${competenciesTracked}`}
          icon={CheckCircle2}
        />
        <SummaryCard
          title="Critical / High Gaps"
          value={String(criticalHighGaps)}
          icon={ClipboardCheck}
        />
        <SummaryCard
          title="Average Current Score"
          value={averageCurrentScore.toFixed(0)}
          icon={Target}
        />
        <SummaryCard
          title="Average Required Score"
          value={averageRequiredScore.toFixed(0)}
          icon={Target}
        />
      </section>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-medium">No competency evidence yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete a competency assessment to begin building your passport.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {sortedItems.map((item) => (
            <CompetencyPassportCard key={item.competencyId} item={item} />
          ))}
        </section>
      )}
    </div>
  );
}

function CompetencyPassportCard({ item }: { item: CompetencyPassportItem }) {
  const targetMet = item.currentScore >= item.targetScore;
  const notYetAssessed = isNotYetAssessed(item);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{item.competencyName}</CardTitle>
            {item.competencyCategory && (
              <p className="mt-1 text-sm text-muted-foreground">
                {item.competencyCategory}
              </p>
            )}
          </div>
          <BandBadge band={item.proficiencyBand} />
        </div>

        {item.competencyDescription && (
          <p className="text-sm text-muted-foreground">
            {item.competencyDescription}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Current Capability vs Required Capability
          </p>

          <div className="mt-2 grid grid-cols-3 gap-3">
            <CapabilityStat
              label="Current"
              value={
                notYetAssessed
                  ? "Not yet assessed"
                  : item.currentScore.toFixed(0)
              }
            />
            <CapabilityStat
              label="Required"
              value={item.targetScore.toFixed(0)}
            />
            <CapabilityStat
              label="Gap"
              value={targetMet ? "Target met" : item.gapScore.toFixed(0)}
            />
          </div>

          <Progress
            className="mt-3"
            value={notYetAssessed ? 0 : item.currentScore}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Evidence
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <EvidenceMetric
              label="Assessments"
              value={String(item.assessmentEvidenceCount)}
            />
            <EvidenceMetric
              label="Certificates"
              value={String(item.certificateCount)}
            />
            <EvidenceMetric
              label="Score Updates"
              value={String(item.scoreHistoryCount)}
            />
          </div>

          {item.latestAssessmentPercentage !== null && (
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Latest assessment</span>
              </div>
              <p className="mt-2 text-2xl font-semibold">
                {item.latestAssessmentPercentage.toFixed(0)}%
              </p>
              {item.latestAssessmentAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(item.latestAssessmentAt)}
                </p>
              )}
            </div>
          )}

          {item.improvement !== null && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <History className="size-4 text-muted-foreground" />
                <span className="text-sm">Latest competency movement</span>
              </div>
              <Badge variant={item.improvement >= 0 ? "secondary" : "outline"}>
                {item.improvement >= 0 ? "+" : ""}
                {item.improvement.toFixed(1)}
              </Badge>
            </div>
          )}

          {item.certificateCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="size-4" />
              Supported by active course certification
            </div>
          )}
        </div>

        {item.lastScoreUpdate && (
          <p className="text-xs text-muted-foreground">
            Competency record updated {formatDate(item.lastScoreUpdate)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function CapabilityStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function EvidenceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function BandBadge({ band }: { band: ProficiencyBand }) {
  if (band === "Advanced") {
    return <Badge>Advanced</Badge>;
  }
  if (band === "Proficient") {
    return <Badge variant="secondary">Proficient</Badge>;
  }
  if (band === "Developing") {
    return <Badge variant="outline">Developing</Badge>;
  }
  return <Badge variant="outline">Beginner</Badge>;
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <Icon className="size-5 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(value),
  );
}
