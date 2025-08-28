import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HabitatCard } from "../HabitatCard";

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} {...props} />,
}));

const mockHabitat = {
  id: "habitat-1",
  name: "Marvel Movies",
  description: "Discuss all things Marvel Cinematic Universe",
  banner_url: "https://example.com/banner.jpg",
  tags: ["Action", "Superhero", "MCU"],
  is_public: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  creator_id: "user-1",
  member_count: 150,
  is_member: true,
  recent_activity: {
    discussions_count: 42,
    active_watch_parties: 3,
    recent_messages: 15,
    last_activity_at: "2024-01-15T10:30:00Z",
  },
};

describe("HabitatCard", () => {
  it("renders habitat information correctly", () => {
    const mockOnClick = vi.fn();
    render(<HabitatCard habitat={mockHabitat} onClick={mockOnClick} />);

    expect(screen.getByText("Marvel Movies")).toBeInTheDocument();
    expect(
      screen.getByText("Discuss all things Marvel Cinematic Universe")
    ).toBeInTheDocument();
    expect(screen.getByText("View Habitat")).toBeInTheDocument();
  });

  it("displays habitat banner image when available", () => {
    const mockOnClick = vi.fn();
    render(<HabitatCard habitat={mockHabitat} onClick={mockOnClick} />);

    const bannerImage = screen.getByAltText("Marvel Movies banner");
    expect(bannerImage).toBeInTheDocument();
    expect(bannerImage).toHaveAttribute(
      "src",
      "https://example.com/banner.jpg"
    );
  });

  it("displays fallback gradient when no banner image", () => {
    const habitatWithoutBanner = { ...mockHabitat, banner_url: null };
    const mockOnClick = vi.fn();
    render(
      <HabitatCard habitat={habitatWithoutBanner} onClick={mockOnClick} />
    );

    const fallbackDiv = screen
      .getByTestId("habitat-card")
      .querySelector(".bg-gradient-to-br");
    expect(fallbackDiv).toBeInTheDocument();
  });

  it("displays tags correctly", () => {
    const mockOnClick = vi.fn();
    render(<HabitatCard habitat={mockHabitat} onClick={mockOnClick} />);

    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Superhero")).toBeInTheDocument();
    // Third tag should be hidden with +1 indicator
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("displays member count from recent activity", () => {
    const mockOnClick = vi.fn();
    render(<HabitatCard habitat={mockHabitat} onClick={mockOnClick} />);

    expect(screen.getByText("42 online")).toBeInTheDocument();
  });

  it("displays custom member count when provided", () => {
    const mockOnClick = vi.fn();
    render(
      <HabitatCard
        habitat={mockHabitat}
        onClick={mockOnClick}
        memberCount={100}
      />
    );

    expect(screen.getByText("100 online")).toBeInTheDocument();
  });

  it("displays default member count when no activity data", () => {
    const habitatWithoutActivity = {
      ...mockHabitat,
      recent_activity: undefined,
    };
    const mockOnClick = vi.fn();
    render(
      <HabitatCard habitat={habitatWithoutActivity} onClick={mockOnClick} />
    );

    expect(screen.getByText("24 online")).toBeInTheDocument();
  });

  it("calls onClick with habitat id when clicked", () => {
    const mockOnClick = vi.fn();
    render(<HabitatCard habitat={mockHabitat} onClick={mockOnClick} />);

    const card = screen.getByTestId("habitat-card");
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledWith("habitat-1");
  });

  it("renders custom button label", () => {
    const mockOnClick = vi.fn();
    render(
      <HabitatCard
        habitat={mockHabitat}
        onClick={mockOnClick}
        buttonLabel="Join Now"
      />
    );

    expect(screen.getByText("Join Now")).toBeInTheDocument();
  });

  it("renders with custom button variant", () => {
    const mockOnClick = vi.fn();
    render(
      <HabitatCard
        habitat={mockHabitat}
        onClick={mockOnClick}
        buttonVariant="outline"
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const mockOnClick = vi.fn();
    render(
      <HabitatCard
        habitat={mockHabitat}
        onClick={mockOnClick}
        className="custom-class"
      />
    );

    const card = screen.getByTestId("habitat-card");
    expect(card).toHaveClass("custom-class");
  });

  it("renders without description when not provided", () => {
    const habitatWithoutDescription = { ...mockHabitat, description: null };
    const mockOnClick = vi.fn();
    render(
      <HabitatCard habitat={habitatWithoutDescription} onClick={mockOnClick} />
    );

    expect(screen.getByText("Marvel Movies")).toBeInTheDocument();
    expect(
      screen.queryByText("Discuss all things Marvel Cinematic Universe")
    ).not.toBeInTheDocument();
  });

  it("renders without tags when not provided", () => {
    const habitatWithoutTags = { ...mockHabitat, tags: null };
    const mockOnClick = vi.fn();
    render(<HabitatCard habitat={habitatWithoutTags} onClick={mockOnClick} />);

    const card = screen.getByTestId("habitat-card");
    const tagsContainer = card.querySelector(".habitat-card-tags");
    expect(tagsContainer).not.toBeInTheDocument();
  });

  it("renders with empty tags array", () => {
    const habitatWithEmptyTags = { ...mockHabitat, tags: [] };
    const mockOnClick = vi.fn();
    render(
      <HabitatCard habitat={habitatWithEmptyTags} onClick={mockOnClick} />
    );

    const card = screen.getByTestId("habitat-card");
    const tagsContainer = card.querySelector(".habitat-card-tags");
    expect(tagsContainer).not.toBeInTheDocument();
  });

  it("displays only first two tags when more than two", () => {
    const habitatWithManyTags = {
      ...mockHabitat,
      tags: ["Action", "Superhero", "MCU", "Adventure", "Sci-Fi"],
    };
    const mockOnClick = vi.fn();
    render(<HabitatCard habitat={habitatWithManyTags} onClick={mockOnClick} />);

    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Superhero")).toBeInTheDocument();
    expect(screen.getByText("+3")).toBeInTheDocument();
    expect(screen.queryByText("MCU")).not.toBeInTheDocument();
  });

  it("displays all tags when two or fewer", () => {
    const habitatWithFewTags = {
      ...mockHabitat,
      tags: ["Action", "Superhero"],
    };
    const mockOnClick = vi.fn();
    render(<HabitatCard habitat={habitatWithFewTags} onClick={mockOnClick} />);

    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Superhero")).toBeInTheDocument();
    expect(screen.queryByText("+")).not.toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    const mockOnClick = vi.fn();
    render(<HabitatCard habitat={mockHabitat} onClick={mockOnClick} />);

    const card = screen.getByTestId("habitat-card");
    expect(card).toHaveClass("habitat-card");

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("handles click events properly", () => {
    const mockOnClick = vi.fn();
    render(<HabitatCard habitat={mockHabitat} onClick={mockOnClick} />);

    const card = screen.getByTestId("habitat-card");

    // Multiple clicks should work
    fireEvent.click(card);
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(2);
    expect(mockOnClick).toHaveBeenCalledWith("habitat-1");
  });
});
