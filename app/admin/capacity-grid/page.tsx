import {
  AlertTriangle,
  Building2,
  Gauge,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAdminCapacityGrid,
  type CapacityGridRow,
  type CapacityPriority,
} from "@/lib/admin/get-capacity-grid";
import { requireRole } from "@/lib/auth/require-role";

type CapacityGridPageProps = {
  searchParams: Promise<{
    department?: string;
  }>;
};

export default async function CapacityGridPage({
  searchParams,
}: CapacityGridPageProps) {
  await requireRole("admin");

  const params = await searchParams;
  const rows = await getAdminCapacityGrid();

  const departments = Array.from(
    new Set(rows.map((row) => row.department)),
  ).sort();

  const selectedDepartment =
    params.department &&
    departments.includes(params.department)
      ? params.department
      : null;

  const filteredRows = selectedDepartment
    ? rows.filter(
        (row) => row.department === selectedDepartment,
      )
    : rows;

  const employees = buildEmployeeRows(filteredRows);
  const competencies = buildCompetencies(filteredRows);

  const totalEmployees = new Set(
    filteredRows.map((row) => row.traineeId),
  ).size;

  const assessedCells = filteredRows.filter(
    (row) => row.currentScore !== null,
  );

  const assessmentCoverage =
    filteredRows.length === 0
      ? 0
      : Math.round(
          (assessedCells.length / filteredRows.length) * 100,
        );

  const criticalGaps = assessedCells.filter(
    (row) => row.priority === "critical",
  ).length;

  const targetAttainment =
    assessedCells.length === 0
      ? 0
      : Math.round(
          (assessedCells.filter(
            (row) => row.gapScore === 0,
          ).length /
            assessedCells.length) *
            100,
        );

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Organizational Capacity Intelligence
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Capacity Grid
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Employee-level competency readiness across active
          MoES/IMD capability areas.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Employees"
          value={String(totalEmployees)}
          icon={Users}
        />

        <MetricCard
          title="Assessment Coverage"
          value={`${assessmentCoverage}%`}
          icon={Gauge}
        />

        <MetricCard
          title="Target Attainment"
          value={`${targetAttainment}%`}
          icon={Target}
        />

        <MetricCard
          title="Critical Gaps"
          value={String(criticalGaps)}
          icon={AlertTriangle}
        />
      </section>

      <DepartmentFilters
        departments={departments}
        selectedDepartment={selectedDepartment}
      />

      {employees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No organizational competency records are
            available for this selection.
          </CardContent>
        </Card>
      ) : (
        <CapacityMatrix
          employees={employees}
          competencies={competencies}
        />
      )}
    </main>
  );
}
type EmployeeMatrixRow = {
  traineeId: string;
  traineeName: string;
  employeeCode: string | null;
  designation: string | null;
  department: string;
  competencies: Map<string, CapacityGridRow>;
};

function buildEmployeeRows(
  rows: CapacityGridRow[],
): EmployeeMatrixRow[] {
  const employees = new Map<
    string,
    EmployeeMatrixRow
  >();

  for (const row of rows) {
    let employee = employees.get(row.traineeId);

    if (!employee) {
      employee = {
        traineeId: row.traineeId,
        traineeName: row.traineeName,
        employeeCode: row.employeeCode,
        designation: row.designation,
        department: row.department,
        competencies: new Map(),
      };

      employees.set(row.traineeId, employee);
    }

    employee.competencies.set(
      row.competencyId,
      row,
    );
  }

  return Array.from(employees.values()).sort(
    (left, right) =>
      left.traineeName.localeCompare(
        right.traineeName,
      ),
  );
}

function buildCompetencies(rows: CapacityGridRow[]) {
  const competencyMap = new Map<
    string,
    {
      id: string;
      name: string;
      category: string | null;
    }
  >();

  for (const row of rows) {
    competencyMap.set(row.competencyId, {
      id: row.competencyId,
      name: row.competencyName,
      category: row.competencyCategory,
    });
  }

  return Array.from(
    competencyMap.values(),
  ).sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}
function CapacityMatrix({
  employees,
  competencies,
}: {
  employees: EmployeeMatrixRow[];
  competencies: {
    id: string;
    name: string;
    category: string | null;
  }[];
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>
          Employee × Competency Matrix
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-max border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="sticky left-0 z-20 min-w-64 bg-muted px-4 py-3 text-left font-medium">
                  Employee
                </th>

                {competencies.map((competency) => (
                  <th
                    key={competency.id}
                    className="min-w-40 border-l px-3 py-3 text-left align-bottom font-medium"
                  >
                    <div>{competency.name}</div>

                    {competency.category && (
                      <div className="mt-1 text-xs font-normal text-muted-foreground">
                        {competency.category}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr
                  key={employee.traineeId}
                  className="border-b last:border-b-0"
                >
                  <td className="sticky left-0 z-10 bg-background px-4 py-4 align-top">
                    <div className="font-medium">
                      {employee.traineeName}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      {employee.designation ??
                        "Designation not specified"}
                    </div>

                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="size-3" />
                      {employee.department}
                    </div>

                    {employee.employeeCode && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        ID: {employee.employeeCode}
                      </div>
                    )}
                  </td>

                  {competencies.map(
                    (competency) => {
                      const cell =
                        employee.competencies.get(
                          competency.id,
                        );

                      return (
                        <td
                          key={competency.id}
                          className="border-l px-3 py-3 align-top"
                        >
                          <CapacityCell row={cell} />
                        </td>
                      );
                    },
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
function CapacityCell({
  row,
}: {
  row: CapacityGridRow | undefined;
}) {
  if (!row || row.currentScore === null) {
    return (
      <div className="space-y-2">
        <Badge variant="outline">
          Not assessed
        </Badge>

        <p className="text-xs text-muted-foreground">
          Baseline required
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-semibold">
          {row.currentScore.toFixed(0)}
        </span>

        <span className="text-xs text-muted-foreground">
          / {row.targetScore.toFixed(0)}
        </span>
      </div>

      <PriorityBadge
        priority={row.priority}
      />

      <p className="text-xs text-muted-foreground">
        Gap {row.gapScore.toFixed(0)}
      </p>
    </div>
  );
}
function PriorityBadge({
  priority,
}: {
  priority: CapacityPriority;
}) {
  const labelMap: Record<
    CapacityPriority,
    string
  > = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  if (priority === "low") {
    return (
      <Badge variant="secondary">
        {labelMap[priority]}
      </Badge>
    );
  }

  if (priority === "medium") {
    return (
      <Badge variant="outline">
        {labelMap[priority]}
      </Badge>
    );
  }

  return (
    <Badge variant="destructive">
      {labelMap[priority]}
    </Badge>
  );
}
function MetricCard({
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
function DepartmentFilters({
  departments,
  selectedDepartment,
}: {
  departments: string[];
  selectedDepartment: string | null;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={
          selectedDepartment === null
            ? "default"
            : "outline"
        }
        render={
          <Link href="/admin/capacity-grid" />
        }
      >
        All departments
      </Badge>

      {departments.map((department) => (
        <Badge
          key={department}
          variant={
            selectedDepartment === department
              ? "default"
              : "outline"
          }
          render={
            <Link
              href={`/admin/capacity-grid?department=${encodeURIComponent(
                department,
              )}`}
            />
          }
        >
          {department}
        </Badge>
      ))}
    </div>
  );
}