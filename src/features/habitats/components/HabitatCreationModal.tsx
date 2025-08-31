"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { HabitatCreationForm } from "./HabitatCreationForm";

interface HabitatCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess?: (habitatId: string) => void;
}

export function HabitatCreationModal({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: HabitatCreationModalProps) {
  const handleSuccess = (habitatId: string) => {
    onClose();
    if (onSuccess) {
      onSuccess(habitatId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Habitat</DialogTitle>
          <DialogDescription>
            Create a space for discussing your favorite movies and shows with
            like-minded fans.
          </DialogDescription>
        </DialogHeader>
        <HabitatCreationForm
          userId={userId}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
