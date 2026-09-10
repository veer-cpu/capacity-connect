import "server-only"

import { createClient } from "@/lib/supabase/server"

export async function getActiveCompetencyOptions() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("competencies")
    .select("id, name")
    .eq("is_active", true)
    .order("name")

  if (error) {
    console.error(
      "Unable to load competencies for Knowledge Hub:",
      error,
    )
    return []
  }

  return data ?? []
}

export async function getTrainerCourseOptions(
  trainerId: string,
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("courses")
    .select("id, title")
    .eq("trainer_id", trainerId)
    .order("title")

  if (error) {
    console.error(
      "Unable to load trainer courses for Knowledge Hub:",
      error,
    )
    return []
  }

  return data ?? []
}

type SupabaseServerClient =
  Awaited<ReturnType<typeof createClient>>

type RelatableRow = {
  uploaded_by: string | null
  competency_id: string | null
  course_id: string | null
}

export type RelatedNameMaps = {
  profileMap: Map<string, string>
  competencyMap: Map<string, string>
  courseMap: Map<
    string,
    {
      title: string
      slug: string
    }
  >
}

export async function buildRelatedNameMaps(
  supabase: SupabaseServerClient,
  rows: RelatableRow[],
): Promise<RelatedNameMaps> {
  const uploaderIds = [
    ...new Set(
      rows
        .map((row) => row.uploaded_by)
        .filter((value): value is string => !!value),
    ),
  ]

  const competencyIds = [
    ...new Set(
      rows
        .map((row) => row.competency_id)
        .filter((value): value is string => !!value),
    ),
  ]

  const courseIds = [
    ...new Set(
      rows
        .map((row) => row.course_id)
        .filter((value): value is string => !!value),
    ),
  ]

  const [
    profilesResult,
    competenciesResult,
    coursesResult,
  ] = await Promise.all([
    uploaderIds.length
      ? supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", uploaderIds)
      : Promise.resolve({
          data: [] as {
            id: string
            full_name: string
          }[],
        }),

    competencyIds.length
      ? supabase
          .from("competencies")
          .select("id, name")
          .in("id", competencyIds)
      : Promise.resolve({
          data: [] as {
            id: string
            name: string
          }[],
        }),

    courseIds.length
      ? supabase
          .from("courses")
          .select("id, title, slug")
          .in("id", courseIds)
      : Promise.resolve({
          data: [] as {
            id: string
            title: string
            slug: string
          }[],
        }),
  ])

  return {
    profileMap: new Map(
      (profilesResult.data ?? []).map((row) => [
        row.id,
        row.full_name,
      ]),
    ),

    competencyMap: new Map(
      (competenciesResult.data ?? []).map((row) => [
        row.id,
        row.name,
      ]),
    ),

    courseMap: new Map(
      (coursesResult.data ?? []).map((row) => [
        row.id,
        {
          title: row.title,
          slug: row.slug,
        },
      ]),
    ),
  }
}