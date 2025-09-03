"use client";

import React, { useCallback, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DiscussionCard,
  LoadingState,
  EmptyState,
  FormLayout,
} from "@/components";
import type { DiscussionWithStats } from "../domain/habitats.types";
import { CircleQuestionMark, Plus } from "lucide-react";
import useModal from "@/hooks/use-modal";
import { DiscussionCreationForm } from "./DiscussionCreationForm";
import {
  CreateDiscussionInput,
  createDiscussionSchema,
  habitatsService,
} from "../domain";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@/hooks/use-user";

interface HabitatDiscussionsProps {
  discussions: DiscussionWithStats[];
  habitatId: string;
  loading: boolean;
  onDiscussionClick: (id: string) => void;
}

export function HabitatDiscussions({
  discussions,
  loading,
  habitatId,
  onDiscussionClick,
}: HabitatDiscussionsProps) {
  const hasContent = discussions.length > 0;
  const { user } = useUser();
  const handleSubmit = useCallback(async (data: CreateDiscussionInput) => {
    await habitatsService.createDiscussion(
      habitatId,
      data.name,
      data.description,
      user.id
    );

    closeModal();
  }, []);

  const { openModal, closeModal, modal } = useModal({
    title: "Create Discussion",

    children: (
      <FormLayout<CreateDiscussionInput>
        resolver={zodResolver(createDiscussionSchema)}
        onSubmit={handleSubmit}
      >
        <DiscussionCreationForm />
      </FormLayout>
    ),
  });
  return (
    <Card className="bg-primary-surface">
      {modal}
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Discussions</span>
          <Button
            variant="secondary"
            onClick={openModal}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Discussion
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <LoadingState variant="list" count={3} />
        ) : hasContent ? (
          <div className="space-y-3">
            {discussions.slice(0, 5).map((discussion) => {
              return (
                <DiscussionCard
                  key={discussion.id}
                  discussion={discussion}
                  onClick={() => onDiscussionClick(discussion.id)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            variant="card"
            title="No discussions yet"
            description="Start a conversation about your favorite scenes or theories!"
            icon={<CircleQuestionMark />}
          />
        )}
      </CardContent>
    </Card>
  );
}
