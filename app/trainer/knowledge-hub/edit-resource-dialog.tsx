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
import type { TrainerKnowledgeResource } from "@/lib/knowledge-hub/get-trainer-resources";

import { updateKnowledgeResource } from "./actions";

type EditResourceDialogProps = {
  resource: TrainerKnowledgeResource;
  competencies: CompetencyOption[];
  courses: CourseOption[];
};

export function EditResourceDialog({
  resource,
  competencies,
  courses,
}: EditResourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"file" | "url">(
    resource.externalUrl ? "url" : "file",
  );
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await updateKnowledgeResource(formData);
        toast.success("Knowledge resource updated and resubmitted for review.");
        setOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to update knowledge resource.",
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Knowledge Resource</DialogTitle>
          <DialogDescription>
            {resource.status === "rejected"
              ? "Editing this resource will resubmit it for admin review."
              : "This resource is still awaiting review."}
          </DialogDescription>
        </DialogHeader>

        <form
          key={`${resource.id}-${resource.updatedAt}`}
          ref={formRef}
          onSubmit={handleSubmit}
          className="max-h-[65vh] space-y-4 overflow-y-auto pr-1"
        >
          <input type="hidden" name="resourceId" value={resource.id} />

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium"
              htmlFor={`edit-title-${resource.id}`}
            >
              Title
            </label>
            <Input
              id={`edit-title-${resource.id}`}
              name="title"
              required
              maxLength={150}
              defaultValue={resource.title}
            />
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium"
              htmlFor={`edit-description-${resource.id}`}
            >
              Description
            </label>
            <Textarea
              id={`edit-description-${resource.id}`}
              name="description"
              rows={3}
              maxLength={1000}
              defaultValue={resource.description ?? ""}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium"
                htmlFor={`edit-type-${resource.id}`}
              >
                Resource Type
              </label>
              <Select name="resourceType" defaultValue={resource.resourceType}>
                <SelectTrigger
                  id={`edit-type-${resource.id}`}
                  className="w-full"
                >
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
              <label
                className="text-sm font-medium"
                htmlFor={`edit-category-${resource.id}`}
              >
                Category
              </label>
              <Input
                id={`edit-category-${resource.id}`}
                name="category"
                maxLength={100}
                defaultValue={resource.category ?? ""}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium"
                htmlFor={`edit-competency-${resource.id}`}
              >
                Competency (optional)
              </label>
              <Select
                name="competencyId"
                defaultValue={resource.competencyId ?? "none"}
              >
                <SelectTrigger
                  id={`edit-competency-${resource.id}`}
                  className="w-full"
                >
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
              <label
                className="text-sm font-medium"
                htmlFor={`edit-course-${resource.id}`}
              >
                Course (optional)
              </label>
              <Select
                name="courseId"
                defaultValue={resource.courseId ?? "none"}
              >
                <SelectTrigger
                  id={`edit-course-${resource.id}`}
                  className="w-full"
                >
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
                Replace File
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
              <div className="space-y-1">
                {resource.storagePath && (
                  <p className="text-xs text-muted-foreground">
                    A file is already attached. Choose a new file only to
                    replace it.
                  </p>
                )}
                <Input
                  type="file"
                  name="file"
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.mp4"
                />
              </div>
            ) : (
              <Input
                type="url"
                name="externalUrl"
                placeholder="https://example.com/resource"
                defaultValue={resource.externalUrl ?? ""}
              />
            )}
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
