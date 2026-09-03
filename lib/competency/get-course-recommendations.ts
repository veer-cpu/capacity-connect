import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import {
  aggregateCourseRecommendation,
  CompetencyGapInput,
  CourseInput,
  CourseRecommendationResult,
} from "./recommendations";

export type CourseRecommendationsData = {
  activeGaps: CompetencyGapInput[];
  recommendations: CourseRecommendationResult[];
};

export async function getCourseRecommendations(): Promise<CourseRecommendationsData> {
  const { user } = await requireRole("trainee");
  const supabase = await createClient();

  // 1. Fetch active skill gaps for this trainee (status != 'resolved' and gap_score > 0)
  const { data: gapsData } = await supabase
    .from("skill_gaps")
    .select(`
      competency_id,
      current_score,
      target_score,
      gap_score,
      priority,
      status,
      competencies (
        id,
        name,
        category
      )
    `)
    .eq("trainee_id", user.id)
    .neq("status", "resolved")
    .gt("gap_score", 0);

  const activeGaps: CompetencyGapInput[] =
    gapsData?.map((g) => {
      const comp = Array.isArray(g.competencies)
        ? g.competencies[0]
        : g.competencies;

      return {
        competencyId: g.competency_id,
        competencyName: comp?.name ?? "Unknown Competency",
        category: comp?.category ?? null,
        currentScore: Number(g.current_score),
        targetScore: Number(g.target_score),
        gapScore: Number(g.gap_score),
      };
    }) || [];

  // If no active gaps, return early with empty recommendations list
  if (activeGaps.length === 0) {
    return {
      activeGaps: [],
      recommendations: [],
    };
  }

  // 2. Fetch existing enrollments for this trainee to exclude active & completed courses
  const { data: enrollmentsData } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("trainee_id", user.id)
    .in("status", ["active", "completed"]);

  const excludedCourseIds =
    enrollmentsData?.map((e) => e.course_id).filter(Boolean) || [];

  // 3. Fetch published candidate courses with their competency mappings
  let query = supabase
    .from("courses")
    .select(`
      id,
      title,
      slug,
      description,
      category,
      difficulty,
      estimated_duration_minutes,
      status,
      course_competencies (
        competency_id,
        relevance_weight
      )
    `)
    .eq("status", "published");

  if (excludedCourseIds.length > 0) {
    query = query.not("id", "in", `(${excludedCourseIds.join(",")})`);
  }

  const { data: coursesData } = await query;

  if (!coursesData || coursesData.length === 0) {
    return {
      activeGaps,
      recommendations: [],
    };
  }

  // 4. Transform candidate courses into CourseInput structure
  const candidateCourses: CourseInput[] = coursesData.map((c) => {
    const ccList = Array.isArray(c.course_competencies)
      ? c.course_competencies
      : c.course_competencies
      ? [c.course_competencies]
      : [];

    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      category: c.category,
      difficulty: c.difficulty,
      estimatedDurationMinutes: c.estimated_duration_minutes,
      competencies: ccList.map((item) => ({
        competencyId: item.competency_id,
        relevanceWeight: Number(item.relevance_weight ?? 0),
      })),
    };
  });

  // 5. Evaluate and score candidates against active gaps using aggregateCourseRecommendation
  const recommendations: CourseRecommendationResult[] = [];

  for (const course of candidateCourses) {
    const result = aggregateCourseRecommendation(course, activeGaps);
    if (result) {
      recommendations.push(result);
    }
  }

  // 6. Deterministic tie-breaking sort:
  // 1. recommendationScore DESC
  // 2. course.title ASC
  recommendations.sort((a, b) => {
    if (b.recommendationScore !== a.recommendationScore) {
      return b.recommendationScore - a.recommendationScore;
    }
    return a.course.title.localeCompare(b.course.title);
  });

  return {
    activeGaps,
    recommendations,
  };
}
