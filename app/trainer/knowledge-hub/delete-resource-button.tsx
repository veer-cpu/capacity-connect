"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { deleteKnowledgeResource } from "./actions";

export function DeleteResourceButton({ resourceId }: { resourceId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !window.confirm(
        "Delete this knowledge resource? This action cannot be undone.",
      )
    ) {
      return;
    }

    const formData = new FormData();
    formData.set("resourceId", resourceId);

    startTransition(async () => {
      try {
        await deleteKnowledgeResource(formData);
        toast.success("Knowledge resource deleted.");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to delete knowledge resource.",
        );
      }
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="destructive"
      disabled={isPending}
      onClick={handleDelete}
    >
      {isPending ? "Deleting…" : "Delete"}
    </Button>
  );
}
