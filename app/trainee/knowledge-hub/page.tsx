import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getApprovedKnowledgeResourceCategories,
  getApprovedKnowledgeResources,
} from "@/lib/knowledge-hub/get-approved-resources";
import {
  KNOWLEDGE_RESOURCE_TYPE_LABELS,
} from "@/lib/knowledge-hub/constants"

import {
  getActiveCompetencyOptions,
} from "@/lib/knowledge-hub/server"

type PageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    category?: string;
    competency?: string;
  }>;
};

export default async function TraineeKnowledgeHubPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const [resources, categories, competencies] = await Promise.all([
    getApprovedKnowledgeResources({
      q: params.q,
      type: params.type,
      category: params.category,
      competencyId: params.competency,
    }),
    getApprovedKnowledgeResourceCategories(),
    getActiveCompetencyOptions(),
  ]);

  const hasFilters = Boolean(
    params.q ||
    (params.type && params.type !== "all") ||
    (params.category && params.category !== "all") ||
    (params.competency && params.competency !== "all"),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Knowledge Hub"
        description="Access approved organizational knowledge, operational guidance, case studies, SOPs and learning resources."
      />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Search approved knowledge resources by keyword, type, category, or
            competency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            method="get"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            <Input
              type="search"
              name="q"
              placeholder="Search title or description"
              defaultValue={params.q ?? ""}
            />

            <Select name="type" defaultValue={params.type ?? "all"}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Resource type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {Object.entries(KNOWLEDGE_RESOURCE_TYPE_LABELS).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            <Select name="category" defaultValue={params.category ?? "all"}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select name="competency" defaultValue={params.competency ?? "all"}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Competency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All competencies</SelectItem>
                {competencies.map((competency) => (
                  <SelectItem key={competency.id} value={competency.id}>
                    {competency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
              <Button type="submit" size="sm">
                Apply filters
              </Button>
              {hasFilters && (
                <Link
                  href="/trainee/knowledge-hub"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Clear filters
                </Link>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {resources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No approved knowledge resources found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.id} className="flex flex-col">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
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
              <CardContent className="mt-auto space-y-2">
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
                  {resource.uploadedByName && (
                    <div>
                      <dt className="inline font-medium">Uploaded by: </dt>
                      <dd className="inline">{resource.uploadedByName}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="inline font-medium">Added: </dt>
                    <dd className="inline">
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/knowledge-hub/${resource.id}`}
                  className={buttonVariants({
                    size: "sm",
                    className: "mt-2 w-full",
                  })}
                >
                  Open Resource
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
