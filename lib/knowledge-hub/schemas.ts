import { z } from "zod"
import { KNOWLEDGE_RESOURCE_TYPES } from "./constants"

export const knowledgeResourceSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  resourceType: z.enum(KNOWLEDGE_RESOURCE_TYPES),
  category: z.string().trim().max(100).optional(),
  competencyId: z.string().uuid().optional().or(z.literal("")),
  courseId: z.string().uuid().optional().or(z.literal("")),
  externalUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),
})