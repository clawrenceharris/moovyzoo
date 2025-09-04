"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DiscussionCreationForm } from "./DiscussionCreationForm";
import type { Discussion } from "../domain/habitats.types";

interface DiscussionCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitatId: string;
  userId: string;
  onSuccess: (discussion: Discussion) => void;
}

export function DiscussionCreationModal({
  isOpen,
  onClose,
  habitatId,
  userId,
  onSuccess,
}: DiscussionCreationModalProps) {
  const handleSuccess = (discussion: Discussion) => {
    onSuccess(discussion);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Discussion</DialogTitle>
        </DialogHeader>

        <DiscussionCreationForm
          habitatId={habitatId}
          userId={userId}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
