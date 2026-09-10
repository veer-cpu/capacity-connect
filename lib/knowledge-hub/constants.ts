export const KNOWLEDGE_RESOURCE_TYPES = [
  "pdf",
  "presentation",
  "video",
  "external_link",
  "guide",
  "sop",
  "case_study",
  "operational_note",
  "best_practice",
  "document",
] as const

export const KNOWLEDGE_RESOURCE_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "archived",
] as const

export type KnowledgeResourceType =
  (typeof KNOWLEDGE_RESOURCE_TYPES)[number]

export type KnowledgeResourceStatus =
  (typeof KNOWLEDGE_RESOURCE_STATUSES)[number]

export const KNOWLEDGE_RESOURCE_TYPE_LABELS: Record<
  KnowledgeResourceType,
  string
> = {
  pdf: "PDF",
  presentation: "Presentation",
  video: "Video",
  external_link: "External Link",
  guide: "Guide",
  sop: "SOP",
  case_study: "Case Study",
  operational_note: "Operational Note",
  best_practice: "Best Practice",
  document: "Document",
}

export const KNOWLEDGE_HUB_BUCKET = "knowledge-hub"

export type CompetencyOption = {
  id: string
  name: string
}

export type CourseOption = {
  id: string
  title: string
}

export function isKnowledgeResourceType(
  value: string | null | undefined,
): value is KnowledgeResourceType {
  return (
    !!value &&
    (KNOWLEDGE_RESOURCE_TYPES as readonly string[]).includes(value)
  )
}

export function sanitizeSearchTerm(input: string): string {
  return input.replace(/[%,()]/g, "").trim().slice(0, 100)
}