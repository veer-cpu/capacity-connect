import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { getTrainerAssessmentEditor } from "@/lib/trainer/get-trainer-assessment-editor";
import {
  addAssessmentQuestion,
  closeAssessment,
  deleteAssessmentQuestion,
  publishAssessment,
  reopenAssessment,
  updateAssessmentDeadline,
} from "./actions";

type PageProps = { params: Promise<{ slug: string; assessmentId: string }> };

function isDeadlineOpen(deadline: string | null) {
  return !deadline || new Date(deadline).getTime() > Date.now();
}

export default async function TrainerAssessmentEditorPage({
  params,
}: PageProps) {
  const { slug, assessmentId } = await params;
  const editor = await getTrainerAssessmentEditor(slug, assessmentId);
  const deadline = editor.assessment.deadline
    ? new Date(editor.assessment.deadline).toLocaleString()
    : "No deadline";
  const canReopen =
    editor.assessment.status === "closed" &&
    isDeadlineOpen(editor.assessment.deadline);
  const isDraft = editor.assessment.status === "draft";

  return (
    <div className="space-y-8">
      <PageHeader
        title={editor.assessment.title}
        description={`Assessment management for ${editor.course.title}.`}
        actions={
          <Link
            href={`/trainer/courses/${slug}/assessments`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to assessments
          </Link>
        }
      />
      {isDraft && (
        <form action={publishAssessment}>
          <input type="hidden" name="assessmentId" value={assessmentId} />
          <input type="hidden" name="courseSlug" value={slug} />
          <Button type="submit">Publish Assessment</Button>
        </form>
      )}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Assessment Overview</CardTitle>
              <CardDescription>
                Lifecycle controls and deadline settings.
              </CardDescription>
            </div>
            <StatusBadge status={editor.assessment.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric
              label="Passing score"
              value={`${Number(editor.assessment.passingScore)}%`}
            />
            <Metric label="Deadline" value={deadline} />
            <Metric label="Course" value={editor.course.title} />
          </div>
          {editor.assessment.status !== "closed" && (
            <form
              action={updateAssessmentDeadline}
              className="mt-6 flex flex-wrap items-end gap-3 border-t pt-5"
            >
              <input
                type="hidden"
                name="assessmentId"
                value={editor.assessment.id}
              />
              <label className="space-y-1.5 text-sm">
                <span className="block font-medium">Edit deadline</span>
                <Input
                  type="datetime-local"
                  name="deadline"
                  defaultValue={toDateTimeLocalValue(
                    editor.assessment.deadline,
                  )}
                />
              </label>
              <Button type="submit" variant="outline">
                Save Deadline
              </Button>
            </form>
          )}
          {editor.assessment.status === "published" && (
            <form action={closeAssessment} className="mt-4">
              <input
                type="hidden"
                name="assessmentId"
                value={editor.assessment.id}
              />
              <Button type="submit" variant="secondary">
                Close Assessment
              </Button>
            </form>
          )}
          {canReopen && (
            <form action={reopenAssessment} className="mt-4">
              <input
                type="hidden"
                name="assessmentId"
                value={editor.assessment.id}
              />
              <Button type="submit">Reopen Assessment</Button>
            </form>
          )}
        </CardContent>
      </Card>
      {!isDraft ? (
        <Alert>
          <AlertTitle>
            This assessment is not editable in draft mode.
          </AlertTitle>
          <AlertDescription>
            Published assessments cannot be changed, and closed assessments can
            only be reopened when their deadline permits it.
          </AlertDescription>
        </Alert>
      ) : (
        <QuestionForm editor={editor} />
      )}
      <Card>
        <CardHeader>
          <CardTitle>Existing Questions</CardTitle>
          <CardDescription>
            {editor.questions.length} question
            {editor.questions.length === 1 ? "" : "s"} in this assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editor.questions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No questions added yet.
            </p>
          ) : (
            <div className="space-y-4">
              {editor.questions.map((question, index) => (
                <Card key={question.id} size="sm">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Question {question.position}
                        </p>
                        <h3 className="mt-1 font-medium">
                          {index + 1}. {question.questionText}
                        </h3>
                      </div>
                      {isDraft && (
                        <form action={deleteAssessmentQuestion}>
                          <input
                            type="hidden"
                            name="questionId"
                            value={question.id}
                          />
                          <input
                            type="hidden"
                            name="assessmentId"
                            value={editor.assessment.id}
                          />
                          <input
                            type="hidden"
                            name="courseSlug"
                            value={editor.course.slug}
                          />
                          <Button type="submit" variant="outline" size="sm">
                            Delete Question
                          </Button>
                        </form>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span>Points: {question.points}</span>
                      <span>·</span>
                      <span>
                        {question.competencyId
                          ? (editor.competencies.find(
                              (competency) =>
                                competency.id === question.competencyId,
                            )?.name ?? "Mapped")
                          : "Unmapped"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={option.id}
                          className="rounded-md border px-3 py-2 text-sm"
                        >
                          {String.fromCharCode(65 + optionIndex)}.{" "}
                          {option.optionText}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuestionForm({
  editor,
}: {
  editor: Awaited<ReturnType<typeof getTrainerAssessmentEditor>>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Question</CardTitle>
        <CardDescription>
          Questions can only be added while this assessment is a draft.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={addAssessmentQuestion} className="space-y-5">
          <input
            type="hidden"
            name="assessmentId"
            value={editor.assessment.id}
          />
          <input type="hidden" name="courseSlug" value={editor.course.slug} />
          <Field label="Question">
            <Textarea
              name="questionText"
              required
              minLength={2}
              maxLength={1000}
              rows={4}
              placeholder="What is the correct response?"
            />
          </Field>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Competency mapping">
              <Select name="competencyId" defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="No competency mapping" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No competency mapping</SelectItem>
                  {editor.competencies.map((competency) => (
                    <SelectItem key={competency.id} value={competency.id}>
                      {competency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Points">
              <Input
                name="points"
                type="number"
                min={1}
                max={100}
                step={1}
                defaultValue={1}
                required
              />
            </Field>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((number) => (
              <Field key={number} label={`Option ${number}`}>
                <Input
                  name={`option${number}`}
                  required={number < 3}
                  maxLength={500}
                />
              </Field>
            ))}
          </div>
          <div>
            <p className="mb-3 text-sm font-medium">Correct answer</p>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4].map((number) => (
                <label
                  key={number}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <input
                    type="radio"
                    name="correctOption"
                    value={number}
                    required
                    defaultChecked={number === 1}
                  />
                  Option {number}
                </label>
              ))}
            </div>
          </div>
          <Button type="submit">Add Question</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1.5 text-sm">
      <span className="block font-medium">{label}</span>
      {children}
    </label>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
function toDateTimeLocalValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
