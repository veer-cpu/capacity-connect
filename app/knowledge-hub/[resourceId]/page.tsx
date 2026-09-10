import Link from "next/link";
import { notFound } from "next/navigation";

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
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { getKnowledgeResourceDetail } from "@/lib/knowledge-hub/get-resource-detail";
import { KNOWLEDGE_RESOURCE_TYPE_LABELS } from "@/lib/knowledge-hub/constants";

type PageProps = {
  params: Promise<{ resourceId: string }>;
};

export default async function KnowledgeResourceDetailPage({
  params,
}: PageProps) {
  const { resourceId } = await params;
  const resource = await getKnowledgeResourceDetail(resourceId);

  if (!resource) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 sm:p-8">
      <PageHeader
        eyebrow="Knowledge Hub"
        title={resource.title}
        description={resource.description ?? undefined}
        actions={
          !resource.isOwnResource || resource.status === "approved" ? (
            <Link
              href="/knowledge-hub"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Back to Knowledge Hub
            </Link>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={resource.status} />
        <Badge variant="outline">
          {KNOWLEDGE_RESOURCE_TYPE_LABELS[resource.resourceType]}
        </Badge>
        {resource.category && (
          <Badge variant="secondary">{resource.category}</Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>
            Metadata for this knowledge resource.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {resource.uploadedByName && (
              <div>
                <dt className="font-medium text-muted-foreground">
                  Uploaded by
                </dt>
                <dd>{resource.uploadedByName}</dd>
              </div>
            )}
            {resource.competencyName && (
              <div>
                <dt className="font-medium text-muted-foreground">
                  Competency
                </dt>
                <dd>{resource.competencyName}</dd>
              </div>
            )}
            {resource.courseTitle && (
              <div>
                <dt className="font-medium text-muted-foreground">Course</dt>
                <dd>
                  {resource.courseSlug ? (
                    <Link
                      href={`/courses/${resource.courseSlug}`}
                      className="underline underline-offset-2"
                    >
                      {resource.courseTitle}
                    </Link>
                  ) : (
                    resource.courseTitle
                  )}
                </dd>
              </div>
            )}
            <div>
              <dt className="font-medium text-muted-foreground">Submitted</dt>
              <dd>{new Date(resource.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>

          {resource.status === "rejected" && resource.reviewReason && (
            <>
              <Separator className="my-4" />
              <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                Rejection reason: {resource.reviewReason}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resource</CardTitle>
          <CardDescription>
            {resource.externalUrl
              ? "This resource links to an external website."
              : "This resource is a file stored in the Knowledge Hub."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {resource.externalUrl && (
            <a
              href={resource.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "sm" })}
            >
              Open External Link
            </a>
          )}

          {resource.signedUrl && (
            <a
              href={resource.signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "sm" })}
            >
              Open File
            </a>
          )}

          {!resource.externalUrl && !resource.signedUrl && (
            <p className="text-sm text-muted-foreground">
              This resource file is currently unavailable.
            </p>
          )}

          {resource.fileSizeBytes != null && (
            <p className="text-xs text-muted-foreground">
              {(resource.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
              {resource.mimeType ? ` · ${resource.mimeType}` : ""}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
