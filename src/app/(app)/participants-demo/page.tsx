"use client";

import { ParticipantsList } from "@/features/streaming/components/ParticipantsList";
import type { StreamParticipant } from "@/features/streaming/domain/stream.types";

// Sample participant data for demonstration
const sampleParticipants: StreamParticipant[] = [
  {
    stream_id: "demo-stream",
    user_id: "alice-123",
    joined_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    is_active: true,
  },
  {
    stream_id: "demo-stream",
    user_id: "bob-456",
    joined_at: new Date(Date.now() - 240000).toISOString(), // 4 minutes ago
    is_active: true,
  },
  {
    stream_id: "demo-stream",
    user_id: "charlie-789",
    joined_at: new Date(Date.now() - 180000).toISOString(), // 3 minutes ago
    is_active: true,
  },
  {
    stream_id: "demo-stream",
    user_id: "diana-101",
    joined_at: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
    is_active: true,
  },
  {
    stream_id: "demo-stream",
    user_id: "eve-202",
    joined_at: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
    is_active: true,
  },
  {
    stream_id: "demo-stream",
    user_id: "frank-303",
    joined_at: new Date(Date.now() - 30000).toISOString(), // 30 seconds ago
    is_active: true,
  },
];

export default function ParticipantsDemoPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            ParticipantsList Component Demo
          </h1>
          <p className="text-muted-foreground">
            Watch the floating avatar clouds animate! Hover over avatars to see
            tooltips.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Default Example */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Default View</h2>
            <ParticipantsList participants={sampleParticipants} />
          </div>

          {/* With Host Example */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              With Host (Alice has crown)
            </h2>
            <ParticipantsList
              participants={sampleParticipants}
              hostId="alice-123"
            />
          </div>

          {/* Current User Example */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Current User (You are Bob)
            </h2>
            <ParticipantsList
              participants={sampleParticipants}
              currentUserId="bob-456"
            />
          </div>

          {/* Host is Current User */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Host is Current User (You are Charlie with crown)
            </h2>
            <ParticipantsList
              participants={sampleParticipants}
              hostId="charlie-789"
              currentUserId="charlie-789"
            />
          </div>

          {/* Few Participants */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Few Participants</h2>
            <ParticipantsList
              participants={sampleParticipants.slice(0, 3)}
              hostId="alice-123"
            />
          </div>

          {/* Empty State */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Empty State</h2>
            <ParticipantsList participants={[]} />
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>Features demonstrated:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Floating avatar animations with collision detection</li>
            <li>Host indicators with crown icon and glow effect</li>
            <li>Current user highlighting with accent ring</li>
            <li>Hover effects with username tooltips</li>
            <li>Gradient backgrounds for each participant</li>
            <li>Responsive card sizing</li>
            <li>Empty state handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
