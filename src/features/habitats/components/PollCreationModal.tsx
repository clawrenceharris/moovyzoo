"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PollCreationForm } from "./PollCreationForm";
import type { Poll } from "../domain/habitats.types";

interface PollCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitatId: string;
  userId: string;
  onSuccess: (poll: Poll) => void;
}

export function PollCreationModal({
  isOpen,
  onClose,
  habitatId,
  userId,
  onSuccess,
}: PollCreationModalProps) {
  const handleSuccess = (poll: Poll) => {
    onSuccess(poll);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Poll</DialogTitle>
        </DialogHeader>

        <PollCreationForm
          habitatId={habitatId}
          userId={userId}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
