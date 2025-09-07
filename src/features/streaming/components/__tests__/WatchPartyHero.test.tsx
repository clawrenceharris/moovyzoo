import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { StreamWithParticipants } from "../../domain/stream.types";
import { StreamHero } from "../";

// Mock the image utility
vi.mock("@/features/ai-chat", () => ({
  getImageUrl: vi.fn(
    (path: string) => `https://image.tmdb.org/t/p/w500${path}`
  ),
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockStream: StreamWithParticipants = {
  id: "1",
  habitat_id: "habitat-1",
  description: "Join us for an amazing movie night!",
  scheduled_time: "2024-12-25T20:00:00Z",
  participant_count: 5,
  max_participants: 10,
  created_by: "user-1",
  created_at: "2024-12-20T10:00:00Z",
  is_active: true,
  tmdb_id: 12345,
  media_type: "movie",
  media_title: "The Great Movie",
  poster_path: "/poster.jpg",
  release_date: "2023-01-01T00:00:00Z",
  runtime: 120,
  participants: [],
  is_participant: false,
};

describe("StreamHero", () => {
  it("should render streaming session title and description", () => {
    render(<StreamHero stream={mockStream} />);

    expect(screen.getByText("The Great Movie")).toBeInTheDocument();
    expect(
      screen.getByText("Join us for an amazing movie night!")
    ).toBeInTheDocument();
  });

  it("should display media poster with proper alt text", () => {
    render(<StreamHero stream={mockStream} />);

    const poster = screen.getByTestId("hero-poster");
    expect(poster).toBeInTheDocument();
    expect(poster).toHaveAttribute("alt", "The Great Movie poster");
    expect(poster).toHaveAttribute(
      "src",
      "https://image.tmdb.org/t/p/w500/poster.jpg"
    );
  });

  it("should show fallback when no poster is available", () => {
    const streamWithoutPoster = {
      ...mockStream,
      poster_path: null,
    };

    render(<StreamHero stream={streamWithoutPoster} />);

    expect(screen.getByTestId("hero-poster-fallback")).toBeInTheDocument();
  });

  it("should display scheduled time and participant count", () => {
    render(<StreamHero stream={mockStream} />);

    expect(screen.getByTestId("scheduled-time")).toBeInTheDocument();
    expect(screen.getByTestId("participant-count")).toBeInTheDocument();
    expect(screen.getByText("5 participants")).toBeInTheDocument();
  });

  it("should show upcoming status for future streaming sessions", () => {
    const futureStream = {
      ...mockStream,
      scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    };

    render(<StreamHero stream={futureStream} />);

    expect(screen.getByTestId("status-indicator")).toBeInTheDocument();
    expect(screen.getByText("Upcoming")).toBeInTheDocument();
  });

  it("should show live status for current streaming sessions", () => {
    const liveStream = {
      ...mockStream,
      scheduled_time: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    };

    render(<StreamHero stream={liveStream} />);

    expect(screen.getByTestId("status-indicator")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("should show ended status for past streaming sessions", () => {
    const endedStream = {
      ...mockStream,
      scheduled_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    };

    render(<StreamHero stream={endedStream} />);

    expect(screen.getByTestId("status-indicator")).toBeInTheDocument();
    expect(screen.getByText("Ended")).toBeInTheDocument();
  });

  it("should display countdown timer for upcoming streams", () => {
    const upcomingStream = {
      ...mockStream,
      scheduled_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 minutes from now
    };

    render(<StreamHero stream={upcomingStream} />);

    expect(screen.getByTestId("countdown-timer")).toBeInTheDocument();
  });

  it("should display media information with year and type", () => {
    render(<StreamHero stream={mockStream} />);

    expect(screen.getByText("The Great Movie")).toBeInTheDocument();
    expect(screen.getByText("(2023)")).toBeInTheDocument();
    expect(screen.getByTestId("media-type-badge")).toBeInTheDocument();
    expect(screen.getByText("Movie")).toBeInTheDocument();
  });

  it("should display runtime information", () => {
    render(<StreamHero stream={mockStream} />);

    expect(screen.getByText("2h 0m")).toBeInTheDocument();
  });

  it("should handle TV show media type", () => {
    const tvStream = {
      ...mockStream,
      media_type: "tv" as const,
      media_title: "Great TV Show",
    };

    render(<StreamHero stream={tvStream} />);

    expect(screen.getByText("Great TV Show")).toBeInTheDocument();
    expect(screen.getByText("TV Show")).toBeInTheDocument();
  });

  it("should show participant avatars preview when available", () => {
    const streamWithParticipants = {
      ...mockStream,
      participants: [
        {
          stream_id: "1",
          user_id: "user-1",
          joined_at: "2024-12-20T10:00:00Z",
          is_active: true,
        },
        {
          stream_id: "1",
          user_id: "user-2",
          joined_at: "2024-12-20T11:00:00Z",
          is_active: true,
        },
      ],
    };

    render(<StreamHero stream={streamWithParticipants} />);

    expect(screen.getByTestId("participant-avatars")).toBeInTheDocument();
  });
});
