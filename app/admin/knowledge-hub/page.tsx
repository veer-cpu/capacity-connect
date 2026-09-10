import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAdminKnowledgeResources } from "@/lib/knowledge-hub/get-admin-resources";
import { KNOWLEDGE_RESOURCE_TYPE_LABELS } from "@/lib/knowledge-hub/constants";

import { reviewKnowledgeResource } from "./actions";
import { RejectResourceDialog } from "./reject-resource-dialog";

const STATUS_TABS = [
  { value: "pending", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" },
] as const;

const EMPTY_STATE_MESSAGES: Record<string, string> = {
  pending: "No resources are awaiting review.",
  approved: "No approved resources yet.",
  rejected: "No rejected resources.",
  archived: "No archived resources.",
};

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminKnowledgeHubPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const status = STATUS_TABS.some((tab) => tab.value === params.status)
    ? params.status!
    : "pending";

  const resources = await getAdminKnowledgeResources(status);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Knowledge Hub"
        description="Review, approve, reject, and archive trainer-submitted knowledge resources."
      />

      <Tabs value={status}>
        <TabsList className="w-full flex-wrap sm:w-fit">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
               nativeButton={false}
              render={
                <Link href={`/admin/knowledge-hub?status=${tab.value}`} />
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
                  {resource.uploadedByName && (
                    <div>
                      <dt className="inline font-medium">Trainer: </dt>
                      <dd className="inline">{resource.uploadedByName}</dd>
                    </div>
                  )}
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
                    Review
                  </Link>

                  {resource.status === "pending" && (
                    <>
                      <form action={reviewKnowledgeResource}>
                        <input
                          type="hidden"
                          name="resourceId"
                          value={resource.id}
                        />
                        <input type="hidden" name="action" value="approve" />
                        <Button type="submit" size="sm">
                          Approve
                        </Button>
                      </form>
                      <RejectResourceDialog resourceId={resource.id} />
                    </>
                  )}

                  {resource.status === "approved" && (
                    <form action={reviewKnowledgeResource}>
                      <input
                        type="hidden"
                        name="resourceId"
                        value={resource.id}
                      />
                      <input type="hidden" name="action" value="archive" />
                      <Button type="submit" size="sm" variant="outline">
                        Archive
                      </Button>
                    </form>
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
