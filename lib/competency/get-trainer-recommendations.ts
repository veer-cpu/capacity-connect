import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import {
  aggregateTrainerMatch,
  CompetencyGapInput,
  TrainerInput,
  TrainerMatchResult,
} from "./trainer-matching";

export type TrainerRecommendationsData = {
  activeGaps: CompetencyGapInput[];
  recommendations: TrainerMatchResult[];
};

export async function getTrainerRecommendations(): Promise<TrainerRecommendationsData> {
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

  if (activeGaps.length === 0) {
    return {
      activeGaps: [],
      recommendations: [],
    };
  }

  const gapCompetencyIds = activeGaps.map((g) => g.competencyId);

  // 2. Fetch active & approved trainers with their profiles
  type TrainerDirectoryRow = {
    trainer_id: string;
    full_name: string | null;
    designation: string | null;
    department: string | null;
    bio: string | null;
    avatar_url: string | null;
    years_of_experience: number | null;
    trainer_bio: string | null;
    availability_status: string | null;
  };

  const {
    data: trainerProfilesRaw,
    error: trainersError,
  } = await supabase
    .from("trainer_directory")
    .select(`
    trainer_id,
    full_name,
    designation,
    department,
    bio,
    avatar_url,
    years_of_experience,
    trainer_bio,
    availability_status
  `);

  if (trainersError) {
    console.error(
      "Unable to load trainer directory:",
      trainersError
    );

    return {
      activeGaps,
      recommendations: [],
    };
  }

  const trainerProfilesData =
    (trainerProfilesRaw ?? []) as TrainerDirectoryRow[];

  if (trainerProfilesData.length === 0) {
    return {
      activeGaps,
      recommendations: [],
    };
  }
  const trainerUserIds =
    trainerProfilesData.map(
      (p) => p.trainer_id
    );
  type TrainerRecommendationMetricsRow = {
    trainer_id: string;

    assessment_sample_count: number | string;
    average_assessment_score: number | string | null;

    enrollment_sample_count: number | string;
    completion_rate: number | string | null;

    improvement_sample_count: number | string;
    competency_improvement_rate: number | string | null;

    performance_score: number | string;

    feedback_count: number | string;
    average_trainer_rating: number | string | null;
    feedback_score: number | string;
  };
  const {
    data: trainerMetricsRaw,
    error: trainerMetricsError,
  } = await supabase.rpc(
    "get_trainer_recommendation_metrics",
    {
      p_trainer_ids: trainerUserIds,
    }
  );

  if (trainerMetricsError) {
    console.error(
      "Unable to load trainer recommendation metrics:",
      trainerMetricsError
    );
  }
  const trainerMetricsMap = new Map<
    string,
    {
      performanceScore: number;
      feedbackScore: number;

      performanceEvidence: {
        assessmentSampleCount: number;
        averageAssessmentScore: number | null;

        enrollmentSampleCount: number;
        completionRate: number | null;

        improvementSampleCount: number;
        competencyImprovementRate: number | null;
      };

      feedbackEvidence: {
        feedbackCount: number;
        averageTrainerRating: number | null;
      };
    }
  >();

  ((trainerMetricsRaw ?? []) as TrainerRecommendationMetricsRow[]).forEach(
    (row) => {
      trainerMetricsMap.set(row.trainer_id, {
        performanceScore: Number(row.performance_score),
        feedbackScore: Number(row.feedback_score),
        performanceEvidence: {
          assessmentSampleCount: Number(row.assessment_sample_count),
          averageAssessmentScore:
            row.average_assessment_score === null
              ? null
              : Number(row.average_assessment_score),
          enrollmentSampleCount: Number(row.enrollment_sample_count),
          completionRate:
            row.completion_rate === null ? null : Number(row.completion_rate),
          improvementSampleCount: Number(row.improvement_sample_count),
          competencyImprovementRate:
            row.competency_improvement_rate === null
              ? null
              : Number(row.competency_improvement_rate),
        },
        feedbackEvidence: {
          feedbackCount: Number(row.feedback_count),
          averageTrainerRating:
            row.average_trainer_rating === null
              ? null
              : Number(row.average_trainer_rating),
        },
      });
    }
  );

  // 3. Fetch verified trainer competencies for these candidate trainers matching active gap competencies
  const {
    data: trainerCompetenciesData,
    error: trainerCompetenciesError,
  } = await supabase
    .from("trainer_directory_competencies")
    .select(`
    trainer_id,
    competency_id,
    expertise_score,
    years_experience
  `)
    .in("trainer_id", trainerUserIds)
    .in(
      "competency_id",
      gapCompetencyIds
    );
  if (trainerCompetenciesError) {
    console.error(
      "Unable to load verified trainer competencies:",
      trainerCompetenciesError
    );

    return {
      activeGaps,
      recommendations: [],
    };
  }
  if (!trainerCompetenciesData || trainerCompetenciesData.length === 0) {
    return {
      activeGaps,
      recommendations: [],
    };
  }

  // 4. Fetch published courses assigned to these trainers to evaluate Course Relevance
  const { data: publishedCoursesData } = await supabase
    .from("courses")
    .select(`
      trainer_id,
      course_competencies (
        competency_id
      )
    `)
    .in("trainer_id", trainerUserIds)
    .eq("status", "published");

  // Map trainer_id => Set of assigned competency_ids
  const trainerCourseCompMap = new Map<string, Set<string>>();

  publishedCoursesData?.forEach((c) => {
    if (!c.trainer_id) return;
    let compSet = trainerCourseCompMap.get(c.trainer_id);
    if (!compSet) {
      compSet = new Set<string>();
      trainerCourseCompMap.set(c.trainer_id, compSet);
    }

    const ccList = Array.isArray(c.course_competencies)
      ? c.course_competencies
      : c.course_competencies
        ? [c.course_competencies]
        : [];

    ccList.forEach((cc) => {
      if (cc.competency_id) {
        compSet?.add(cc.competency_id);
      }
    });
  });

  // Group verified competencies by trainer_id
  const trainerVerifiedCompMap = new Map<
    string,
    Array<{
      competencyId: string;
      expertiseScore: number;
      yearsExperience: number | null;
    }>
  >();

  trainerCompetenciesData.forEach((tc) => {
    let list = trainerVerifiedCompMap.get(tc.trainer_id);
    if (!list) {
      list = [];
      trainerVerifiedCompMap.set(tc.trainer_id, list);
    }
    list.push({
      competencyId: tc.competency_id,
      expertiseScore: Number(tc.expertise_score),
      yearsExperience:
        tc.years_experience !== null &&
          tc.years_experience !== undefined
          ? Number(tc.years_experience)
          : null,
    });
  });

  // 5. Build TrainerInput structures
  const candidateTrainers: TrainerInput[] =
    trainerProfilesData
      .filter((p) =>
        trainerVerifiedCompMap.has(
          p.trainer_id
        )
      )
      .map((p) => {
        const metrics =
          trainerMetricsMap.get(p.trainer_id);
        return {

          userId:
            p.trainer_id,

          fullName:
            p.full_name || "Trainer",

          designation:
            p.designation || null,

          department:
            p.department || null,

          bio:
            p.bio || null,

          avatarUrl:
            p.avatar_url || null,

          yearsOfExperience:
            p.years_of_experience !== null &&
              p.years_of_experience !== undefined
              ? Number(
                p.years_of_experience
              )
              : null,

          availabilityStatus:
            p.availability_status ?? null,

          trainerBio:
            p.trainer_bio || null,

          verifiedCompetencies:
            trainerVerifiedCompMap.get(
              p.trainer_id
            ) || [],
          performanceScore:
            metrics?.performanceScore ?? 50,

          feedbackScore:
            metrics?.feedbackScore ?? 50,

          performanceEvidence:
            metrics?.performanceEvidence ?? {
              assessmentSampleCount: 0,
              averageAssessmentScore: null,

              enrollmentSampleCount: 0,
              completionRate: null,

              improvementSampleCount: 0,
              competencyImprovementRate: null,
            },

          feedbackEvidence:
            metrics?.feedbackEvidence ?? {
              feedbackCount: 0,
              averageTrainerRating: null,
            },

          assignedCourseCompetencyIds:
            trainerCourseCompMap.get(
              p.trainer_id
            ) || new Set<string>(),
        };
      });
  // 6. Score candidate trainers against active gaps using aggregateTrainerMatch
  const recommendations: TrainerMatchResult[] = [];

  for (const trainer of candidateTrainers) {
    const result = aggregateTrainerMatch(trainer, activeGaps);
    if (result) {
      recommendations.push(result);
    }
  }

  // 7. Deterministic tie-breaking sort:
  // 1. matchScore DESC
  // 2. trainer.fullName ASC
  recommendations.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.trainer.fullName.localeCompare(b.trainer.fullName);
  });

  return {
    activeGaps,
    recommendations,
  };
}
