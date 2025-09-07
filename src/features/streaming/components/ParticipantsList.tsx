"use client";

import React, { useEffect, useState, useRef } from "react";
import { Crown, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { StreamParticipant } from "../domain/stream.types";

/**
 * Props for the ParticipantsList component
 */
export interface ParticipantsListProps {
  /** List of participants to display */
  participants: StreamParticipant[];
  /** ID of the stream creator/host */
  hostId?: string;
  /** Current user ID to highlight "You" */
  currentUserId?: string;
  /** Maximum number of participants to show */
  maxVisible?: number;
}

interface ParticipantPosition {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  username: string;
  isHost: boolean;
  isCurrentUser: boolean;
}

/**
 * ParticipantsList component displays participants as floating avatar clouds.
 *
 * Features:
 * - Floating avatar clouds with circular user initials and gradient backgrounds
 * - CSS animations for avatars to float around like clouds within card bounds
 * - Randomized positioning and gentle floating motion using CSS transforms
 * - Host indicators with crown icon and glow effect
 * - Collision detection to prevent avatars from overlapping
 * - Hover effects with scale and username tooltip
 * - Real-time participant updates with smooth enter/exit animations
 * - Responsive card sizing for different screen sizes
 */
export function ParticipantsList({
  participants,
  hostId,
  currentUserId,
  maxVisible = 20,
}: ParticipantsListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<ParticipantPosition[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const animationRef = useRef<number>(null);

  // Generate gradient colors for avatars
  const generateGradientColor = (id: string): string => {
    const colors = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-500",
      "from-teal-500 to-blue-500",
      "from-rose-500 to-pink-500",
      "from-amber-500 to-orange-500",
    ];
    const hash = id.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  // Get display name for participant
  const getDisplayName = (participant: StreamParticipant): string => {
    if (participant.user_id === currentUserId) {
      return "You";
    }
    // In real app, this would use actual username from user profile
    return `User ${participant.user_id.slice(0, 8)}`;
  };

  // Initialize positions for participants
  useEffect(() => {
    if (!containerRef.current || participants.length === 0) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    setContainerSize({ width: rect.width, height: rect.height });

    const displayedParticipants = participants.slice(0, maxVisible);

    const newPositions: ParticipantPosition[] = [];

    displayedParticipants.forEach((participant, index) => {
      const size = participant.user_id === hostId ? 60 : 48; // Host avatars are larger
      const padding = size / 2 + 10;

      // Generate non-overlapping initial positions
      let x: number, y: number;
      let attempts = 0;
      do {
        x = padding + Math.random() * (rect.width - 2 * padding);
        y = padding + Math.random() * (rect.height - 2 * padding);
        attempts++;
      } while (
        attempts < 50 &&
        newPositions.some((pos) => {
          const dx = pos.x - x;
          const dy = pos.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < (pos.size + size) / 2 + 20;
        })
      );

      newPositions.push({
        id: participant.user_id,
        x,
        y,
        vx: (Math.random() - 0.5) * 0.5, // Gentle velocity
        vy: (Math.random() - 0.5) * 0.5,
        size,
        color: generateGradientColor(participant.user_id),
        username: getDisplayName(participant),
        isHost: participant.user_id === hostId,
        isCurrentUser: participant.user_id === currentUserId,
      });
    });

    setPositions(newPositions);
  }, [participants, hostId, currentUserId, maxVisible]);

  // Animation loop for floating motion
  useEffect(() => {
    if (positions.length === 0) return;

    let isActive = true;

    const animate = () => {
      if (!isActive) return;

      setPositions((prevPositions) => {
        return prevPositions.map((pos) => {
          let { x, y, vx, vy } = pos;
          const padding = pos.size / 2 + 5;

          // Update position
          x += vx;
          y += vy;

          // Bounce off walls
          if (x <= padding || x >= containerSize.width - padding) {
            vx = -vx;
            x = Math.max(padding, Math.min(containerSize.width - padding, x));
          }
          if (y <= padding || y >= containerSize.height - padding) {
            vy = -vy;
            y = Math.max(padding, Math.min(containerSize.height - padding, y));
          }

          // Simple collision detection with other avatars
          prevPositions.forEach((other) => {
            if (other.id !== pos.id) {
              const dx = other.x - x;
              const dy = other.y - y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const minDistance = (pos.size + other.size) / 2 + 10;

              if (distance < minDistance && distance > 0) {
                // Push apart gently
                const pushX = (dx / distance) * 0.1;
                const pushY = (dy / distance) * 0.1;
                vx -= pushX;
                vy -= pushY;
              }
            }
          });

          // Add some randomness to keep motion interesting
          vx += (Math.random() - 0.5) * 0.02;
          vy += (Math.random() - 0.5) * 0.02;

          // Limit velocity
          const maxSpeed = 0.8;
          const speed = Math.sqrt(vx * vx + vy * vy);
          if (speed > maxSpeed) {
            vx = (vx / speed) * maxSpeed;
            vy = (vy / speed) * maxSpeed;
          }

          return { ...pos, x, y, vx, vy };
        });
      });

      if (isActive) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      isActive = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [positions.length, containerSize]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (participants.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No participants yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Be the first to join this streaming session!
        </p>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Participants ({participants.length})
        </h3>
      </div>

      <div
        ref={containerRef}
        className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-background/50 to-muted/30"
        style={{ minHeight: "256px" }}
      >
        {positions.map((pos) => (
          <div
            key={pos.id}
            className="absolute transition-all duration-300 ease-out group cursor-pointer"
            style={{
              transform: `translate(${pos.x - pos.size / 2}px, ${
                pos.y - pos.size / 2
              }px)`,
              width: pos.size,
              height: pos.size,
            }}
          >
            {/* Avatar with gradient background */}
            <div
              className={`
                relative w-full h-full rounded-full bg-gradient-to-br ${
                  pos.color
                }
                flex items-center justify-center text-white font-bold
                shadow-lg transition-all duration-200
                group-hover:scale-110 group-hover:shadow-xl
                ${
                  pos.isHost
                    ? "ring-2 ring-yellow-400 shadow-yellow-400/50"
                    : ""
                }
                ${pos.isCurrentUser ? "ring-2 ring-accent ring-offset-2" : ""}
              `}
              style={{
                fontSize: pos.size * 0.3,
                animation: pos.isHost ? "pulse 2s infinite" : undefined,
              }}
            >
              {/* User initial */}
              <span className="relative z-10">
                {pos.username.charAt(0).toUpperCase()}
              </span>

              {/* Host crown icon */}
              {pos.isHost && (
                <Crown
                  className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 drop-shadow-lg"
                  fill="currentColor"
                />
              )}

              {/* Glow effect for host */}
              {pos.isHost && (
                <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping" />
              )}
            </div>

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
              {pos.username}
              {pos.isHost && " (Host)"}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-black/80" />
            </div>
          </div>
        ))}

        {/* Overflow indicator */}
        {participants.length > maxVisible && (
          <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-sm rounded-full backdrop-blur-sm">
            +{participants.length - maxVisible} more
          </div>
        )}
      </div>
    </Card>
  );
}
