"use client";

import {
  AlertCircle,
  AlertTriangle,
  Gauge,
  ListChecks,
  Target,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  CapacityGridRow,
  CapacityImportance,
  CapacityPriority,
} from "@/lib/admin/get-capacity-grid";

const ALL = "all";
const UNASSIGNED = "unassigned";

const PRIORITY_ORDER: Record<CapacityPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const PRIORITY_LABELS: Record<CapacityPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const PRIORITY_CELL_CLASS: Record<CapacityPriority, string> = {
  critical: "bg-destructive/15",
  high: "bg-orange-500/15",
  medium: "bg-amber-500/15",
  low: "bg-emerald-500/15",
};

const IMPORTANCE_LABELS: Record<CapacityImportance, string> = {
  core: "Core",
  important: "Important",
  supporting: "Supporting",
};

type OptionItem = { value: string; label: string };

type CapacityGridDashboardProps = {
  rows: CapacityGridRow[];
};

export function CapacityGridDashboard({ rows }: CapacityGridDashboardProps) {
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState(ALL);
  const [roleFilter, setRoleFilter] = useState(ALL);
  const [competencyFilter, setCompetencyFilter] = useState(ALL);
  const [importanceFilter, setImportanceFilter] = useState(ALL);
  const [priorityFilter, setPriorityFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);

  const unitOptions = useMemo(
    () =>
      buildOptions(
        rows,
        (row) => row.organizationalUnitId,
        (row) => row.organizationalUnitName,
      ),
    [rows],
  );
  const roleOptions = useMemo(
    () =>
      buildOptions(
        rows,
        (row) => row.jobRoleId,
        (row) => row.jobRoleName,
      ),
    [rows],
  );
  const competencyOptions = useMemo(
    () =>
      buildOptions(
        rows,
        (row) => row.competencyId,
        (row) => row.competencyName,
      ),
    [rows],
  );
  const importanceOptions = useMemo(
    () =>
      uniqueValues(rows.map((row) => row.importance)).map((value) => ({
        value,
        label: IMPORTANCE_LABELS[value],
      })),
    [rows],
  );
  const priorityOptions = useMemo(
    () =>
      uniqueValues(rows.map((row) => row.priority)).map((value) => ({
        value,
        label: PRIORITY_LABELS[value],
      })),
    [rows],
  );
  const statusOptions = useMemo(
    () =>
      uniqueValues(rows.map((row) => row.gapStatus)).map((value) => ({
        value,
        label: formatGapStatus(value),
      })),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return rows.filter((row) => {
      if (
        unitFilter !== ALL &&
        !matchesOption(unitFilter, row.organizationalUnitId)
      ) {
        return false;
      }
      if (roleFilter !== ALL && !matchesOption(roleFilter, row.jobRoleId)) {
        return false;
      }
      if (competencyFilter !== ALL && row.competencyId !== competencyFilter) {
        return false;
      }
      if (importanceFilter !== ALL && row.importance !== importanceFilter) {
        return false;
      }
      if (priorityFilter !== ALL && row.priority !== priorityFilter) {
        return false;
      }
      if (statusFilter !== ALL && row.gapStatus !== statusFilter) {
        return false;
      }
      if (searchTerm) {
        const haystack =
          `${row.traineeName} ${row.employeeCode ?? ""}`.toLowerCase();
        if (!haystack.includes(searchTerm)) {
          return false;
        }
      }
      return true;
    });
  }, [
    rows,
    unitFilter,
    roleFilter,
    competencyFilter,
    importanceFilter,
    priorityFilter,
    statusFilter,
    search,
  ]);

  const kpis = useMemo(() => computeKpis(filteredRows), [filteredRows]);

  const sortedRows = useMemo(
    () =>
      [...filteredRows].sort((left, right) => {
        const priorityDiff =
          PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority];
        if (priorityDiff !== 0) return priorityDiff;
        if (right.gapScore !== left.gapScore)
          return right.gapScore - left.gapScore;
        return left.traineeName.localeCompare(right.traineeName);
      }),
    [filteredRows],
  );

  const matrix = useMemo(() => buildMatrix(filteredRows), [filteredRows]);

  function resetFilters() {
    setSearch("");
    setUnitFilter(ALL);
    setRoleFilter(ALL);
    setCompetencyFilter(ALL);
    setImportanceFilter(ALL);
    setPriorityFilter(ALL);
    setStatusFilter(ALL);
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Total Required Competencies"
          value={String(kpis.total)}
          icon={ListChecks}
        />
        <MetricCard
          title="Target Attainment"
          value={`${kpis.targetAttainmentPct.toFixed(0)}%`}
          icon={Target}
        />
        <MetricCard
          title="Critical Gaps"
          value={String(kpis.criticalGaps)}
          icon={AlertTriangle}
        />
        <MetricCard
          title="High Gaps"
          value={String(kpis.highGaps)}
          icon={AlertCircle}
        />
        <MetricCard
          title="Average Gap"
          value={kpis.averageGap.toFixed(1)}
          icon={Gauge}
        />
        <MetricCard
          title="Organizational Readiness"
          value={`${kpis.organizationalReadinessPct.toFixed(0)}%`}
          icon={TrendingUp}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Narrow the grid down to a unit, role, competency, or gap condition.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">
              Search Employee
            </label>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name or employee code"
            />
          </div>
          <FilterSelect
            label="Organizational Unit"
            value={unitFilter}
            onChange={setUnitFilter}
            options={unitOptions}
          />
          <FilterSelect
            label="Job Role"
            value={roleFilter}
            onChange={setRoleFilter}
            options={roleOptions}
          />
          <FilterSelect
            label="Competency"
            value={competencyFilter}
            onChange={setCompetencyFilter}
            options={competencyOptions}
          />
          <FilterSelect
            label="Importance"
            value={importanceFilter}
            onChange={setImportanceFilter}
            options={importanceOptions}
          />
          <FilterSelect
            label="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={priorityOptions}
          />
          <FilterSelect
            label="Gap Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Reset filters
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training Need Register</CardTitle>
          <CardDescription>
            {sortedRows.length} of {rows.length} competency requirements shown.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {sortedRows.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No records match the selected filters.
            </div>
          ) : (
            <div className="max-h-[560px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-muted/90 backdrop-blur">
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employee Code</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Job Role</TableHead>
                    <TableHead>Competency</TableHead>
                    <TableHead>Importance</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Gap</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRows.map((row) => (
                    <TableRow key={`${row.traineeId}-${row.competencyId}`}>
                      <TableCell className="font-medium">
                        {row.traineeName}
                      </TableCell>
                      <TableCell>{row.employeeCode ?? "—"}</TableCell>
                      <TableCell>
                        {row.organizationalUnitName ?? "Unassigned"}
                      </TableCell>
                      <TableCell>{row.jobRoleName ?? "Unassigned"}</TableCell>
                      <TableCell>{row.competencyName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {IMPORTANCE_LABELS[row.importance]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {row.currentScore === null
                          ? "—"
                          : row.currentScore.toFixed(0)}
                      </TableCell>
                      <TableCell>{row.targetScore.toFixed(0)}</TableCell>
                      <TableCell>{row.gapScore.toFixed(0)}</TableCell>
                      <TableCell>
                        <PriorityBadge priority={row.priority} />
                      </TableCell>
                      <TableCell>{formatGapStatus(row.gapStatus)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Employee × Competency Matrix</CardTitle>
          <CardDescription>
            Current score versus required score for each employee across
            filtered competencies.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {matrix.employees.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No records match the selected filters.
            </div>
          ) : (
            <div className="max-h-[560px] overflow-auto">
              <table className="min-w-max border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="sticky left-0 top-0 z-20 min-w-64 bg-muted px-4 py-3 text-left font-medium">
                      Employee
                    </th>
                    {matrix.competencies.map((competency) => (
                      <th
                        key={competency.id}
                        className="sticky top-0 z-10 min-w-36 border-l bg-muted/95 px-3 py-3 text-left align-bottom font-medium"
                      >
                        {competency.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.employees.map((employee) => (
                    <tr
                      key={employee.traineeId}
                      className="border-b last:border-b-0"
                    >
                      <td className="sticky left-0 z-10 bg-background px-4 py-3 align-top">
                        <div className="font-medium">
                          {employee.traineeName}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {employee.jobRoleName ?? "Unassigned role"}
                        </div>
                      </td>
                      {matrix.competencies.map((competency) => (
                        <td
                          key={competency.id}
                          className="border-l p-0 align-top"
                        >
                          <MatrixCell
                            row={employee.competencies.get(competency.id)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function buildOptions(
  rows: CapacityGridRow[],
  getId: (row: CapacityGridRow) => string | null,
  getName: (row: CapacityGridRow) => string | null,
): OptionItem[] {
  const nameById = new Map<string, string>();
  let hasUnassigned = false;

  for (const row of rows) {
    const id = getId(row);
    if (id === null) {
      hasUnassigned = true;
      continue;
    }
    nameById.set(id, getName(row) ?? id);
  }

  const options = Array.from(nameById.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((left, right) => left.label.localeCompare(right.label));

  if (hasUnassigned) {
    options.push({ value: UNASSIGNED, label: "Unassigned" });
  }

  return options;
}

function matchesOption(filterValue: string, rowId: string | null): boolean {
  if (filterValue === UNASSIGNED) return rowId === null;
  return rowId === filterValue;
}

function uniqueValues<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function formatGapStatus(status: string): string {
  return status
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

type CapacityKpis = {
  total: number;
  targetAttainmentPct: number;
  criticalGaps: number;
  highGaps: number;
  averageGap: number;
  organizationalReadinessPct: number;
};

function computeKpis(rows: CapacityGridRow[]): CapacityKpis {
  const total = rows.length;

  if (total === 0) {
    return {
      total: 0,
      targetAttainmentPct: 0,
      criticalGaps: 0,
      highGaps: 0,
      averageGap: 0,
      organizationalReadinessPct: 0,
    };
  }

  const targetAttainmentPct =
    (rows.filter((row) => row.gapScore === 0).length / total) * 100;

  const criticalGaps = rows.filter((row) => row.priority === "critical").length;
  const highGaps = rows.filter((row) => row.priority === "high").length;

  const averageGap = rows.reduce((sum, row) => sum + row.gapScore, 0) / total;

  const readinessRows = rows.filter((row) => row.targetScore > 0);
  const organizationalReadinessPct =
    readinessRows.length === 0
      ? 0
      : (readinessRows.reduce(
          (sum, row) =>
            sum + Math.min((row.currentScore ?? 0) / row.targetScore, 1),
          0,
        ) /
          readinessRows.length) *
        100;

  return {
    total,
    targetAttainmentPct,
    criticalGaps,
    highGaps,
    averageGap,
    organizationalReadinessPct,
  };
}

type MatrixEmployee = {
  traineeId: string;
  traineeName: string;
  jobRoleName: string | null;
  competencies: Map<string, CapacityGridRow>;
};

function buildMatrix(rows: CapacityGridRow[]): {
  employees: MatrixEmployee[];
  competencies: { id: string; name: string }[];
} {
  const employees = new Map<string, MatrixEmployee>();
  const competencies = new Map<string, { id: string; name: string }>();

  for (const row of rows) {
    let employee = employees.get(row.traineeId);
    if (!employee) {
      employee = {
        traineeId: row.traineeId,
        traineeName: row.traineeName,
        jobRoleName: row.jobRoleName,
        competencies: new Map(),
      };
      employees.set(row.traineeId, employee);
    }
    employee.competencies.set(row.competencyId, row);
    competencies.set(row.competencyId, {
      id: row.competencyId,
      name: row.competencyName,
    });
  }

  return {
    employees: Array.from(employees.values()).sort((left, right) =>
      left.traineeName.localeCompare(right.traineeName),
    ),
    competencies: Array.from(competencies.values()).sort((left, right) =>
      left.name.localeCompare(right.name),
    ),
  };
}

function MatrixCell({ row }: { row: CapacityGridRow | undefined }) {
  if (!row) {
    return <div className="px-3 py-3 text-xs text-muted-foreground">—</div>;
  }

  if (row.currentScore === null) {
    return (
      <div className="px-3 py-3">
        <Badge variant="outline">Not assessed</Badge>
      </div>
    );
  }

  return (
    <div className={`px-3 py-3 ${PRIORITY_CELL_CLASS[row.priority]}`}>
      <div className="flex items-baseline gap-1">
        <span className="font-semibold">{row.currentScore.toFixed(0)}</span>
        <span className="text-xs text-muted-foreground">
          / {row.targetScore.toFixed(0)}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Gap {row.gapScore.toFixed(0)}
      </p>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: CapacityPriority }) {
  if (priority === "low") {
    return <Badge variant="secondary">{PRIORITY_LABELS[priority]}</Badge>;
  }
  if (priority === "medium") {
    return <Badge variant="outline">{PRIORITY_LABELS[priority]}</Badge>;
  }
  return <Badge variant="destructive">{PRIORITY_LABELS[priority]}</Badge>;
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: OptionItem[];
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Select value={value} onValueChange={(next) => onChange(next ?? ALL)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof Target;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
        </div>
        <Icon className="size-5 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}
