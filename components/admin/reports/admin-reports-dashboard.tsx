"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CsvExportButton } from "./csv-export-button";
import type { CsvColumn } from "@/lib/utils/csv-export";
import type {
  CertificateReportRow,
  CompetencyGapReportRow,
  CourseCompletionReportRow,
  DepartmentReadinessReportRow,
  ReportsDataPayload,
  TrainerPerformanceReportRow,
  TrainingImpactReportRow,
  TrainingNeedReportRow,
} from "@/lib/admin/get-reports-data";

export function AdminReportsDashboard({ data }: { data: ReportsDataPayload }) {
  const [activeTab, setActiveTab] = useState("gap");

  // Filters State
  const [unitFilter, setUnitFilter] = useState("all");
  const [jobRoleFilter, setJobRoleFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [trainerFilter, setTrainerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const resetFilters = () => {
    setUnitFilter("all");
    setJobRoleFilter("all");
    setPriorityFilter("all");
    setCourseFilter("all");
    setTrainerFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
  };

  // 1. Filtered Competency Gap Data
  const filteredGapReport = useMemo(() => {
    return data.competencyGapReport.filter((row) => {
      if (unitFilter !== "all" && row.organizationalUnit !== unitFilter) return false;
      if (jobRoleFilter !== "all" && row.jobRole !== jobRoleFilter) return false;
      if (priorityFilter !== "all" && row.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          row.employee.toLowerCase().includes(q) ||
          row.competency.toLowerCase().includes(q) ||
          row.employeeCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data.competencyGapReport, unitFilter, jobRoleFilter, priorityFilter, searchQuery]);

  // 2. Filtered Training Need Data
  const filteredNeedReport = useMemo(() => {
    return data.trainingNeedReport.filter((row) => {
      if (unitFilter !== "all" && row.unit !== unitFilter) return false;
      if (jobRoleFilter !== "all" && row.jobRole !== jobRoleFilter) return false;
      if (priorityFilter !== "all" && row.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          row.employee.toLowerCase().includes(q) ||
          row.competency.toLowerCase().includes(q) ||
          row.recommendedCourse.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data.trainingNeedReport, unitFilter, jobRoleFilter, priorityFilter, searchQuery]);

  // 3. Filtered Course Completion Data
  const filteredCompletionReport = useMemo(() => {
    return data.courseCompletionReport.filter((row) => {
      if (courseFilter !== "all" && row.course !== courseFilter) return false;
      if (trainerFilter !== "all" && row.trainer !== trainerFilter) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          row.trainee.toLowerCase().includes(q) ||
          row.course.toLowerCase().includes(q) ||
          row.traineeEmail.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data.courseCompletionReport, courseFilter, trainerFilter, statusFilter, searchQuery]);

  // 4. Filtered Training Impact Data
  const filteredImpactReport = useMemo(() => {
    return data.trainingImpactReport.filter((row) => {
      if (courseFilter !== "all" && row.course !== courseFilter) return false;
      if (trainerFilter !== "all" && row.trainer !== trainerFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return row.course.toLowerCase().includes(q) || row.trainer.toLowerCase().includes(q);
      }
      return true;
    });
  }, [data.trainingImpactReport, courseFilter, trainerFilter, searchQuery]);

  // 5. Filtered Certificate Data
  const filteredCertReport = useMemo(() => {
    return data.certificateReport.filter((row) => {
      if (courseFilter !== "all" && row.course !== courseFilter) return false;
      if (statusFilter !== "all") {
        if (statusFilter === "active" && row.revokedStatus !== "Active") return false;
        if (statusFilter === "revoked" && row.revokedStatus !== "Revoked") return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          row.certificateNumber.toLowerCase().includes(q) ||
          row.trainee.toLowerCase().includes(q) ||
          row.course.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data.certificateReport, courseFilter, statusFilter, searchQuery]);

  // 6. Filtered Department Readiness Data
  const filteredReadinessReport = useMemo(() => {
    return data.departmentReadinessReport.filter((row) => {
      if (unitFilter !== "all" && row.organizationalUnit !== unitFilter) return false;
      if (searchQuery.trim()) {
        return row.organizationalUnit.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [data.departmentReadinessReport, unitFilter, searchQuery]);

  // 7. Filtered Trainer Performance Data
  const filteredTrainerReport = useMemo(() => {
    return data.trainerPerformanceReport.filter((row) => {
      if (trainerFilter !== "all" && row.trainerName !== trainerFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return row.trainerName.toLowerCase().includes(q) || row.trainerEmail.toLowerCase().includes(q);
      }
      return true;
    });
  }, [data.trainerPerformanceReport, trainerFilter, searchQuery]);

  // CSV Columns Definitions
  const gapCsvColumns: CsvColumn<CompetencyGapReportRow>[] = [
    { header: "Employee Name", accessor: "employee" },
    { header: "Employee Code", accessor: "employeeCode" },
    { header: "Organizational Unit", accessor: "organizationalUnit" },
    { header: "Job Role", accessor: "jobRole" },
    { header: "Competency", accessor: "competency" },
    { header: "Category", accessor: "competencyCategory" },
    { header: "Current Score", accessor: "currentScore" },
    { header: "Required Score", accessor: "requiredScore" },
    { header: "Gap Score", accessor: "gap" },
    { header: "Priority", accessor: "priority" },
    { header: "Gap Status", accessor: "status" },
  ];

  const needCsvColumns: CsvColumn<TrainingNeedReportRow>[] = [
    { header: "Employee Name", accessor: "employee" },
    { header: "Organizational Unit", accessor: "unit" },
    { header: "Job Role", accessor: "jobRole" },
    { header: "Competency Required", accessor: "competency" },
    { header: "Gap Score", accessor: "gap" },
    { header: "Priority", accessor: "priority" },
    { header: "Recommended Course", accessor: "recommendedCourse" },
    { header: "Development Plan State", accessor: "developmentPlanState" },
  ];

  const completionCsvColumns: CsvColumn<CourseCompletionReportRow>[] = [
    { header: "Course Title", accessor: "course" },
    { header: "Trainee Name", accessor: "trainee" },
    { header: "Trainee Email", accessor: "traineeEmail" },
    { header: "Enrollment Status", accessor: "status" },
    { header: "Progress (%)", accessor: (r) => `${r.progress}%` },
    { header: "Completed Date", accessor: (r) => (r.completedAt ? new Date(r.completedAt).toLocaleDateString() : "In Progress") },
    { header: "Trainer", accessor: "trainer" },
  ];

  const impactCsvColumns: CsvColumn<TrainingImpactReportRow>[] = [
    { header: "Course Title", accessor: "course" },
    { header: "Trainer Name", accessor: "trainer" },
    { header: "Completed Trainees", accessor: "completedTrainees" },
    { header: "Measured Sample", accessor: "measuredSample" },
    { header: "Average Before Score", accessor: (r) => (r.before !== null ? r.before : "N/A") },
    { header: "Average After Score", accessor: (r) => (r.after !== null ? r.after : "N/A") },
    { header: "Average Improvement", accessor: (r) => (r.improvement !== null ? r.improvement : "N/A") },
    { header: "Improvement Rate (%)", accessor: (r) => `${r.improvementRate}%` },
    { header: "Target Attainment Rate (%)", accessor: (r) => `${r.targetAttainmentRate}%` },
  ];

  const certCsvColumns: CsvColumn<CertificateReportRow>[] = [
    { header: "Certificate Number", accessor: "certificateNumber" },
    { header: "Trainee Name", accessor: "trainee" },
    { header: "Course Title", accessor: "course" },
    { header: "Issued Date", accessor: (r) => new Date(r.issuedDate).toLocaleDateString() },
    { header: "Status", accessor: "revokedStatus" },
    { header: "Revocation Date", accessor: (r) => (r.revokedDate ? new Date(r.revokedDate).toLocaleDateString() : "") },
    { header: "Revocation Reason", accessor: (r) => r.revocationReason ?? "" },
  ];

  const readinessCsvColumns: CsvColumn<DepartmentReadinessReportRow>[] = [
    { header: "Organizational Unit", accessor: "organizationalUnit" },
    { header: "Total Required Competencies", accessor: "requiredCompetencyRows" },
    { header: "Resolved Competency Rows", accessor: "resolvedRows" },
    { header: "Critical Skill Gaps", accessor: "criticalGaps" },
    { header: "High Skill Gaps", accessor: "highGaps" },
    { header: "Average Gap Score", accessor: "averageGap" },
    { header: "Unit Readiness (%)", accessor: (r) => `${r.readinessPercentage}%` },
  ];

  const trainerCsvColumns: CsvColumn<TrainerPerformanceReportRow>[] = [
    { header: "Trainer Name", accessor: "trainerName" },
    { header: "Trainer Email", accessor: "trainerEmail" },
    { header: "Assigned Courses", accessor: "assignedCoursesCount" },
    { header: "Feedback Submissions", accessor: "feedbackCount" },
    { header: "Average Trainer Rating (1-5)", accessor: (r) => (r.averageTrainerRating !== null ? r.averageTrainerRating : "No rating") },
    { header: "Average Course Rating (1-5)", accessor: (r) => (r.averageCourseRating !== null ? r.averageCourseRating : "No rating") },
    { header: "Completed Trainees", accessor: "completedTrainees" },
    { header: "Avg Competency Improvement", accessor: (r) => (r.averageImprovement !== null ? r.averageImprovement : "N/A") },
    { header: "Improvement Rate (%)", accessor: (r) => (r.improvementRate !== null ? `${r.improvementRate}%` : "N/A") },
    { header: "Target Attainment Rate (%)", accessor: (r) => (r.targetAttainmentRate !== null ? `${r.targetAttainmentRate}%` : "N/A") },
  ];

  return (
    <div className="space-y-6">
      {/* Global Search & Filter Controls */}
      <Card size="sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[16rem]">
              <div className="relative flex-1 min-w-[12rem] max-w-xs">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search across report data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>

              {/* Unit Filter */}
              {(activeTab === "gap" || activeTab === "need" || activeTab === "readiness") && (
                <Select value={unitFilter} onValueChange={(val) => setUnitFilter(val ?? "all")}>
                  <SelectTrigger className="w-44 text-xs">
                    <SelectValue placeholder="All Units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units / Depts</SelectItem>
                    {data.filterOptions.units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Job Role Filter */}
              {(activeTab === "gap" || activeTab === "need") && (
                <Select value={jobRoleFilter} onValueChange={(val) => setJobRoleFilter(val ?? "all")}>
                  <SelectTrigger className="w-44 text-xs">
                    <SelectValue placeholder="All Job Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Job Roles</SelectItem>
                    {data.filterOptions.jobRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Priority Filter */}
              {(activeTab === "gap" || activeTab === "need") && (
                <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter(val ?? "all")}>
                  <SelectTrigger className="w-36 text-xs">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Course Filter */}
              {(activeTab === "completion" || activeTab === "impact" || activeTab === "cert") && (
                <Select value={courseFilter} onValueChange={(val) => setCourseFilter(val ?? "all")}>
                  <SelectTrigger className="w-48 text-xs">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {data.filterOptions.courses.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Trainer Filter */}
              {(activeTab === "completion" || activeTab === "impact" || activeTab === "trainer") && (
                <Select value={trainerFilter} onValueChange={(val) => setTrainerFilter(val ?? "all")}>
                  <SelectTrigger className="w-44 text-xs">
                    <SelectValue placeholder="All Trainers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trainers</SelectItem>
                    {data.filterOptions.trainers.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Status Filter */}
              {(activeTab === "completion" || activeTab === "cert") && (
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? "all")}>
                  <SelectTrigger className="w-36 text-xs">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {activeTab === "completion" ? (
                      <>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="dropped">Dropped</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="revoked">Revoked</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Reports Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto w-full justify-start gap-1 bg-muted/60 p-1">
          <TabsTrigger value="gap" className="text-xs">
            Competency Gap
          </TabsTrigger>
          <TabsTrigger value="need" className="text-xs">
            Training Need
          </TabsTrigger>
          <TabsTrigger value="completion" className="text-xs">
            Course Completion
          </TabsTrigger>
          <TabsTrigger value="impact" className="text-xs">
            Training Impact
          </TabsTrigger>
          <TabsTrigger value="cert" className="text-xs">
            Certificates
          </TabsTrigger>
          <TabsTrigger value="readiness" className="text-xs">
            Dept Readiness
          </TabsTrigger>
          <TabsTrigger value="trainer" className="text-xs">
            Trainer Performance
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: COMPETENCY GAP REPORT */}
        <TabsContent value="gap" className="space-y-6">
          <ReportHeaderCard
            title="Competency Gap Report"
            description="Capacity-grid and job-role-aware analysis comparing employee target capabilities against current scores."
            exportAction={
              <CsvExportButton
                filename="competency-gap-report.csv"
                columns={gapCsvColumns}
                data={filteredGapReport}
              />
            }
          />

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Total Evaluated Rows" value={filteredGapReport.length} />
            <KpiCard
              label="Critical Priority Gaps"
              value={filteredGapReport.filter((r) => r.priority === "critical").length}
              variant="destructive"
            />
            <KpiCard
              label="High Priority Gaps"
              value={filteredGapReport.filter((r) => r.priority === "high").length}
            />
            <KpiCard
              label="Resolved Capabilities"
              value={filteredGapReport.filter((r) => r.gap <= 0 || r.status === "resolved").length}
              variant="success"
            />
          </section>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Unit / Dept</TableHead>
                    <TableHead>Job Role</TableHead>
                    <TableHead>Competency</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">Target</TableHead>
                    <TableHead className="text-right">Gap</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGapReport.length === 0 ? (
                    <EmptyTableRow colSpan={9} text="No competency gap records match the selected filters." />
                  ) : (
                    filteredGapReport.map((row, idx) => (
                      <TableRow key={`${row.employee}-${row.competency}-${idx}`}>
                        <TableCell>
                          <p className="font-medium">{row.employee}</p>
                          <p className="text-xs text-muted-foreground">Code: {row.employeeCode}</p>
                        </TableCell>
                        <TableCell>{row.organizationalUnit}</TableCell>
                        <TableCell>{row.jobRole}</TableCell>
                        <TableCell>
                          <p className="font-medium">{row.competency}</p>
                          <p className="text-xs text-muted-foreground">{row.competencyCategory}</p>
                        </TableCell>
                        <TableCell className="text-right font-medium">{row.currentScore}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{row.requiredScore}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {row.gap > 0 ? <span className="text-red-600">+{row.gap}</span> : <span className="text-green-600">0</span>}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={row.priority} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-xs">
                            {row.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: TRAINING NEED REPORT */}
        <TabsContent value="need" className="space-y-6">
          <ReportHeaderCard
            title="Training Need Report"
            description="Derived from unresolved required competency gaps, highlighting course recommendations and development plan states."
            exportAction={
              <CsvExportButton
                filename="training-need-report.csv"
                columns={needCsvColumns}
                data={filteredNeedReport}
              />
            }
          />

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard label="Open Training Needs" value={filteredNeedReport.length} />
            <KpiCard
              label="Urgent (Critical/High) Gaps"
              value={filteredNeedReport.filter((r) => ["critical", "high"].includes(r.priority)).length}
              variant="destructive"
            />
            <KpiCard
              label="Mapped Recommended Courses"
              value={filteredNeedReport.filter((r) => r.recommendedCourse !== "None mapped").length}
              variant="success"
            />
          </section>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Unit / Dept</TableHead>
                    <TableHead>Job Role</TableHead>
                    <TableHead>Competency Deficit</TableHead>
                    <TableHead className="text-right">Gap</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Recommended Course</TableHead>
                    <TableHead>Development Plan State</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNeedReport.length === 0 ? (
                    <EmptyTableRow colSpan={8} text="No open training needs match the selected filters." />
                  ) : (
                    filteredNeedReport.map((row, idx) => (
                      <TableRow key={`${row.employee}-${row.competency}-${idx}`}>
                        <TableCell className="font-medium">{row.employee}</TableCell>
                        <TableCell>{row.unit}</TableCell>
                        <TableCell>{row.jobRole}</TableCell>
                        <TableCell className="font-medium">{row.competency}</TableCell>
                        <TableCell className="text-right font-semibold text-red-600">+{row.gap}</TableCell>
                        <TableCell>
                          <StatusBadge status={row.priority} />
                        </TableCell>
                        <TableCell>
                          {row.recommendedCourse === "None mapped" ? (
                            <span className="text-xs italic text-muted-foreground">None mapped</span>
                          ) : (
                            <Badge variant="secondary">{row.recommendedCourse}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {row.developmentPlanState}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: COURSE COMPLETION REPORT */}
        <TabsContent value="completion" className="space-y-6">
          <ReportHeaderCard
            title="Course Completion Report"
            description="Operational learning progress and completion status for all enrolled trainees across courses."
            exportAction={
              <CsvExportButton
                filename="course-completion-report.csv"
                columns={completionCsvColumns}
                data={filteredCompletionReport}
              />
            }
          />

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Total Enrollments" value={filteredCompletionReport.length} />
            <KpiCard
              label="Completed Courses"
              value={filteredCompletionReport.filter((r) => r.status === "completed").length}
              variant="success"
            />
            <KpiCard
              label="Active In-Progress"
              value={filteredCompletionReport.filter((r) => r.status === "active").length}
            />
            <KpiCard
              label="Average Progress"
              value={`${
                filteredCompletionReport.length > 0
                  ? Math.round(
                      filteredCompletionReport.reduce((acc, r) => acc + r.progress, 0) /
                        filteredCompletionReport.length
                    )
                  : 0
              }%`}
            />
          </section>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Trainee</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                    <TableHead>Completed Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompletionReport.length === 0 ? (
                    <EmptyTableRow colSpan={6} text="No course enrollment records match the selected filters." />
                  ) : (
                    filteredCompletionReport.map((row, idx) => (
                      <TableRow key={`${row.course}-${row.trainee}-${idx}`}>
                        <TableCell className="font-medium">{row.course}</TableCell>
                        <TableCell>
                          <p className="font-medium">{row.trainee}</p>
                          <p className="text-xs text-muted-foreground">{row.traineeEmail}</p>
                        </TableCell>
                        <TableCell>{row.trainer}</TableCell>
                        <TableCell>
                          <StatusBadge status={row.status} />
                        </TableCell>
                        <TableCell className="text-right font-medium">{row.progress}%</TableCell>
                        <TableCell>
                          {row.completedAt ? new Date(row.completedAt).toLocaleDateString() : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: TRAINING IMPACT REPORT */}
        <TabsContent value="impact" className="space-y-6">
          <ReportHeaderCard
            title="Training Impact Report"
            description="Reuses backend training-impact data measuring pre vs post training competency scores and target attainment."
            exportAction={
              <CsvExportButton
                filename="training-impact-report.csv"
                columns={impactCsvColumns}
                data={filteredImpactReport}
              />
            }
          />

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Evaluated Courses" value={filteredImpactReport.length} />
            <KpiCard
              label="Completed Trainees Sample"
              value={filteredImpactReport.reduce((acc, r) => acc + r.completedTrainees, 0)}
            />
            <KpiCard
              label="Average Improvement Rate"
              value={`${
                filteredImpactReport.length > 0
                  ? Math.round(
                      filteredImpactReport.reduce((acc, r) => acc + r.improvementRate, 0) /
                        filteredImpactReport.length
                    )
                  : 0
              }%`}
              variant="success"
            />
            <KpiCard
              label="Target Attainment Rate"
              value={`${
                filteredImpactReport.length > 0
                  ? Math.round(
                      filteredImpactReport.reduce((acc, r) => acc + r.targetAttainmentRate, 0) /
                        filteredImpactReport.length
                    )
                  : 0
              }%`}
            />
          </section>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead className="text-right">Completed Trainees</TableHead>
                    <TableHead className="text-right">Measured Sample</TableHead>
                    <TableHead className="text-right">Avg Before</TableHead>
                    <TableHead className="text-right">Avg After</TableHead>
                    <TableHead className="text-right">Improvement</TableHead>
                    <TableHead className="text-right">Improvement Rate</TableHead>
                    <TableHead className="text-right">Target Attainment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredImpactReport.length === 0 ? (
                    <EmptyTableRow colSpan={9} text="No training impact records match the selected filters." />
                  ) : (
                    filteredImpactReport.map((row, idx) => (
                      <TableRow key={`${row.course}-${idx}`}>
                        <TableCell className="font-medium">{row.course}</TableCell>
                        <TableCell>{row.trainer}</TableCell>
                        <TableCell className="text-right">{row.completedTrainees}</TableCell>
                        <TableCell className="text-right">{row.measuredSample}</TableCell>
                        <TableCell className="text-right">{row.before !== null ? row.before : "—"}</TableCell>
                        <TableCell className="text-right font-medium">{row.after !== null ? row.after : "—"}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {row.improvement !== null ? `+${row.improvement}` : "—"}
                        </TableCell>
                        <TableCell className="text-right">{row.improvementRate}%</TableCell>
                        <TableCell className="text-right font-medium">{row.targetAttainmentRate}%</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: CERTIFICATE REPORT */}
        <TabsContent value="cert" className="space-y-6">
          <ReportHeaderCard
            title="Certificate Report"
            description="Reuses certificate admin RPC data detailing issued competency certificates and revocation records."
            exportAction={
              <CsvExportButton
                filename="certificate-report.csv"
                columns={certCsvColumns}
                data={filteredCertReport}
              />
            }
          />

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard label="Total Certificates Issued" value={filteredCertReport.length} />
            <KpiCard
              label="Active Certificates"
              value={filteredCertReport.filter((r) => r.revokedStatus === "Active").length}
              variant="success"
            />
            <KpiCard
              label="Revoked Certificates"
              value={filteredCertReport.filter((r) => r.revokedStatus === "Revoked").length}
              variant="destructive"
            />
          </section>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Certificate Number</TableHead>
                    <TableHead>Trainee</TableHead>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Issued Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Revocation Info</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertReport.length === 0 ? (
                    <EmptyTableRow colSpan={6} text="No certificate records match the selected filters." />
                  ) : (
                    filteredCertReport.map((row) => (
                      <TableRow key={row.certificateNumber}>
                        <TableCell className="font-mono font-medium text-xs">{row.certificateNumber}</TableCell>
                        <TableCell className="font-medium">{row.trainee}</TableCell>
                        <TableCell>{row.course}</TableCell>
                        <TableCell>{new Date(row.issuedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={row.revokedStatus === "Active" ? "secondary" : "destructive"}
                            className="capitalize text-xs"
                          >
                            {row.revokedStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {row.revokedDate ? (
                            <div>
                              <p className="text-red-600">Revoked: {new Date(row.revokedDate).toLocaleDateString()}</p>
                              {row.revocationReason && <p className="italic">{row.revocationReason}</p>}
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: DEPARTMENT READINESS REPORT */}
        <TabsContent value="readiness" className="space-y-6">
          <ReportHeaderCard
            title="Department Readiness Report"
            description="Derived from capacity grid data calculating workforce readiness % and skill gap distribution per organizational unit."
            exportAction={
              <CsvExportButton
                filename="department-readiness-report.csv"
                columns={readinessCsvColumns}
                data={filteredReadinessReport}
              />
            }
          />

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard label="Organizational Units" value={filteredReadinessReport.length} />
            <KpiCard
              label="Overall Capacity Readiness"
              value={`${
                filteredReadinessReport.length > 0
                  ? Math.round(
                      filteredReadinessReport.reduce((acc, r) => acc + r.readinessPercentage, 0) /
                        filteredReadinessReport.length
                    )
                  : 0
              }%`}
              variant="success"
            />
            <KpiCard
              label="Critical Dept Gaps"
              value={filteredReadinessReport.reduce((acc, r) => acc + r.criticalGaps, 0)}
              variant="destructive"
            />
          </section>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Organizational Unit</TableHead>
                    <TableHead className="text-right">Competency Requirements</TableHead>
                    <TableHead className="text-right">Resolved Rows</TableHead>
                    <TableHead className="text-right">Critical Gaps</TableHead>
                    <TableHead className="text-right">High Gaps</TableHead>
                    <TableHead className="text-right">Average Gap</TableHead>
                    <TableHead className="text-right">Readiness %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReadinessReport.length === 0 ? (
                    <EmptyTableRow colSpan={7} text="No department readiness data matches the selected filters." />
                  ) : (
                    filteredReadinessReport.map((row) => (
                      <TableRow key={row.organizationalUnit}>
                        <TableCell className="font-semibold">{row.organizationalUnit}</TableCell>
                        <TableCell className="text-right">{row.requiredCompetencyRows}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">{row.resolvedRows}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">{row.criticalGaps}</TableCell>
                        <TableCell className="text-right font-medium text-amber-600">{row.highGaps}</TableCell>
                        <TableCell className="text-right">{row.averageGap}</TableCell>
                        <TableCell className="text-right font-bold text-sm">
                          <span
                            className={
                              row.readinessPercentage >= 80
                                ? "text-green-700"
                                : row.readinessPercentage >= 60
                                ? "text-amber-600"
                                : "text-red-600"
                            }
                          >
                            {row.readinessPercentage}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 7: TRAINER PERFORMANCE REPORT */}
        <TabsContent value="trainer" className="space-y-6">
          <ReportHeaderCard
            title="Trainer Performance Report"
            description="Reuses backend feedback overview and trainer analytics metrics detailing courses, ratings, completed trainees, improvement, and target attainment."
            exportAction={
              <CsvExportButton
                filename="trainer-performance-report.csv"
                columns={trainerCsvColumns}
                data={filteredTrainerReport}
              />
            }
          />

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Active Trainers" value={filteredTrainerReport.length} />
            <KpiCard
              label="Assigned Courses"
              value={filteredTrainerReport.reduce((acc, r) => acc + r.assignedCoursesCount, 0)}
            />
            <KpiCard
              label="Feedback Submissions"
              value={filteredTrainerReport.reduce((acc, r) => acc + r.feedbackCount, 0)}
            />
            <KpiCard
              label="Completed Trainees"
              value={filteredTrainerReport.reduce((acc, r) => acc + r.completedTrainees, 0)}
              variant="success"
            />
          </section>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Trainer Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Courses</TableHead>
                    <TableHead className="text-right">Feedback Rating</TableHead>
                    <TableHead className="text-right">Feedback Count</TableHead>
                    <TableHead className="text-right">Completed Trainees</TableHead>
                    <TableHead className="text-right">Avg Improvement</TableHead>
                    <TableHead className="text-right">Improvement Rate</TableHead>
                    <TableHead className="text-right">Target Attainment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrainerReport.length === 0 ? (
                    <EmptyTableRow colSpan={9} text="No trainer performance records match the selected filters." />
                  ) : (
                    filteredTrainerReport.map((row) => (
                      <TableRow key={row.trainerEmail}>
                        <TableCell className="font-medium">{row.trainerName}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row.trainerEmail}</TableCell>
                        <TableCell className="text-right font-medium">{row.assignedCoursesCount}</TableCell>
                        <TableCell className="text-right font-medium">
                          {row.averageTrainerRating !== null ? `${row.averageTrainerRating} / 5` : "—"}
                        </TableCell>
                        <TableCell className="text-right">{row.feedbackCount}</TableCell>
                        <TableCell className="text-right font-medium">{row.completedTrainees}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {row.averageImprovement !== null ? `+${row.averageImprovement}` : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.improvementRate !== null ? `${row.improvementRate}%` : "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {row.targetAttainmentRate !== null ? `${row.targetAttainmentRate}%` : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportHeaderCard({
  title,
  description,
  exportAction,
}: {
  title: string;
  description: string;
  exportAction: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <div>{exportAction}</div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string | number;
  variant?: "default" | "success" | "destructive";
}) {
  return (
    <Card size="sm">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`mt-1.5 text-2xl font-bold tabular-nums ${
            variant === "destructive"
              ? "text-red-600"
              : variant === "success"
              ? "text-green-600"
              : "text-foreground"
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyTableRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-8 text-center text-sm text-muted-foreground">
        {text}
      </TableCell>
    </TableRow>
  );
}
