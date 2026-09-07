import Link from "next/link";

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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import {
  getAdminCompetencies,
  type AdminCompetency,
} from "@/lib/admin/get-competencies";
import { requireRole } from "@/lib/auth/require-role";
import {
  createCompetency,
  setCompetencyActive,
  updateCompetency,
} from "./actions";

export default async function AdminCompetenciesPage() {
  await requireRole("admin");
  const competencies = await getAdminCompetencies();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Competency Management"
        description="Configure the competency framework used for assessment, gap analysis, recommendations, and development planning."
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
        <AlertTitle>Competency workflow status</AlertTitle>
        <AlertDescription>
          Inactive competencies are retained for historical records but excluded
          from new active workflows.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Create Competency</CardTitle>
          <CardDescription>
            Add a competency to the organization&apos;s shared capability
            framework.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCompetency} className="grid gap-5 md:grid-cols-2">
            <Field label="Name" name="name" required maxLength={120} />
            <Field label="Category" name="category" maxLength={120} />
            <label className="space-y-1.5 text-sm md:col-span-2">
              <span className="block font-medium">Description</span>
              <Textarea name="description" maxLength={1000} rows={3} />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="block font-medium">Default Target Score</span>
              <Input
                type="number"
                name="defaultTargetScore"
                min={0}
                max={100}
                step="any"
                required
              />
            </label>
            <div className="flex items-end">
              <Button type="submit">Create Competency</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Existing Competencies</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review framework usage and maintain active competency definitions.
          </p>
        </div>

        {competencies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No competencies have been created yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {competencies.map((competency) => (
              <CompetencyCard key={competency.id} competency={competency} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CompetencyCard({ competency }: { competency: AdminCompetency }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{competency.name}</CardTitle>
            <CardDescription className="mt-1">
              {competency.category ?? "Uncategorized"}
            </CardDescription>
          </div>
          <StatusBadge status={competency.isActive ? "Active" : "Inactive"} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">
          {competency.description ?? "No description provided."}
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <UsageStat
            label="Target Score"
            value={competency.defaultTargetScore.toFixed(0)}
          />
          <UsageStat
            label="Mapped Courses"
            value={competency.mappedCourseCount}
          />
          <UsageStat label="Learners" value={competency.traineeCount} />
          <UsageStat
            label="Verified Trainers"
            value={competency.verifiedTrainerCount}
          />
        </div>

        <Separator />

        <form action={updateCompetency} className="space-y-4">
          <input type="hidden" name="competencyId" value={competency.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Name"
              name="name"
              defaultValue={competency.name}
              required
              maxLength={120}
            />
            <Field
              label="Category"
              name="category"
              defaultValue={competency.category ?? ""}
              maxLength={120}
            />
          </div>
          <label className="space-y-1.5 text-sm">
            <span className="block font-medium">Description</span>
            <Textarea
              name="description"
              defaultValue={competency.description ?? ""}
              maxLength={1000}
              rows={3}
            />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="block font-medium">Default Target Score</span>
            <Input
              type="number"
              name="defaultTargetScore"
              min={0}
              max={100}
              step="any"
              defaultValue={competency.defaultTargetScore}
              required
            />
          </label>
          <Button type="submit" variant="outline">
            Save Changes
          </Button>
        </form>

        <form action={setCompetencyActive}>
          <input type="hidden" name="competencyId" value={competency.id} />
          <input
            type="hidden"
            name="isActive"
            value={String(!competency.isActive)}
          />
          <Button
            type="submit"
            variant={competency.isActive ? "destructive" : "secondary"}
          >
            {competency.isActive ? "Deactivate" : "Activate"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required = false,
  maxLength,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="space-y-1.5 text-sm">
      <span className="block font-medium">{label}</span>
      <Input
        name={name}
        defaultValue={defaultValue}
        required={required}
        maxLength={maxLength}
      />
    </label>
  );
}

function UsageStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold tabular-nums">{value}</p>
    </div>
  );
}
