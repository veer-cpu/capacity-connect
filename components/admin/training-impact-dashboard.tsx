"use client";

import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  GraduationCap,
  Target,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TrainingImpactRow } from "@/lib/admin/get-training-impact";

type TrainingImpactDashboardProps = {
  rows: TrainingImpactRow[];
};

function hasPairedEvidence(row: TrainingImpactRow): boolean {
  return (
    row.postTrainingSample > 0 &&
    row.averageBeforeScore !== null &&
    row.averageAfterScore !== null &&
    row.averageImprovement !== null
  );
}

function weightedAverage(
  rows: TrainingImpactRow[],
  getValue: (row: TrainingImpactRow) => number | null,
  getWeight: (row: TrainingImpactRow) => number,
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const row of rows) {
    const value = getValue(row);
    const weight = getWeight(row);
    if (value === null || weight <= 0) continue;
    weightedSum += value * weight;
    totalWeight += weight;
  }

  return totalWeight === 0 ? 0 : weightedSum / totalWeight;
}

function truncateTitle(title: string): string {
  return title.length > 18 ? `${title.slice(0, 17)}…` : title;
}

export function TrainingImpactDashboard({
  rows,
}: TrainingImpactDashboardProps) {
  const measurableRows = rows.filter(hasPairedEvidence);

  const completedTrainees = rows.reduce(
    (total, row) => total + row.completedTrainees,
    0,
  );

  const averageImprovement = weightedAverage(
    measurableRows,
    (row) => row.averageImprovement,
    (row) => row.postTrainingSample,
  );

  const improvementRate = weightedAverage(
    measurableRows,
    (row) => row.improvementRate,
    (row) => row.postTrainingSample,
  );

  const targetAttainmentRate = weightedAverage(
    measurableRows,
    (row) => row.targetAttainmentRate,
    (row) => row.postTrainingSample,
  );

  const coursesWithMeasurableImpact = rows.filter(
    (row) => row.postTrainingSample > 0,
  ).length;

  const chartData = measurableRows.map((row) => ({
    courseTitle: truncateTitle(row.courseTitle),
    averageBeforeScore: row.averageBeforeScore ?? 0,
    averageAfterScore: row.averageAfterScore ?? 0,
    averageImprovement: row.averageImprovement ?? 0,
    targetAttainmentRate: row.targetAttainmentRate,
  }));

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Completed Trainees"
          value={String(completedTrainees)}
          icon={Users}
        />
        <MetricCard
          title="Average Competency Improvement"
          value={`${formatSigned(averageImprovement)} pts`}
          icon={ArrowUpRight}
        />
        <MetricCard
          title="Improvement Rate"
          value={`${improvementRate.toFixed(0)}%`}
          icon={GraduationCap}
        />
        <MetricCard
          title="Target Attainment Rate"
          value={`${targetAttainmentRate.toFixed(0)}%`}
          icon={Target}
        />
        <MetricCard
          title="Courses With Measurable Impact"
          value={`${coursesWithMeasurableImpact}/${rows.length}`}
          icon={CheckCircle2}
        />
      </section>

      <Alert>
        <AlertCircle />
        <AlertTitle>Completion is not the same as impact</AlertTitle>
        <AlertDescription>
          Training completion measures participation. Training impact measures
          demonstrated competency change. A completed course is not
          automatically considered effective.
        </AlertDescription>
      </Alert>

      {chartData.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No paired before/after competency measurements are available yet.
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Before vs After Competency</CardTitle>
              <CardDescription>
                Average measured competency score before and after training.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ bottom: 40 }}>
                  <CartesianGrid vertical={false} strokeOpacity={0.3} />
                  <XAxis
                    dataKey="courseTitle"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={60}
                    fontSize={12}
                  />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="averageBeforeScore"
                    name="Before"
                    fill="var(--chart-1)"
                    radius={4}
                  />
                  <Bar
                    dataKey="averageAfterScore"
                    name="After"
                    fill="var(--chart-2)"
                    radius={4}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Competency Improvement</CardTitle>
              <CardDescription>
                Mean point change in competency score after training.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ bottom: 40 }}>
                  <CartesianGrid vertical={false} strokeOpacity={0.3} />
                  <XAxis
                    dataKey="courseTitle"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={60}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar
                    dataKey="averageImprovement"
                    name="Improvement"
                    fill="var(--chart-3)"
                    radius={4}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Target Attainment Rate</CardTitle>
              <CardDescription>
                Share of measured trainees who reached their competency target
                after training.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ bottom: 40 }}>
                  <CartesianGrid vertical={false} strokeOpacity={0.3} />
                  <XAxis
                    dataKey="courseTitle"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={60}
                    fontSize={12}
                  />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip />
                  <Bar
                    dataKey="targetAttainmentRate"
                    name="Target Attainment %"
                    fill="var(--chart-4)"
                    radius={4}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Course Impact Register</CardTitle>
          <CardDescription>
            {rows.length} course{rows.length === 1 ? "" : "s"} with completed
            training records.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No completed training records yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Measured Sample</TableHead>
                    <TableHead>Before</TableHead>
                    <TableHead>After</TableHead>
                    <TableHead>Improvement</TableHead>
                    <TableHead>Improvement Rate</TableHead>
                    <TableHead>Target Attainment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const evidence = hasPairedEvidence(row);
                    return (
                      <TableRow key={row.courseId}>
                        <TableCell className="font-medium">
                          {row.courseTitle}
                        </TableCell>
                        <TableCell>{row.trainerName}</TableCell>
                        <TableCell>{row.completedTrainees}</TableCell>
                        <TableCell>{row.postTrainingSample}</TableCell>
                        {evidence ? (
                          <>
                            <TableCell>
                              {row.averageBeforeScore?.toFixed(1)}
                            </TableCell>
                            <TableCell>
                              {row.averageAfterScore?.toFixed(1)}
                            </TableCell>
                            <TableCell>
                              {formatSigned(row.averageImprovement ?? 0)}
                            </TableCell>
                            <TableCell>
                              {row.improvementRate.toFixed(0)}%
                            </TableCell>
                            <TableCell>
                              {row.targetAttainmentRate.toFixed(0)}%
                            </TableCell>
                          </>
                        ) : (
                          <TableCell colSpan={5}>
                            <Badge variant="outline">
                              Insufficient evidence
                            </Badge>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatSigned(value: number) {
  return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
}

function MetricCard({
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
