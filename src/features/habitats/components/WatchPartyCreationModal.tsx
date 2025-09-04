"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WatchPartyCreationForm } from "./";
import type { WatchParty } from "../domain/habitats.types";

interface WatchPartyCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitatId: string;
  userId: string;
  onSuccess: (watchParty: WatchParty) => void;
}

export function WatchPartyCreationModal({
  isOpen,
  onClose,
  habitatId,
  userId,
  onSuccess,
}: WatchPartyCreationModalProps) {
  const handleSuccess = (watchParty: WatchParty) => {
    onSuccess(watchParty);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Watch Party</DialogTitle>
        </DialogHeader>

        <WatchPartyCreationForm
          habitatId={habitatId}
          userId={userId}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
