import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HabitatHero } from "../HabitatHero";
import type { HabitatWithMembership } from "../../domain/habitats.types";

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} data-testid="habitat-banner" />
  ),
}));

describe("HabitatHero", () => {
  const mockHabitat: HabitatWithMembership = {
    id: "habitat-1",
    name: "Sci-Fi Universe",
    description:
      "Explore the depths of science fiction with fellow enthusiasts",
    tags: ["sci-fi", "space", "future"],
    member_count: 150,
    is_public: true,
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    banner_url: "https://example.com/banner.jpg",
    is_member: true,
    role: "member",
  };

  const mockHandlers = {
    onStartStreamingParty: vi.fn(),
    onCreatePoll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render habitat name and description", () => {
      // Act
      render(<HabitatHero habitat={mockHabitat} {...mockHandlers} />);

      // Assert
      expect(screen.getByText("Sci-Fi Universe")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Explore the depths of science fiction with fellow enthusiasts"
        )
      ).toBeInTheDocument();
    });

    it("should render banner image when banner_url is provided", () => {
      // Act
      render(<HabitatHero habitat={mockHabitat} {...mockHandlers} />);

      // Assert
      const bannerImage = screen.getByTestId("habitat-banner");
      expect(bannerImage).toBeInTheDocument();
      expect(bannerImage).toHaveAttribute(
        "src",
        "https://example.com/banner.jpg"
      );
      expect(bannerImage).toHaveAttribute("alt", "Sci-Fi Universe banner");
    });

    it("should not render banner image when banner_url is not provided", () => {
      // Arrange
      const habitatWithoutBanner = { ...mockHabitat, banner_url: undefined };

      // Act
      render(<HabitatHero habitat={habitatWithoutBanner} {...mockHandlers} />);

      // Assert
      expect(screen.queryByTestId("habitat-banner")).not.toBeInTheDocument();
    });

    it("should render default description when description is not provided", () => {
      // Arrange
      const habitatWithoutDescription = { ...mockHabitat, description: "" };

      // Act
      render(
        <HabitatHero habitat={habitatWithoutDescription} {...mockHandlers} />
      );

      // Assert
      expect(
        screen.getByText(/Welcome to the ultimate hub for sci-fi fans/)
      ).toBeInTheDocument();
    });

    it("should render action buttons", () => {
      // Act
      render(<HabitatHero habitat={mockHabitat} {...mockHandlers} />);

      // Assert
      expect(screen.getByText("Start Streaming Party")).toBeInTheDocument();
      expect(screen.getByText("Create Poll")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onStartStreamingParty when Start Streaming Party button is clicked", () => {
      // Act
      render(<HabitatHero habitat={mockHabitat} {...mockHandlers} />);

      // Click the button
      fireEvent.click(screen.getByText("Start Streaming Party"));

      // Assert
      expect(mockHandlers.onStartStreamingParty).toHaveBeenCalledTimes(1);
    });

    it("should call onCreatePoll when Create Poll button is clicked", () => {
      // Act
      render(<HabitatHero habitat={mockHabitat} {...mockHandlers} />);

      // Click the button
      fireEvent.click(screen.getByText("Create Poll"));

      // Assert
      expect(mockHandlers.onCreatePoll).toHaveBeenCalledTimes(1);
    });

    it("should not crash when handlers are not provided", () => {
      // Act & Assert
      expect(() => {
        render(<HabitatHero habitat={mockHabitat} />);
      }).not.toThrow();

      // Buttons should still be rendered
      expect(screen.getByText("Start Streaming Party")).toBeInTheDocument();
      expect(screen.getByText("Create Poll")).toBeInTheDocument();
    });
  });

  describe("Styling and Layout", () => {
    it("should apply custom className", () => {
      // Act
      const { container } = render(
        <HabitatHero
          habitat={mockHabitat}
          {...mockHandlers}
          className="custom-class"
        />
      );

      // Assert
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should have proper cinematic styling structure", () => {
      // Act
      const { container } = render(
        <HabitatHero habitat={mockHabitat} {...mockHandlers} />
      );

      // Assert
      const heroContainer = container.firstChild as HTMLElement;
      expect(heroContainer).toHaveClass(
        "relative",
        "overflow-hidden",
        "rounded-2xl"
      );
    });

    it("should render with proper height", () => {
      // Act
      render(<HabitatHero habitat={mockHabitat} {...mockHandlers} />);

      // Assert
      const heroBackground = screen
        .getByText("Sci-Fi Universe")
        .closest(".relative");
      expect(heroBackground).toHaveClass("h-[500px]");
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading structure", () => {
      // Act
      render(<HabitatHero habitat={mockHabitat} {...mockHandlers} />);

      // Assert
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Sci-Fi Universe");
    });

    it("should have accessible button labels", () => {
      // Act
      render(<HabitatHero habitat={mockHabitat} {...mockHandlers} />);

      // Assert
      expect(
        screen.getByRole("button", { name: /start streaming party/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create poll/i })
      ).toBeInTheDocument();
    });

    it("should have proper image alt text", () => {
      // Act
      render(<HabitatHero habitat={mockHabitat} {...mockHandlers} />);

      // Assert
      const bannerImage = screen.getByTestId("habitat-banner");
      expect(bannerImage).toHaveAttribute("alt", "Sci-Fi Universe banner");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long habitat names gracefully", () => {
      // Arrange
      const habitatWithLongName = {
        ...mockHabitat,
        name: "This is a very long habitat name that might cause layout issues if not handled properly",
      };

      // Act & Assert
      expect(() => {
        render(<HabitatHero habitat={habitatWithLongName} {...mockHandlers} />);
      }).not.toThrow();

      expect(screen.getByText(habitatWithLongName.name)).toBeInTheDocument();
    });

    it("should handle very long descriptions gracefully", () => {
      // Arrange
      const habitatWithLongDescription = {
        ...mockHabitat,
        description:
          "This is a very long description that goes on and on and might cause layout issues if not handled properly. It contains multiple sentences and should be displayed correctly without breaking the layout or causing any visual issues.",
      };

      // Act & Assert
      expect(() => {
        render(
          <HabitatHero habitat={habitatWithLongDescription} {...mockHandlers} />
        );
      }).not.toThrow();

      expect(
        screen.getByText(habitatWithLongDescription.description)
      ).toBeInTheDocument();
    });

    it("should handle null or undefined banner_url", () => {
      // Arrange
      const habitatWithNullBanner = { ...mockHabitat, banner_url: null as any };

      // Act & Assert
      expect(() => {
        render(
          <HabitatHero habitat={habitatWithNullBanner} {...mockHandlers} />
        );
      }).not.toThrow();

      expect(screen.queryByTestId("habitat-banner")).not.toBeInTheDocument();
    });
  });
});
