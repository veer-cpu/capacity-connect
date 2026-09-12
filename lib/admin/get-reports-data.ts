import "server-only";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import {
  getAdminCapacityGrid,
  type CapacityGridRow,
} from "./get-capacity-grid";
import {
  getAdminTrainingImpact,
  type TrainingImpactRow,
} from "./get-training-impact";
import {
  getAdminCertificates,
  type AdminCertificate,
} from "@/lib/certificates/get-admin-certificates";
import {
  getAdminCourseCompletions,
  type AdminCourseCompletionRow,
} from "./get-course-completions";
import {
  getAdminFeedbackOverview,
  type AdminFeedbackOverview,
} from "./get-feedback-overview";
import { getAdminCourses, type AdminCourse } from "./get-courses";

export type CompetencyGapReportRow = {
  employee: string;
  employeeCode: string;
  organizationalUnit: string;
  jobRole: string;
  competency: string;
  competencyCategory: string;
  currentScore: number;
  requiredScore: number;
  gap: number;
  priority: string;
  status: string;
};

export type TrainingNeedReportRow = {
  employee: string;
  unit: string;
  jobRole: string;
  competency: string;
  gap: number;
  priority: string;
  recommendedCourse: string;
  developmentPlanState: string;
};

export type CourseCompletionReportRow = {
  course: string;
  trainee: string;
  traineeEmail: string;
  status: string;
  progress: number;
  completedAt: string | null;
  trainer: string;
};

export type TrainingImpactReportRow = {
  course: string;
  trainer: string;
  completedTrainees: number;
  measuredSample: number;
  before: number | null;
  after: number | null;
  improvement: number | null;
  improvementRate: number;
  targetAttainmentRate: number;
};

export type CertificateReportRow = {
  certificateNumber: string;
  trainee: string;
  course: string;
  issuedDate: string;
  revokedStatus: string;
  revokedDate: string | null;
  revocationReason: string | null;
};

export type DepartmentReadinessReportRow = {
  organizationalUnit: string;
  requiredCompetencyRows: number;
  resolvedRows: number;
  criticalGaps: number;
  highGaps: number;
  averageGap: number;
  readinessPercentage: number;
};

export type TrainerPerformanceReportRow = {
  trainerName: string;
  trainerEmail: string;
  assignedCoursesCount: number;
  feedbackCount: number;
  averageTrainerRating: number | null;
  averageCourseRating: number | null;
  completedTrainees: number;
  averageImprovement: number | null;
  improvementRate: number | null;
  targetAttainmentRate: number | null;
};

export type ReportsDataPayload = {
  competencyGapReport: CompetencyGapReportRow[];
  trainingNeedReport: TrainingNeedReportRow[];
  courseCompletionReport: CourseCompletionReportRow[];
  trainingImpactReport: TrainingImpactReportRow[];
  certificateReport: CertificateReportRow[];
  departmentReadinessReport: DepartmentReadinessReportRow[];
  trainerPerformanceReport: TrainerPerformanceReportRow[];
  // Filter Metadata
  filterOptions: {
    units: string[];
    jobRoles: string[];
    competencies: string[];
    courses: string[];
    trainers: string[];
    priorities: string[];
  };
};

export async function getAdminReportsData(): Promise<ReportsDataPayload> {
  await requireRole("admin");
  const supabase = await createClient();

  async function fetchCourseCompetencies() {
    try {
      const { data } = await supabase.from("course_competencies").select("competency_id, courses(title)");
      return data ?? [];
    } catch {
      return [];
    }
  }

  async function fetchDevPlans() {
    try {
      const { data } = await supabase.from("development_plans").select("trainee_id, status");
      return data ?? [];
    } catch {
      return [];
    }
  }

  // Load baseline data from existing RPCs and helpers in parallel
  const [
    capacityGrid,
    trainingImpact,
    certificates,
    completions,
    feedbackOverview,
    courses,
    courseCompetenciesList,
    devPlansList,
  ] = await Promise.all([
    getAdminCapacityGrid().catch((err) => {
      console.error("Capacity grid load error in reports:", err);
      return [] as CapacityGridRow[];
    }),
    getAdminTrainingImpact().catch((err) => {
      console.error("Training impact load error in reports:", err);
      return [] as TrainingImpactRow[];
    }),
    getAdminCertificates().catch((err) => {
      console.error("Certificates load error in reports:", err);
      return [] as AdminCertificate[];
    }),
    getAdminCourseCompletions().catch((err) => {
      console.error("Completions load error in reports:", err);
      return [] as AdminCourseCompletionRow[];
    }),
    getAdminFeedbackOverview().catch((err) => {
      console.error("Feedback overview load error in reports:", err);
      return [] as AdminFeedbackOverview[];
    }),
    getAdminCourses().catch((err) => {
      console.error("Courses load error in reports:", err);
      return [] as AdminCourse[];
    }),
    fetchCourseCompetencies(),
    fetchDevPlans(),
  ]);

  // Map 1: Competency Gap Report
  const competencyGapReport: CompetencyGapReportRow[] = capacityGrid.map((row: CapacityGridRow) => ({
    employee: row.traineeName,
    employeeCode: row.employeeCode ?? "—",
    organizationalUnit: row.organizationalUnitName ?? row.department ?? "General",
    jobRole: row.jobRoleName ?? "Standard Staff",
    competency: row.competencyName,
    competencyCategory: row.competencyCategory ?? "General",
    currentScore: row.currentScore ?? 0,
    requiredScore: row.targetScore,
    gap: row.gapScore,
    priority: row.priority,
    status: row.gapStatus,
  }));

  // Helper map for course recommendations by competency_id
  const competencyCourseMap = new Map<string, string>();
  for (const item of courseCompetenciesList) {
    const rawCourse = Array.isArray(item.courses) ? item.courses[0] : item.courses;
    if (rawCourse?.title && !competencyCourseMap.has(item.competency_id)) {
      competencyCourseMap.set(item.competency_id, rawCourse.title);
    }
  }

  // Helper map for development plans by trainee_id
  const traineePlanMap = new Map<string, string>();
  for (const plan of devPlansList) {
    traineePlanMap.set(plan.trainee_id, plan.status);
  }

  // Map 2: Training Need Report (Unresolved Gaps > 0)
  const trainingNeedReport: TrainingNeedReportRow[] = capacityGrid
    .filter((row: CapacityGridRow) => row.gapScore > 0 || row.gapStatus !== "resolved")
    .map((row: CapacityGridRow) => {
      const recommendedCourse = competencyCourseMap.get(row.competencyId) ?? "None mapped";
      const planStatus = traineePlanMap.get(row.traineeId);
      const developmentPlanState = planStatus ? `Plan: ${planStatus}` : "No active plan";

      return {
        employee: row.traineeName,
        unit: row.organizationalUnitName ?? row.department ?? "General",
        jobRole: row.jobRoleName ?? "Standard Staff",
        competency: row.competencyName,
        gap: row.gapScore,
        priority: row.priority,
        recommendedCourse,
        developmentPlanState,
      };
    });

  // Map 3: Course Completion Report
  const courseCompletionReport: CourseCompletionReportRow[] = completions.map((c: AdminCourseCompletionRow) => ({
    course: c.courseTitle,
    trainee: c.traineeName,
    traineeEmail: c.traineeEmail,
    status: c.status,
    progress: c.progressPercentage,
    completedAt: c.completedAt,
    trainer: c.trainerName ?? "Unassigned",
  }));

  // Map 4: Training Impact Report
  const trainingImpactReport: TrainingImpactReportRow[] = trainingImpact.map((ti: TrainingImpactRow) => ({
    course: ti.courseTitle,
    trainer: ti.trainerName,
    completedTrainees: ti.completedTrainees,
    measuredSample: ti.postTrainingSample,
    before: ti.averageBeforeScore,
    after: ti.averageAfterScore,
    improvement: ti.averageImprovement,
    improvementRate: Math.round(ti.improvementRate * 100) / 100,
    targetAttainmentRate: Math.round(ti.targetAttainmentRate * 100) / 100,
  }));

  // Map 5: Certificate Report
  const certificateReport: CertificateReportRow[] = certificates.map((cert: AdminCertificate) => ({
    certificateNumber: cert.certificateNumber,
    trainee: cert.traineeName ?? "Trainee",
    course: cert.courseTitle,
    issuedDate: cert.issuedAt,
    revokedStatus: cert.revokedAt ? "Revoked" : "Active",
    revokedDate: cert.revokedAt,
    revocationReason: cert.revocationReason,
  }));

  // Map 6: Department Readiness Report (Derived from Capacity Grid)
  const unitGroups = new Map<string, CapacityGridRow[]>();
  for (const row of capacityGrid) {
    const unitName = row.organizationalUnitName ?? row.department ?? "General";
    if (!unitGroups.has(unitName)) {
      unitGroups.set(unitName, []);
    }
    unitGroups.get(unitName)!.push(row);
  }

  const departmentReadinessReport: DepartmentReadinessReportRow[] = Array.from(unitGroups.entries()).map(
    ([unitName, rows]) => {
      const requiredCompetencyRows = rows.length;
      const resolvedRows = rows.filter((r) => r.gapScore <= 0 || r.gapStatus === "resolved").length;
      const criticalGaps = rows.filter((r) => r.priority === "critical" && r.gapScore > 0).length;
      const highGaps = rows.filter((r) => r.priority === "high" && r.gapScore > 0).length;

      const totalGap = rows.reduce((sum, r) => sum + Math.max(r.gapScore, 0), 0);
      const averageGap = requiredCompetencyRows > 0 ? Math.round((totalGap / requiredCompetencyRows) * 10) / 10 : 0;

      // Readiness formula: average(min(current_score / target_score, 1)) * 100
      const totalRatio = rows.reduce((sum, r) => {
        const target = r.targetScore > 0 ? r.targetScore : 80;
        const current = r.currentScore ?? 0;
        const ratio = Math.min(Math.max(current / target, 0), 1);
        return sum + ratio;
      }, 0);

      const readinessPercentage =
        requiredCompetencyRows > 0
          ? Math.round((totalRatio / requiredCompetencyRows) * 1000) / 10
          : 100;

      return {
        organizationalUnit: unitName,
        requiredCompetencyRows,
        resolvedRows,
        criticalGaps,
        highGaps,
        averageGap,
        readinessPercentage,
      };
    }
  );

  // Map 7: Trainer Performance Report (Explicit separate metrics from existing RPCs)
  const trainerCourseCountMap = new Map<string, number>();
  for (const course of courses) {
    if (course.trainerId) {
      trainerCourseCountMap.set(course.trainerId, (trainerCourseCountMap.get(course.trainerId) ?? 0) + 1);
    }
  }

  const trainerImpactSummaryMap = new Map<string, { completedTrainees: number; avgImprovement: number | null; improvementRate: number; targetAttainment: number }>();
  for (const impact of trainingImpact) {
    if (impact.trainerId) {
      const existing = trainerImpactSummaryMap.get(impact.trainerId) ?? {
        completedTrainees: 0,
        avgImprovement: null,
        improvementRate: 0,
        targetAttainment: 0,
      };

      trainerImpactSummaryMap.set(impact.trainerId, {
        completedTrainees: existing.completedTrainees + impact.completedTrainees,
        avgImprovement: impact.averageImprovement !== null ? impact.averageImprovement : existing.avgImprovement,
        improvementRate: impact.improvementRate,
        targetAttainment: impact.targetAttainmentRate,
      });
    }
  }

  const trainerPerformanceReport: TrainerPerformanceReportRow[] = feedbackOverview.map((fb: AdminFeedbackOverview) => {
    const impactInfo = trainerImpactSummaryMap.get(fb.trainerId);

    return {
      trainerName: fb.trainerName ?? fb.trainerEmail,
      trainerEmail: fb.trainerEmail,
      assignedCoursesCount: trainerCourseCountMap.get(fb.trainerId) ?? 0,
      feedbackCount: fb.feedbackCount,
      averageTrainerRating: fb.averageTrainerRating !== null ? Math.round(fb.averageTrainerRating * 10) / 10 : null,
      averageCourseRating: fb.averageCourseRating !== null ? Math.round(fb.averageCourseRating * 10) / 10 : null,
      completedTrainees: impactInfo?.completedTrainees ?? 0,
      averageImprovement: impactInfo?.avgImprovement ?? null,
      improvementRate: impactInfo?.improvementRate ?? null,
      targetAttainmentRate: impactInfo?.targetAttainment ?? null,
    };
  });

  // Unique filter values for UI dropdowns
  const filterOptions = {
    units: Array.from(new Set(capacityGrid.map((r: CapacityGridRow) => r.organizationalUnitName ?? r.department).filter(Boolean))) as string[],
    jobRoles: Array.from(new Set(capacityGrid.map((r: CapacityGridRow) => r.jobRoleName).filter(Boolean))) as string[],
    competencies: Array.from(new Set(capacityGrid.map((r: CapacityGridRow) => r.competencyName))) as string[],
    courses: Array.from(new Set(courses.map((c: AdminCourse) => c.title))) as string[],
    trainers: Array.from(new Set(feedbackOverview.map((f: AdminFeedbackOverview) => f.trainerName ?? f.trainerEmail))) as string[],
    priorities: ["critical", "high", "medium", "low"],
  };

  return {
    competencyGapReport,
    trainingNeedReport,
    courseCompletionReport,
    trainingImpactReport,
    certificateReport,
    departmentReadinessReport,
    trainerPerformanceReport,
    filterOptions,
  };
}
