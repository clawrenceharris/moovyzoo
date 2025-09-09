import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import StreamPage from "../page";

// Mock the StreamVideoPlayer component
vi.mock("@/features/streaming/components/StreamVideoPlayer", () => ({
  StreamVideoPlayer: ({ streamId, media, isHost }: any) => (
    <div data-testid="video-player">
      <div>Stream ID: {streamId}</div>
      <div>Media: {media?.media_title}</div>
      <div>Host: {isHost ? "Yes" : "No"}</div>
    </div>
  ),
}));

// Mock the ParticipantsSidebar component (will be implemented later)
vi.mock("@/features/streaming/components/ParticipantsSidebar", () => ({
  ParticipantsSidebar: ({ participants }: any) => (
    <div data-testid="participants-sidebar">
      <div>Participants: {participants?.length || 0}</div>
    </div>
  ),
}));

// Mock the StreamChat component (will be implemented later)
vi.mock("@/features/streaming/components/StreamChat", () => ({
  StreamChat: ({ streamId }: any) => (
    <div data-testid="stream-chat">
      <div>Chat for stream: {streamId}</div>
    </div>
  ),
}));

// Mock the streaming service
vi.mock("@/features/streaming/domain/stream.service", () => ({
  StreamService: vi.fn(() => ({
    getStreamById: vi.fn().mockResolvedValue({
      id: "test-stream-id",
      media_title: "Test Movie",
      participants: [
        { id: "1", user_id: "user-1", is_host: true },
        { id: "2", user_id: "user-2", is_host: false },
      ],
    }),
  })),
}));

describe("StreamPage Layout", () => {
  const mockParams = { id: "test-stream-id" };

  it("should render main video player area", async () => {
    render(await StreamPage({ params: mockParams }));

    expect(screen.getByTestId("video-player")).toBeInTheDocument();
  });

  it("should render participants sidebar", async () => {
    render(await StreamPage({ params: mockParams }));

    expect(screen.getByTestId("participants-sidebar")).toBeInTheDocument();
  });

  it("should render chat interface", async () => {
    render(await StreamPage({ params: mockParams }));

    expect(screen.getByTestId("stream-chat")).toBeInTheDocument();
  });

  it("should have proper layout structure with main content and sidebar", async () => {
    render(await StreamPage({ params: mockParams }));

    // Should have a main layout container
    const layoutContainer = screen.getByTestId("stream-layout");
    expect(layoutContainer).toBeInTheDocument();

    // Should have main content area
    const mainContent = screen.getByTestId("main-content");
    expect(mainContent).toBeInTheDocument();

    // Should have sidebar
    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toBeInTheDocument();
  });

  it("should be responsive with proper CSS classes", async () => {
    render(await StreamPage({ params: mockParams }));

    const layoutContainer = screen.getByTestId("stream-layout");

    // Should have responsive layout classes
    expect(layoutContainer).toHaveClass("flex");
    expect(layoutContainer).toHaveClass("flex-col");
    expect(layoutContainer).toHaveClass("lg:flex-row");
  });

  it("should allocate proper space for video player", async () => {
    render(await StreamPage({ params: mockParams }));

    const mainContent = screen.getByTestId("main-content");

    // Should take most of the space
    expect(mainContent).toHaveClass("flex-1");
  });

  it("should have fixed sidebar width on desktop", async () => {
    render(await StreamPage({ params: mockParams }));

    const sidebar = screen.getByTestId("sidebar");

    // Should have fixed width on large screens
    expect(sidebar).toHaveClass("lg:w-80");
  });
});
