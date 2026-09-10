"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  KNOWLEDGE_RESOURCE_TYPE_LABELS,
  type CompetencyOption,
  type CourseOption,
} from "@/lib/knowledge-hub/constants"

import { submitKnowledgeResource } from "./actions";

type SubmitResourceDialogProps = {
  competencies: CompetencyOption[];
  courses: CourseOption[];
};

export function SubmitResourceDialog({
  competencies,
  courses,
}: SubmitResourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"file" | "url">("file");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await submitKnowledgeResource(formData);
        toast.success("Knowledge resource submitted for review.");
        formRef.current?.reset();
        setMode("file");
        setOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to submit knowledge resource.",
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        Submit Resource
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Knowledge Resource</DialogTitle>
          <DialogDescription>
            Share a document, presentation, or external link. Submissions
            require admin approval before appearing in the Knowledge Hub.
          </DialogDescription>
        </DialogHeader>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="max-h-[65vh] space-y-4 overflow-y-auto pr-1"
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="submit-title">
              Title
            </label>
            <Input id="submit-title" name="title" required maxLength={150} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="submit-description">
              Description
            </label>
            <Textarea
              id="submit-description"
              name="description"
              rows={3}
              maxLength={1000}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="submit-type">
                Resource Type
              </label>
              <Select name="resourceType" defaultValue="document">
                <SelectTrigger id="submit-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(KNOWLEDGE_RESOURCE_TYPE_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="submit-category">
                Category
              </label>
              <Input id="submit-category" name="category" maxLength={100} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium"
                htmlFor="submit-competency"
              >
                Competency (optional)
              </label>
              <Select name="competencyId" defaultValue="none">
                <SelectTrigger id="submit-competency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {competencies.map((competency) => (
                    <SelectItem key={competency.id} value={competency.id}>
                      {competency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="submit-course">
                Course (optional)
              </label>
              <Select name="courseId" defaultValue="none">
                <SelectTrigger id="submit-course" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={mode === "file" ? "default" : "outline"}
                onClick={() => setMode("file")}
              >
                Upload File
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === "url" ? "default" : "outline"}
                onClick={() => setMode("url")}
              >
                External URL
              </Button>
            </div>

            {mode === "file" ? (
              <Input
                type="file"
                name="file"
                accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.mp4"
              />
            ) : (
              <Input
                type="url"
                name="externalUrl"
                placeholder="https://example.com/resource"
              />
            )}
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting…" : "Submit for Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
