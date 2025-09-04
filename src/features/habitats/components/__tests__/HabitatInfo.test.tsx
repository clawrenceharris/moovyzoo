import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HabitatInfo } from "../HabitatInfo";
import type {
  HabitatWithMembership,
  HabitatMember,
} from "../../domain/habitats.types";

describe("HabitatInfo", () => {
  const mockHabitat: HabitatWithMembership = {
    id: "habitat-1",
    name: "Sci-Fi Universe",
    description: "Explore the depths of science fiction",
    tags: ["sci-fi", "space", "future", "technology"],
    member_count: 150,
    is_public: true,
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    is_member: true,
    role: "member",
  };

  const mockMembers: HabitatMember[] = [
    {
      habitat_id: "habitat-1",
      user_id: "user-1",
      joined_at: "2024-01-01T00:00:00Z",
      last_active: "2024-01-01T12:00:00Z",
    },
    {
      habitat_id: "habitat-1",
      user_id: "user-2",
      joined_at: "2024-01-01T06:00:00Z",
      last_active: "2024-01-01T11:30:00Z",
    },
    {
      habitat_id: "habitat-1",
      user_id: "user-3",
      joined_at: "2024-01-01T08:00:00Z",
      last_active: "2024-01-01T10:00:00Z",
    },
  ];

  const mockOnlineMembers = ["user-1", "user-2"];

  const defaultProps = {
    habitat: mockHabitat,
    members: mockMembers,
    onlineMembers: mockOnlineMembers,
    onViewAllMembers: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render habitat name", () => {
      // Act
      render(<HabitatInfo {...defaultProps} />);

      // Assert
      expect(screen.getByText("Sci-Fi Universe")).toBeInTheDocument();
    });

    it("should render habitat description", () => {
      // Act
      render(<HabitatInfo {...defaultProps} />);

      // Assert
      expect(
        screen.getByText("Explore the depths of science fiction")
      ).toBeInTheDocument();
    });

    it("should render habitat tags", () => {
      // Act
      render(<HabitatInfo {...defaultProps} />);

      // Assert
      expect(screen.getByText("sci-fi")).toBeInTheDocument();
      expect(screen.getByText("space")).toBeInTheDocument();
      expect(screen.getByText("future")).toBeInTheDocument();
      expect(screen.getByText("technology")).toBeInTheDocument();
    });

    it("should render creation date", () => {
      // Act
      render(<HabitatInfo {...defaultProps} />);

      // Assert
      // The exact format may vary based on locale, but should contain the date
      expect(screen.getByText(/Created/)).toBeInTheDocument();
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it("should render member count", () => {
      // Act
      render(<HabitatInfo {...defaultProps} />);

      // Assert
      expect(screen.getByText("150")).toBeInTheDocument();
      expect(screen.getByText(/members/i)).toBeInTheDocument();
    });

    it("should render online member count", () => {
      // Act
      render(<HabitatInfo {...defaultProps} />);

      // Assert
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText(/online/i)).toBeInTheDocument();
    });
  });

  describe("Member Information", () => {
    it("should display correct online member count", () => {
      // Act
      render(<HabitatInfo {...defaultProps} />);

      // Assert
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should handle zero online members", () => {
      // Act
      render(<HabitatInfo {...defaultProps} onlineMembers={[]} />);

      // Assert
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should handle single online member", () => {
      // Act
      render(<HabitatInfo {...defaultProps} onlineMembers={["user-1"]} />);

      // Assert
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("should call onViewAllMembers when view all button is clicked", () => {
      // Act
      render(<HabitatInfo {...defaultProps} />);

      // Find and click the view all members button
      const viewAllButton = screen.getByRole("button", { name: /view all/i });
      fireEvent.click(viewAllButton);

      // Assert
      expect(defaultProps.onViewAllMembers).toHaveBeenCalledTimes(1);
    });
  });

  describe("Tags Display", () => {
    it("should render all tags when there are few tags", () => {
      // Arrange
      const habitatWithFewTags = {
        ...mockHabitat,
        tags: ["sci-fi", "space"],
      };

      // Act
      render(<HabitatInfo {...defaultProps} habitat={habitatWithFewTags} />);

      // Assert
      expect(screen.getByText("sci-fi")).toBeInTheDocument();
      expect(screen.getByText("space")).toBeInTheDocument();
    });

    it("should handle empty tags array", () => {
      // Arrange
      const habitatWithNoTags = {
        ...mockHabitat,
        tags: [],
      };

      // Act & Assert
      expect(() => {
        render(<HabitatInfo {...defaultProps} habitat={habitatWithNoTags} />);
      }).not.toThrow();
    });

    it("should handle very long tag names", () => {
      // Arrange
      const habitatWithLongTags = {
        ...mockHabitat,
        tags: ["very-long-tag-name-that-might-cause-layout-issues"],
      };

      // Act & Assert
      expect(() => {
        render(<HabitatInfo {...defaultProps} habitat={habitatWithLongTags} />);
      }).not.toThrow();

      expect(
        screen.getByText("very-long-tag-name-that-might-cause-layout-issues")
      ).toBeInTheDocument();
    });
  });

  describe("Visibility and Privacy", () => {
    it("should indicate public habitat", () => {
      // Act
      render(<HabitatInfo {...defaultProps} />);

      // Assert
      expect(screen.getByText(/public/i)).toBeInTheDocument();
    });

    it("should indicate private habitat", () => {
      // Arrange
      const privateHabitat = {
        ...mockHabitat,
        is_public: false,
      };

      // Act
      render(<HabitatInfo {...defaultProps} habitat={privateHabitat} />);

      // Assert
      expect(screen.getByText(/private/i)).toBeInTheDocument();
    });
  });

  describe("User Role Display", () => {
    it("should display member role", () => {
      // Act
      render(<HabitatInfo {...defaultProps} />);

      // Assert
      expect(screen.getByText(/member/i)).toBeInTheDocument();
    });

    it("should display admin role", () => {
      // Arrange
      const habitatWithAdminRole = {
        ...mockHabitat,
        role: "admin" as const,
      };

      // Act
      render(<HabitatInfo {...defaultProps} habitat={habitatWithAdminRole} />);

      // Assert
      expect(screen.getByText(/admin/i)).toBeInTheDocument();
    });

    it("should display owner role", () => {
      // Arrange
      const habitatWithOwnerRole = {
        ...mockHabitat,
        role: "owner" as const,
      };

      // Act
      render(<HabitatInfo {...defaultProps} habitat={habitatWithOwnerRole} />);

      // Assert
      expect(screen.getByText(/owner/i)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading structure", () => {
      // Act
      render(<HabitatInfo {...defaultProps} />);

      // Assert
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });

    it("should have accessible button for viewing all members", () => {
      // Act
      render(<HabitatInfo {...defaultProps} />);

      // Assert
      expect(
        screen.getByRole("button", { name: /view all/i })
      ).toBeInTheDocument();
    });

    it("should have proper semantic structure for member counts", () => {
      // Act
      render(<HabitatInfo {...defaultProps} />);

      // Assert
      // Member counts should be clearly labeled
      expect(screen.getByText(/members/i)).toBeInTheDocument();
      expect(screen.getByText(/online/i)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing description", () => {
      // Arrange
      const habitatWithoutDescription = {
        ...mockHabitat,
        description: "",
      };

      // Act & Assert
      expect(() => {
        render(
          <HabitatInfo {...defaultProps} habitat={habitatWithoutDescription} />
        );
      }).not.toThrow();
    });

    it("should handle zero member count", () => {
      // Arrange
      const habitatWithZeroMembers = {
        ...mockHabitat,
        member_count: 0,
      };

      // Act
      render(
        <HabitatInfo
          {...defaultProps}
          habitat={habitatWithZeroMembers}
          members={[]}
        />
      );

      // Assert
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should handle very large member counts", () => {
      // Arrange
      const habitatWithManyMembers = {
        ...mockHabitat,
        member_count: 999999,
      };

      // Act & Assert
      expect(() => {
        render(
          <HabitatInfo {...defaultProps} habitat={habitatWithManyMembers} />
        );
      }).not.toThrow();

      expect(screen.getByText("999999")).toBeInTheDocument();
    });

    it("should handle undefined onViewAllMembers callback", () => {
      // Act & Assert
      expect(() => {
        render(
          <HabitatInfo {...defaultProps} onViewAllMembers={undefined as any} />
        );
      }).not.toThrow();
    });

    it("should handle empty members array", () => {
      // Act & Assert
      expect(() => {
        render(<HabitatInfo {...defaultProps} members={[]} />);
      }).not.toThrow();
    });

    it("should handle undefined online members", () => {
      // Act & Assert
      expect(() => {
        render(
          <HabitatInfo {...defaultProps} onlineMembers={undefined as any} />
        );
      }).not.toThrow();
    });
  });

  describe("Date Formatting", () => {
    it("should handle different date formats", () => {
      // Arrange
      const habitatWithDifferentDate = {
        ...mockHabitat,
        created_at: "2023-12-25T15:30:00Z",
      };

      // Act & Assert
      expect(() => {
        render(
          <HabitatInfo {...defaultProps} habitat={habitatWithDifferentDate} />
        );
      }).not.toThrow();

      expect(screen.getByText(/Created/)).toBeInTheDocument();
    });

    it("should handle invalid date gracefully", () => {
      // Arrange
      const habitatWithInvalidDate = {
        ...mockHabitat,
        created_at: "invalid-date",
      };

      // Act & Assert
      expect(() => {
        render(
          <HabitatInfo {...defaultProps} habitat={habitatWithInvalidDate} />
        );
      }).not.toThrow();
    });
  });
});
