import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export default async function TraineeCompetenciesPage() {
  const { user } = await requireRole("trainee");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_competencies")
    .select("current_score, target_score, competencies (name, category)")
    .eq("user_id", user.id)
    .order("current_score", { ascending: true });
  if (error)
    return (
      <Alert variant="destructive">
        <AlertTitle>Unable to load competency information.</AlertTitle>
      </Alert>
    );
  return (
    <div className="space-y-8">
      <PageHeader
        title="Competency Gaps"
        description="Compare current competency levels against target capability requirements."
        actions={
          <Link
            href="/trainee/recommendations"
            className={buttonVariants({ size: "sm" })}
          >
            View Recommended Learning
          </Link>
        }
      />
      {!data?.length ? (
        <Alert>
          <AlertTitle>No competency data available</AlertTitle>
          <AlertDescription>
            Your competency profile and development targets will appear here
            when available.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {data.map((item, index) => {
            const competency = Array.isArray(item.competencies)
              ? item.competencies[0]
              : item.competencies;
            const current = Number(item.current_score);
            const target = Number(item.target_score);
            const gap = Math.max(target - current, 0);
            return (
              <Card key={`${competency?.name ?? "competency"}-${index}`}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>{competency?.name ?? "Competency"}</CardTitle>
                      <CardDescription>
                        {competency?.category ?? "Uncategorized"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <Metric label="Current" value={current} />
                    <Metric label="Target" value={target} />
                    <Metric label="Gap" value={gap} />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Current level</span>
                      <span>{current}% of scale</span>
                    </div>
                    <Progress value={Math.min(Math.max(current, 0), 100)} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold tabular-nums">{value.toFixed(1)}</p>
    </div>
  );
}
