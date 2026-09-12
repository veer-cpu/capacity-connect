import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type ProficiencyBand =
    | "Beginner"
    | "Developing"
    | "Proficient"
    | "Advanced";

export type CompetencyPassportItem = {
    competencyId: string;
    competencyName: string;
    competencyCategory: string | null;
    competencyDescription: string | null;

    currentScore: number;
    targetScore: number;
    gapScore: number;
    proficiencyBand: ProficiencyBand;

    assessmentEvidenceCount: number;
    latestAssessmentPercentage: number | null;
    latestAssessmentAt: string | null;

    scoreHistoryCount: number;
    previousScore: number | null;
    improvement: number | null;
    lastScoreUpdate: string | null;

    certificateCount: number;
};

type PassportRpcRow = {
    competency_id: string;
    competency_name: string;
    competency_category: string | null;
    competency_description: string | null;

    current_score: number | string;
    target_score: number | string;
    gap_score: number | string;
    proficiency_band: ProficiencyBand;

    assessment_evidence_count: number | string;
    latest_assessment_percentage: number | string | null;
    latest_assessment_at: string | null;

    score_history_count: number | string;
    previous_score: number | string | null;
    improvement: number | string | null;
    last_score_update: string | null;

    certificate_count: number | string;
};

export async function getMyCompetencyPassport(): Promise<
    CompetencyPassportItem[]
> {
    await requireRole("trainee");

    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_my_competency_passport");

    if (error) {
        console.error("Unable to load competency passport:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });

        throw new Error("Unable to load competency passport.");
    }

    return (data ?? []).map((row: PassportRpcRow) => ({
        competencyId: row.competency_id,
        competencyName: row.competency_name,
        competencyCategory: row.competency_category,
        competencyDescription: row.competency_description,

        currentScore: Number(row.current_score),
        targetScore: Number(row.target_score),
        gapScore: Number(row.gap_score),

        proficiencyBand: row.proficiency_band,

        assessmentEvidenceCount: Number(row.assessment_evidence_count),

        latestAssessmentPercentage:
            row.latest_assessment_percentage === null
                ? null
                : Number(row.latest_assessment_percentage),

        latestAssessmentAt: row.latest_assessment_at,

        scoreHistoryCount: Number(row.score_history_count),

        previousScore:
            row.previous_score === null ? null : Number(row.previous_score),

        improvement:
            row.improvement === null ? null : Number(row.improvement),

        lastScoreUpdate: row.last_score_update,

        certificateCount: Number(row.certificate_count),
    }));
}
