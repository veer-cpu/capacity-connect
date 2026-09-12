import Link from "next/link";

import { JobRoleCompetencyForm } from "@/components/admin/organization/job-role-competency-form";
import { JobRoleForm } from "@/components/admin/organization/job-role-form";
import { OrganizationalUnitForm } from "@/components/admin/organization/organizational-unit-form";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getActiveCompetencyOptions,
  getJobRoleCompetencies,
  getJobRoles,
  getOrganizationalUnits,
} from "@/lib/admin/get-organization";
import { requireRole } from "@/lib/auth/require-role";

import { removeJobRoleCompetency } from "./actions";

type AdminOrganizationPageProps = {
  searchParams: Promise<{ jobRoleId?: string }>;
};

function formatImportance(importance: string) {
  return importance.charAt(0).toUpperCase() + importance.slice(1);
}

export default async function AdminOrganizationPage({
  searchParams,
}: AdminOrganizationPageProps) {
  await requireRole("admin");

  const params = await searchParams;
  const [units, roles, competencyOptions] = await Promise.all([
    getOrganizationalUnits(),
    getJobRoles(),
    getActiveCompetencyOptions(),
  ]);

  const selectedRole =
    roles.find((role) => role.id === params.jobRoleId) ?? roles[0] ?? null;

  const requirements = selectedRole
    ? await getJobRoleCompetencies(selectedRole.id)
    : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Organization & Role Competencies"
        description="Define organizational units, job roles, and the competency requirements that drive training need analysis targets."
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
        <AlertTitle>How this feeds training need analysis</AlertTitle>
        <AlertDescription>
          Each job role&apos;s required competency scores define the targets
          used to measure gaps, prioritize training, and generate development
          plans.
        </AlertDescription>
      </Alert>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Organizational Units</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Maintain the organizational hierarchy used to group job roles.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Organizational Unit</CardTitle>
            <CardDescription>
              Add a new department, division, or team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrganizationalUnitForm units={units} />
          </CardContent>
        </Card>

        {units.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No organizational units have been created yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {units.map((unit) => (
              <Card key={`${unit.id}-${unit.updatedAt}`}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>{unit.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {unit.code ?? "No code"}
                        {unit.parentUnitName
                          ? ` · Reports to ${unit.parentUnitName}`
                          : ""}
                      </CardDescription>
                    </div>
                    <StatusBadge
                      status={unit.isActive ? "Active" : "Inactive"}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {unit.description ?? "No description provided."}
                  </p>
                  <Separator />
                  <OrganizationalUnitForm unit={unit} units={units} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Job Roles</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Define job roles within organizational units.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Job Role</CardTitle>
            <CardDescription>
              Add a role that trainees and trainers can be assigned to.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobRoleForm units={units} />
          </CardContent>
        </Card>

        {roles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No job roles have been created yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {roles.map((role) => (
              <Card key={`${role.id}-${role.updatedAt}`}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>{role.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {role.code ?? "No code"} ·{" "}
                        {role.organizationalUnitName ?? "Unassigned"}
                      </CardDescription>
                    </div>
                    <StatusBadge
                      status={role.isActive ? "Active" : "Inactive"}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {role.description ?? "No description provided."}
                  </p>
                  <Separator />
                  <JobRoleForm role={role} units={units} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Required Competencies</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set target competency scores per job role to drive gap analysis and
            training need identification.
          </p>
        </div>

        {roles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Create a job role first to configure its required competencies.
            </CardContent>
          </Card>
        ) : (
          <>
            <Tabs value={selectedRole?.id}>
              <TabsList className="h-auto w-full flex-wrap justify-start sm:w-fit">
                {roles.map((role) => (
                  <TabsTrigger
                    key={role.id}
                    value={role.id}
                    nativeButton={false}
                    render={
                      <Link href={`/admin/organization?jobRoleId=${role.id}`} />
                    }
                  >
                    {role.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {selectedRole && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedRole.name}</CardTitle>
                  <CardDescription>
                    {selectedRole.organizationalUnitName ?? "Unassigned unit"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {requirements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No competency requirements defined for this role yet.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Competency</TableHead>
                          <TableHead>Required Score</TableHead>
                          <TableHead>Importance</TableHead>
                          <TableHead>Rationale</TableHead>
                          <TableHead>Remove</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requirements.map((requirement) => (
                          <TableRow key={requirement.id} className="align-top">
                            <TableCell className="font-medium">
                              {requirement.competencyName}
                            </TableCell>
                            <TableCell>
                              {requirement.requiredScore.toFixed(0)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {formatImportance(requirement.importance)}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                              {requirement.rationale ?? "—"}
                            </TableCell>
                            <TableCell>
                              <form action={removeJobRoleCompetency}>
                                <input
                                  type="hidden"
                                  name="jobRoleId"
                                  value={requirement.jobRoleId}
                                />
                                <input
                                  type="hidden"
                                  name="competencyId"
                                  value={requirement.competencyId}
                                />
                                <Button
                                  type="submit"
                                  size="sm"
                                  variant="destructive"
                                >
                                  Remove
                                </Button>
                              </form>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold">
                      Add / Update Requirement
                    </h3>
                    {competencyOptions.length === 0 ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        No active competencies available. Activate competencies
                        before assigning role requirements.
                      </p>
                    ) : (
                      <div className="mt-3">
                        <JobRoleCompetencyForm
                          jobRoleId={selectedRole.id}
                          competencies={competencyOptions}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </section>
    </div>
  );
}
