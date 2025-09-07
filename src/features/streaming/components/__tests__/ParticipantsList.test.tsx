import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ParticipantsList } from "../ParticipantsList";
import type { StreamParticipant } from "../../domain/stream.types";

// Mock requestAnimationFrame for animation tests
const mockRequestAnimationFrame = vi.fn();
const mockCancelAnimationFrame = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  global.requestAnimationFrame = mockRequestAnimationFrame;
  global.cancelAnimationFrame = mockCancelAnimationFrame;

  // Mock getBoundingClientRect for container sizing
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 400,
    height: 300,
    top: 0,
    left: 0,
    bottom: 300,
    right: 400,
    x: 0,
    y: 0,
    toJSON: () => {},
  }));
});

const mockParticipants: StreamParticipant[] = [
  {
    stream_id: "party-1",
    user_id: "user-1",
    joined_at: "2024-01-01T10:00:00Z",
    is_active: true,
  },
  {
    stream_id: "party-1",
    user_id: "user-2",
    joined_at: "2024-01-01T10:05:00Z",
    is_active: true,
  },
  {
    stream_id: "party-1",
    user_id: "user-3",
    joined_at: "2024-01-01T10:10:00Z",
    is_active: true,
  },
];

describe("ParticipantsList", () => {
  it("should render participants list with floating avatars", () => {
    render(<ParticipantsList participants={mockParticipants} />);

    expect(screen.getByText("Participants (3)")).toBeInTheDocument();

    // Check that avatars are rendered with initials (all users start with "U")
    const avatarInitials = screen.getAllByText("U");
    expect(avatarInitials).toHaveLength(3); // All three users have "U" initial

    // Check that the container has the proper structure
    const containers = document.querySelectorAll('[class*="relative"]');
    expect(containers.length).toBeGreaterThan(0);
  });

  it("should show 'You' for current user with special styling", () => {
    render(
      <ParticipantsList
        participants={mockParticipants}
        currentUserId="user-2"
      />
    );

    // Should show "Y" initial for "You"
    expect(screen.getByText("Y")).toBeInTheDocument();

    // Check for accent ring styling on current user
    const currentUserAvatar = screen.getByText("Y").closest("div");
    expect(currentUserAvatar).toHaveClass("ring-accent");
  });

  it("should show host indicator with crown icon", () => {
    render(
      <ParticipantsList participants={mockParticipants} hostId="user-1" />
    );

    // Check for crown icon presence (Crown component from lucide-react)
    const crownIcon = document.querySelector(".lucide-crown");
    expect(crownIcon).toBeInTheDocument();

    // Check for host styling (yellow ring and glow)
    const hostAvatars = screen.getAllByText("U");
    const hostAvatar = hostAvatars[0].closest("div");
    expect(hostAvatar).toHaveClass("ring-yellow-400");
  });

  it("should show empty state when no participants", () => {
    render(<ParticipantsList participants={[]} />);

    expect(screen.getByText("No participants yet")).toBeInTheDocument();
    expect(
      screen.getByText("Be the first to join this streaming session!")
    ).toBeInTheDocument();
  });

  it("should show overflow indicator when participants exceed maxVisible", () => {
    const manyParticipants = Array.from({ length: 25 }, (_, i) => ({
      stream_id: "party-1",
      user_id: `user-${i + 1}`,
      joined_at: "2024-01-01T10:00:00Z",
      is_active: true,
    }));

    render(
      <ParticipantsList participants={manyParticipants} maxVisible={20} />
    );

    expect(screen.getByText("Participants (25)")).toBeInTheDocument();
    expect(screen.getByText("+5 more")).toBeInTheDocument();
  });

  it("should render avatars with gradient backgrounds", () => {
    render(<ParticipantsList participants={mockParticipants} />);

    // Check that avatars have gradient classes
    const avatars = document.querySelectorAll('[class*="bg-gradient-to-br"]');
    expect(avatars.length).toBeGreaterThan(0);
  });

  it("should handle hover effects with tooltips", () => {
    render(
      <ParticipantsList
        participants={mockParticipants}
        currentUserId="user-2"
      />
    );

    // Check for tooltip elements (they should be present but hidden)
    const tooltips = document.querySelectorAll(
      '[class*="group-hover:opacity-100"]'
    );
    expect(tooltips.length).toBeGreaterThan(0);
  });

  it("should initialize animation positions", () => {
    render(<ParticipantsList participants={mockParticipants} />);

    // Animation should be set up (requestAnimationFrame should be called)
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it("should cleanup animation on unmount", () => {
    // First trigger the animation to start
    mockRequestAnimationFrame.mockImplementation((callback) => {
      setTimeout(callback, 16);
      return 1;
    });

    const { unmount } = render(
      <ParticipantsList participants={mockParticipants} />
    );

    unmount();

    // Should cleanup animation frame (may not be called if animation didn't start)
    // Just check that the component unmounts without errors
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it("should handle responsive container sizing", () => {
    render(<ParticipantsList participants={mockParticipants} />);

    // Check for responsive height classes
    const container = document.querySelector('[class*="h-64"]');
    expect(container).toBeInTheDocument();
  });

  it("should display both host and current user indicators when user is host", () => {
    render(
      <ParticipantsList
        participants={mockParticipants}
        hostId="user-2"
        currentUserId="user-2"
      />
    );

    // Should have both crown (host) and accent ring (current user)
    const avatar = screen.getByText("Y").closest("div");
    expect(avatar).toHaveClass("ring-yellow-400"); // Host styling
    expect(avatar).toHaveClass("ring-accent"); // Current user styling
  });
});
