"use client";

import { useState, useTransition } from "react";
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
import { Textarea } from "@/components/ui/textarea";

import { reviewKnowledgeResource } from "./actions";

export function RejectResourceDialog({ resourceId }: { resourceId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!reason.trim()) {
      toast.error("A reason is required to reject a resource.");
      return;
    }

    const formData = new FormData();
    formData.set("resourceId", resourceId);
    formData.set("action", "reject");
    formData.set("reason", reason.trim());

    startTransition(async () => {
      try {
        await reviewKnowledgeResource(formData);
        toast.success("Knowledge resource rejected.");
        setReason("");
        setOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to reject resource.",
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="destructive" />}>
        Reject
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Knowledge Resource</DialogTitle>
          <DialogDescription>
            Provide a reason so the trainer can revise and resubmit this
            resource.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Explain why this resource is being rejected…"
            required
          />

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Rejecting…" : "Reject Resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
