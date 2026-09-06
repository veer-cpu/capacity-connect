import { z } from "zod";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type StaffDevelopmentPlanItem = {
    id: string;
    sequence: number;
    competencyId: string;
    competencyName: string;
    originalCurrentScore: number;
    originalTargetScore: number;
    originalGap: number;
    latestCurrentScore: number | null;
    latestGap: number | null;
    priority: string;
    latestPriority: string | null;
    recommendedCourseId: string | null;
    recommendedCourseTitle: string | null;
    recommendedCourseSlug: string | null;
    recommendedTrainerId: string | null;
    recommendedTrainerName: string | null;
    status: string;
    rationale: string | null;
};

export type StaffDevelopmentPlan = {
    id: string;
    title: string;
    startDate: string | null;
    targetDate: string | null;
    status: string;
    items: StaffDevelopmentPlanItem[];
};

export async function getTraineeDevelopmentPlanForStaff(
    traineeId: string
): Promise<StaffDevelopmentPlan | null> {
    const { user, profile } = await requireRole("admin").catch(async () => {
        return requireRole("trainer");
    });

    const parsedTraineeId = z.string().uuid().safeParse(traineeId);
    if (!parsedTraineeId.success) {
        throw new Error("Invalid trainee ID.");
    }

    const supabase = await createClient();

    const { data: trainee, error: traineeError } = await supabase
        .from("profiles")
        .select("id, role, is_approved, is_active")
        .eq("id", parsedTraineeId.data)
        .eq("role", "trainee")
        .eq("is_approved", true)
        .eq("is_active", true)
        .maybeSingle();

    if (traineeError) {
        console.error("Unable to verify trainee access:", {
            message: traineeError.message,
            code: traineeError.code,
            details: traineeError.details,
            hint: traineeError.hint,
        });
        throw new Error("Unable to verify trainee access.");
    }

    if (!trainee) return null;

    if (profile.role === "trainer") {
        const { data: enrollments, error: enrollmentError } = await supabase
            .from("enrollments")
            .select("course_id")
            .eq("trainee_id", parsedTraineeId.data)
            .in("status", ["active", "completed"]);

        if (enrollmentError) {
            console.error("Unable to verify trainer trainee access:", {
                message: enrollmentError.message,
                code: enrollmentError.code,
                details: enrollmentError.details,
                hint: enrollmentError.hint,
            });
            throw new Error("Unable to verify trainer access to this plan.");
        }

        const courseIds = (enrollments ?? [])
            .map((enrollment) => enrollment.course_id)
            .filter((courseId): courseId is string => Boolean(courseId));

        if (courseIds.length === 0) return null;

        const { data: assignedCourses, error: courseError } = await supabase
            .from("courses")
            .select("id")
            .in("id", courseIds)
            .eq("trainer_id", user.id);

        if (courseError) {
            console.error("Unable to verify assigned course access:", {
                message: courseError.message,
                code: courseError.code,
                details: courseError.details,
                hint: courseError.hint,
            });
            throw new Error("Unable to verify trainer access to this plan.");
        }

        if (!assignedCourses || assignedCourses.length === 0) return null;
    }

    const { data, error } = await supabase
        .from("development_plans")
        .select(
            `id, title, start_date, target_date, status,
			development_plan_items (
				id, sequence_order, current_score_snapshot, target_score_snapshot,
				gap_score_snapshot, priority, latest_current_score, latest_gap_score,
				latest_priority, recommended_course_id, recommended_trainer_id,
				rationale, status, competency_id,
				competencies (name),
				courses (title, slug),
				trainer_directory (full_name)
			)`
        )
        .eq("trainee_id", parsedTraineeId.data)
        .eq("status", "active")
        .maybeSingle();

    if (error) {
        console.error("Unable to load staff development plan:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });
        throw new Error(`Unable to load development plan: ${error.message}`);
    }

    if (!data) return null;

    type JoinedReference<T> = T | T[] | null;
    type StaffPlanItemRow = {
        id: string;
        sequence_order: number | string;
        current_score_snapshot: number | string;
        target_score_snapshot: number | string;
        gap_score_snapshot: number | string;
        latest_current_score: number | string | null;
        latest_gap_score: number | string | null;
        priority: string;
        latest_priority: string | null;
        recommended_course_id: string | null;
        recommended_trainer_id: string | null;
        rationale: string | null;
        status: string;
        competency_id: string;
        competencies: JoinedReference<{ name: string }>;
        courses: JoinedReference<{ title: string; slug: string }>;
        trainer_directory: JoinedReference<{ full_name: string | null }>;
    };

    const plan = data as typeof data & {
        development_plan_items: StaffPlanItemRow[] | null;
    };

    const items = (plan.development_plan_items ?? [])
        .map((item) => {
            const competency = Array.isArray(item.competencies)
                ? item.competencies[0]
                : item.competencies;
            const course = Array.isArray(item.courses) ? item.courses[0] : item.courses;
            const trainer = Array.isArray(item.trainer_directory)
                ? item.trainer_directory[0]
                : item.trainer_directory;

            return {
                id: item.id,
                sequence: Number(item.sequence_order),
                competencyId: item.competency_id,
                competencyName: competency?.name ?? "Unknown competency",
                originalCurrentScore: Number(item.current_score_snapshot),
                originalTargetScore: Number(item.target_score_snapshot),
                originalGap: Number(item.gap_score_snapshot),
                latestCurrentScore:
                    item.latest_current_score === null
                        ? null
                        : Number(item.latest_current_score),
                latestGap:
                    item.latest_gap_score === null ? null : Number(item.latest_gap_score),
                priority: item.priority,
                latestPriority: item.latest_priority,
                recommendedCourseId: item.recommended_course_id,
                recommendedCourseTitle: course?.title ?? null,
                recommendedCourseSlug: course?.slug ?? null,
                recommendedTrainerId: item.recommended_trainer_id,
                recommendedTrainerName: trainer?.full_name ?? null,
                status: item.status,
                rationale: item.rationale,
            };
        })
        .sort((left, right) => left.sequence - right.sequence);

    return {
        id: plan.id,
        title: plan.title,
        startDate: plan.start_date,
        targetDate: plan.target_date,
        status: plan.status,
        items,
    };
}
