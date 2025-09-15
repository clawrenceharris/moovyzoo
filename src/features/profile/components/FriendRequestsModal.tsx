import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { FriendRequest } from "../domain/profiles.types";
import { Users } from "lucide-react";

export interface FriendRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: FriendRequest[];
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function FriendRequestsModal({
  isOpen,
  onClose,
  requests,
  onAccept,
  onDecline,
  loading = false,
  error = null,
}: FriendRequestsModalProps) {
  // Coerce possible ISO string values into Date before calculations
  const toDate = (value: Date | string): Date =>
    value instanceof Date ? value : new Date(value);

  const formatTimeAgo = (value: Date | string) => {
    const date = toDate(value);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingState variant="list" count={3} />;
    }

    if (error) {
      return <ErrorState variant="inline" title="Error" message={error} />;
    }

    if (requests.length === 0) {
      return (
        <EmptyState
          variant="card"
          title="No pending requests"
          description="You have no pending friend requests at the moment."
          icon={<Users className="w-12 h-12 text-muted-foreground" />}
        />
      );
    }

    return (
      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id} className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    {request.requester.avatarUrl ? (
                      <AvatarImage
                        src={request.requester.avatarUrl}
                        alt={request.requester.displayName}
                      />
                    ) : null}
                    <AvatarFallback>
                      {getInitials(request.requester.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {request.requester.displayName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimeAgo(request.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDecline(request.id)}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAccept(request.id)}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Friend Requests"
      contentStyle={{ maxWidth: "500px" }}
    >
      <div className="max-h-96 overflow-y-auto">{renderContent()}</div>
    </Modal>
  );
}
