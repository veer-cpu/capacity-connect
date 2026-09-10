import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireRole } from "@/lib/auth/require-role";
import { getTrainerKnowledgeResources } from "@/lib/knowledge-hub/get-trainer-resources";
import {
  KNOWLEDGE_RESOURCE_TYPE_LABELS,
} from "@/lib/knowledge-hub/constants"

import {
  getActiveCompetencyOptions,
  getTrainerCourseOptions,
} from "@/lib/knowledge-hub/server"

import { EditResourceDialog } from "./edit-resource-dialog";
import { DeleteResourceButton } from "./delete-resource-button";
import { SubmitResourceDialog } from "./submit-resource-dialog";

const STATUS_TABS = [
  { value: "all", label: "All My Resources" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" },
] as const;

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

const EMPTY_STATE_MESSAGES: Record<string, string> = {
  all: "You have not submitted any knowledge resources yet.",
  pending: "No resources are awaiting review.",
  approved: "No approved resources yet.",
  rejected: "No rejected resources.",
  archived: "No archived resources.",
};

export default async function TrainerKnowledgeHubPage({
  searchParams,
}: PageProps) {
  const { user } = await requireRole("trainer");
  const params = await searchParams;
  const status = STATUS_TABS.some((tab) => tab.value === params.status)
    ? params.status!
    : "all";

  const [resources, competencies, courses] = await Promise.all([
    getTrainerKnowledgeResources(status),
    getActiveCompetencyOptions(),
    getTrainerCourseOptions(user.id),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Knowledge Hub"
        description="Submit operational guidance, SOPs, case studies, and other knowledge resources for admin review."
        actions={
          <SubmitResourceDialog competencies={competencies} courses={courses} />
        }
      />

      <Tabs value={status}>
        <TabsList className="w-full flex-wrap sm:w-fit">
          
          {STATUS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              nativeButton={false}
              render={
                <Link
                  href={
                    tab.value === "all"
                      ? "/trainer/knowledge-hub"
                      : `/trainer/knowledge-hub?status=${tab.value}`
                  }
                />
              }
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {resources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {EMPTY_STATE_MESSAGES[status]}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.id} className="flex flex-col">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={resource.status} />
                  <Badge variant="outline">
                    {KNOWLEDGE_RESOURCE_TYPE_LABELS[resource.resourceType]}
                  </Badge>
                  {resource.category && (
                    <Badge variant="secondary">{resource.category}</Badge>
                  )}
                </div>
                <CardTitle className="text-base">{resource.title}</CardTitle>
                {resource.description && (
                  <CardDescription className="line-clamp-3">
                    {resource.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                <dl className="space-y-1 text-xs text-muted-foreground">
                  {resource.competencyName && (
                    <div>
                      <dt className="inline font-medium">Competency: </dt>
                      <dd className="inline">{resource.competencyName}</dd>
                    </div>
                  )}
                  {resource.courseTitle && (
                    <div>
                      <dt className="inline font-medium">Course: </dt>
                      <dd className="inline">{resource.courseTitle}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="inline font-medium">Submitted: </dt>
                    <dd className="inline">
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>

                {resource.status === "rejected" && resource.reviewReason && (
                  <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                    Rejection reason: {resource.reviewReason}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/knowledge-hub/${resource.id}`}
                    className={buttonVariants({
                      size: "sm",
                      variant: "outline",
                    })}
                  >
                    View
                  </Link>
                  {(resource.status === "pending" ||
                    resource.status === "rejected") && (
                    <>
                      <EditResourceDialog
                        resource={resource}
                        competencies={competencies}
                        courses={courses}
                      />
                      <DeleteResourceButton resourceId={resource.id} />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
