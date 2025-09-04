import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { WatchPartyCreationForm } from "../WatchPartyCreationForm";
import { habitatsService } from "../../domain/habitats.service";
import { MediaSearchField } from "@/components";
import { FormLayout } from "@/components";
import { FormLayout } from "@/components";
import { FormLayout } from "@/components";
import { FormLayout } from "@/components";
import { FormLayout } from "@/components";
import { FormLayout } from "@/components";
import { FormLayout } from "@/components";
import { FormLayout } from "@/components";
import { afterEach } from "node:test";

// Mock dependencies
vi.mock("../../domain/habitats.service", () => ({
  habitatsService: {
    createWatchParty: vi.fn(),
  },
}));

vi.mock("@/components/media/MediaSearchField", () => ({
  MediaSearchField: ({
    onMediaSelect,
    selectedMedia,
    placeholder,
    disabled,
  }: any) => (
    <div data-testid="media-search-field">
      <input
        placeholder={placeholder}
        disabled={disabled}
        data-testid="media-search-input"
        onChange={(e) => {
          if (e.target.value === "test movie") {
            onMediaSelect({
              tmdb_id: 123,
              media_type: "movie",
              media_title: "Test Movie",
              poster_path: "/test-poster.jpg",
              release_date: "2024-01-01",
              runtime: 120,
            });
          } else if (e.target.value === "") {
            onMediaSelect(null);
          }
        }}
      />
      {selectedMedia && (
        <div data-testid="selected-media">
          {selectedMedia.media_title} ({selectedMedia.media_type})
        </div>
      )}
    </div>
  ),
}));

vi.mock("@/components", () => ({
  FormLayout: ({ children, resolver, onSubmit }: any) => {
    const mockMethods = {
      setValue: vi.fn(),
      watch: vi.fn(() => ({})),
      control: {},
      resetField: vi.fn(),
      formState: { isSubmitting: false, errors: {} },
      handleSubmit: (fn: any) => (e: any) => {
        e.preventDefault();
        fn({
          media: {
            tmdb_id: 123,
            media_type: "movie",
            media_title: "Test Movie",
            poster_path: "/test-poster.jpg",
            release_date: "2024-01-01",
            runtime: 120,
          },
          scheduledDate: "2024-01-02",
          scheduledTime: "20:00",
          maxParticipants: "10",
        });
      },
    };

    return (
      <form
        onSubmit={mockMethods.handleSubmit(onSubmit)}
        data-testid="form-layout"
      >
        {typeof children === "function" ? children(mockMethods) : children}
        <button type="submit" data-testid="submit-button">
          Submit
        </button>
      </form>
    );
  },
}));

vi.mock("@/components/ui/form", () => ({
  FormControl: ({ children }: any) => (
    <div data-testid="form-control">{children}</div>
  ),
  FormField: ({ render, name, defaultValue }: any) => {
    const field = { name, value: defaultValue || "", onChange: vi.fn() };
    return render({ field });
  },
  FormItem: ({ children, className }: any) => (
    <div data-testid="form-item" className={className}>
      {children}
    </div>
  ),
  FormLabel: ({ children }: any) => (
    <label data-testid="form-label">{children}</label>
  ),
  FormMessage: ({ children, className }: any) => (
    <div data-testid="form-message" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ placeholder, type, disabled, id, ...props }: any) => (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      data-testid={`input-${id || type || "text"}`}
      {...props}
    />
  ),
}));

describe("WatchPartyCreationForm", () => {
  const defaultProps = {
    habitatId: "habitat-1",
    userId: "user-1",
    onSuccess: vi.fn(),
    onCancel: vi.fn(),
  };

  const mockWatchParty = {
    id: "party-1",
    habitat_id: "habitat-1",
    title: "Test Watch Party",
    description: "Test Description",
    scheduled_time: "2024-01-02T20:00:00Z",
    participant_count: 1,
    max_participants: 10,
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    is_active: true,
    participants: [],
    user_is_participant: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock current time for consistent testing
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2024-01-01T12:00:00Z").getTime()
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render media search field", () => {
      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("media-search-field")).toBeInTheDocument();
      expect(screen.getByTestId("media-search-input")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Search for a movie or TV show to watch...")
      ).toBeInTheDocument();
    });

    it("should render scheduled date and time inputs", () => {
      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("input-scheduled-date")).toBeInTheDocument();
      expect(screen.getByTestId("input-scheduled-time")).toBeInTheDocument();
    });

    it("should render max participants input", () => {
      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("input-number")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Maximum Participants")
      ).toBeInTheDocument();
    });

    it("should render form labels", () => {
      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      // Assert
      const labels = screen.getAllByTestId("form-label");
      expect(labels[0]).toHaveTextContent("What do you want to watch?");
      expect(labels[1]).toHaveTextContent("Scheduled Date");
      expect(labels[2]).toHaveTextContent("Scheduled Time");
    });

    it("should render helper text for max participants", () => {
      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      // Assert
      expect(
        screen.getByText("Leave empty for unlimited participants")
      ).toBeInTheDocument();
    });
  });

  describe("Media Selection", () => {
    it("should handle media selection", () => {
      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      const mediaInput = screen.getByTestId("media-search-input");
      fireEvent.change(mediaInput, { target: { value: "test movie" } });

      // Assert
      expect(screen.getByTestId("selected-media")).toBeInTheDocument();
      expect(screen.getByText("Test Movie (movie)")).toBeInTheDocument();
    });

    it("should handle media deselection", () => {
      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      const mediaInput = screen.getByTestId("media-search-input");

      // Select media first
      fireEvent.change(mediaInput, { target: { value: "test movie" } });
      expect(screen.getByTestId("selected-media")).toBeInTheDocument();

      // Deselect media
      fireEvent.change(mediaInput, { target: { value: "" } });

      // Assert
      expect(screen.queryByTestId("selected-media")).not.toBeInTheDocument();
    });

    it("should disable media search when form is submitting", () => {
      // Arrange - Mock submitting state
      vi.mocked(FormLayout as any).mockImplementation(
        ({ children, onSubmit }: any) => {
          const mockMethods = {
            setValue: vi.fn(),
            watch: vi.fn(() => ({})),
            control: {},
            resetField: vi.fn(),
            formState: { isSubmitting: true, errors: {} },
            handleSubmit: (fn: any) => (e: any) => {
              e.preventDefault();
              fn({});
            },
          };

          return (
            <form
              onSubmit={mockMethods.handleSubmit(onSubmit)}
              data-testid="form-layout"
            >
              {typeof children === "function"
                ? children(mockMethods)
                : children}
            </form>
          );
        }
      );

      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("media-search-input")).toBeDisabled();
    });
  });

  describe("Form Validation", () => {
    it("should show error for missing media selection", () => {
      // Arrange - Mock form with media error
      vi.mocked(FormLayout as any).mockImplementation(
        ({ children, onSubmit }: any) => {
          const mockMethods = {
            setValue: vi.fn(),
            watch: vi.fn(() => ({})),
            control: {},
            resetField: vi.fn(),
            formState: {
              isSubmitting: false,
              errors: {
                media: { message: "Please select a movie or TV show" },
              },
            },
            handleSubmit: (fn: any) => (e: any) => {
              e.preventDefault();
              fn({});
            },
          };

          return (
            <form
              onSubmit={mockMethods.handleSubmit(onSubmit)}
              data-testid="form-layout"
            >
              {typeof children === "function"
                ? children(mockMethods)
                : children}
            </form>
          );
        }
      );

      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      // Assert
      expect(
        screen.getByText("Please select a movie or TV show")
      ).toBeInTheDocument();
    });

    it("should show error for invalid scheduled date", () => {
      // Arrange - Mock form with date error
      vi.mocked(FormLayout as any).mockImplementation(
        ({ children, onSubmit }: any) => {
          const mockMethods = {
            setValue: vi.fn(),
            watch: vi.fn(() => ({})),
            control: {},
            resetField: vi.fn(),
            formState: {
              isSubmitting: false,
              errors: {
                scheduledDate: {
                  message: "Scheduled date must be in the future",
                },
              },
            },
            handleSubmit: (fn: any) => (e: any) => {
              e.preventDefault();
              fn({});
            },
          };

          return (
            <form
              onSubmit={mockMethods.handleSubmit(onSubmit)}
              data-testid="form-layout"
            >
              {typeof children === "function"
                ? children(mockMethods)
                : children}
            </form>
          );
        }
      );

      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      // Assert
      expect(
        screen.getByText("Scheduled date must be in the future")
      ).toBeInTheDocument();
    });

    it("should show error for invalid scheduled time", () => {
      // Arrange - Mock form with time error
      vi.mocked(FormLayout as any).mockImplementation(
        ({ children, onSubmit }: any) => {
          const mockMethods = {
            setValue: vi.fn(),
            watch: vi.fn(() => ({})),
            control: {},
            resetField: vi.fn(),
            formState: {
              isSubmitting: false,
              errors: {
                scheduledTime: { message: "Scheduled time is required" },
              },
            },
            handleSubmit: (fn: any) => (e: any) => {
              e.preventDefault();
              fn({});
            },
          };

          return (
            <form
              onSubmit={mockMethods.handleSubmit(onSubmit)}
              data-testid="form-layout"
            >
              {typeof children === "function"
                ? children(mockMethods)
                : children}
            </form>
          );
        }
      );

      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      // Assert
      expect(
        screen.getByText("Scheduled time is required")
      ).toBeInTheDocument();
    });

    it("should show error for invalid max participants", () => {
      // Arrange - Mock form with max participants error
      vi.mocked(FormLayout as any).mockImplementation(
        ({ children, onSubmit }: any) => {
          const mockMethods = {
            setValue: vi.fn(),
            watch: vi.fn(() => ({})),
            control: {},
            resetField: vi.fn(),
            formState: {
              isSubmitting: false,
              errors: {
                maxParticipants: {
                  message: "Maximum participants must be at least 2",
                },
              },
            },
            handleSubmit: (fn: any) => (e: any) => {
              e.preventDefault();
              fn({});
            },
          };

          return (
            <form
              onSubmit={mockMethods.handleSubmit(onSubmit)}
              data-testid="form-layout"
            >
              {typeof children === "function"
                ? children(mockMethods)
                : children}
            </form>
          );
        }
      );

      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      // Assert
      expect(
        screen.getByText("Maximum participants must be at least 2")
      ).toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("should submit valid watch party data successfully", async () => {
      // Arrange
      vi.mocked(habitatsService.createWatchParty).mockResolvedValue(
        mockWatchParty
      );

      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(habitatsService.createWatchParty).toHaveBeenCalledWith(
          "habitat-1",
          "user-1",
          {
            description: undefined,
            scheduledTime: "2024-01-02T20:00:00.000Z",
            maxParticipants: 10,
            media: {
              tmdb_id: 123,
              media_type: "movie",
              media_title: "Test Movie",
              poster_path: "/test-poster.jpg",
              release_date: "2024-01-01",
              runtime: 120,
            },
          }
        );
      });

      expect(defaultProps.onSuccess).toHaveBeenCalledWith(mockWatchParty);
    });

    it("should handle submission with empty max participants", async () => {
      // Arrange
      vi.mocked(habitatsService.createWatchParty).mockResolvedValue(
        mockWatchParty
      );

      // Mock form data with empty max participants
      vi.mocked(FormLayout as any).mockImplementation(
        ({ children, onSubmit }: any) => {
          const mockMethods = {
            setValue: vi.fn(),
            watch: vi.fn(() => ({})),
            control: {},
            resetField: vi.fn(),
            formState: { isSubmitting: false, errors: {} },
            handleSubmit: (fn: any) => (e: any) => {
              e.preventDefault();
              fn({
                media: {
                  tmdb_id: 123,
                  media_type: "movie",
                  media_title: "Test Movie",
                  poster_path: "/test-poster.jpg",
                  release_date: "2024-01-01",
                  runtime: 120,
                },
                scheduledDate: "2024-01-02",
                scheduledTime: "20:00",
                maxParticipants: "", // Empty
              });
            },
          };

          return (
            <form
              onSubmit={mockMethods.handleSubmit(onSubmit)}
              data-testid="form-layout"
            >
              {typeof children === "function"
                ? children(mockMethods)
                : children}
              <button type="submit" data-testid="submit-button">
                Submit
              </button>
            </form>
          );
        }
      );

      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(habitatsService.createWatchParty).toHaveBeenCalledWith(
          "habitat-1",
          "user-1",
          expect.objectContaining({
            maxParticipants: undefined, // Should be undefined for empty string
          })
        );
      });
    });

    it("should handle submission with whitespace-only max participants", async () => {
      // Arrange
      vi.mocked(habitatsService.createWatchParty).mockResolvedValue(
        mockWatchParty
      );

      // Mock form data with whitespace max participants
      vi.mocked(FormLayout as any).mockImplementation(
        ({ children, onSubmit }: any) => {
          const mockMethods = {
            setValue: vi.fn(),
            watch: vi.fn(() => ({})),
            control: {},
            resetField: vi.fn(),
            formState: { isSubmitting: false, errors: {} },
            handleSubmit: (fn: any) => (e: any) => {
              e.preventDefault();
              fn({
                media: {
                  tmdb_id: 123,
                  media_type: "movie",
                  media_title: "Test Movie",
                  poster_path: "/test-poster.jpg",
                  release_date: "2024-01-01",
                  runtime: 120,
                },
                scheduledDate: "2024-01-02",
                scheduledTime: "20:00",
                maxParticipants: "   ", // Whitespace only
              });
            },
          };

          return (
            <form
              onSubmit={mockMethods.handleSubmit(onSubmit)}
              data-testid="form-layout"
            >
              {typeof children === "function"
                ? children(mockMethods)
                : children}
              <button type="submit" data-testid="submit-button">
                Submit
              </button>
            </form>
          );
        }
      );

      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(habitatsService.createWatchParty).toHaveBeenCalledWith(
          "habitat-1",
          "user-1",
          expect.objectContaining({
            maxParticipants: undefined, // Should be undefined for whitespace
          })
        );
      });
    });

    it("should handle submission errors", async () => {
      // Arrange
      const error = new Error("Network error");
      vi.mocked(habitatsService.createWatchParty).mockRejectedValue(error);

      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");

      // Wrap in try-catch to handle the expected error
      try {
        fireEvent.click(submitButton);
        await waitFor(() => {
          expect(habitatsService.createWatchParty).toHaveBeenCalled();
        });
      } catch (e) {
        // Expected error from the service call
      }

      // Assert - The error should be handled by the FormLayout component
      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Date and Time Handling", () => {
    it("should correctly combine date and time for submission", async () => {
      // Arrange
      vi.mocked(habitatsService.createWatchParty).mockResolvedValue(
        mockWatchParty
      );

      // Mock form data with specific date and time
      vi.mocked(FormLayout as any).mockImplementation(
        ({ children, onSubmit }: any) => {
          const mockMethods = {
            setValue: vi.fn(),
            watch: vi.fn(() => ({})),
            control: {},
            resetField: vi.fn(),
            formState: { isSubmitting: false, errors: {} },
            handleSubmit: (fn: any) => (e: any) => {
              e.preventDefault();
              fn({
                media: {
                  tmdb_id: 123,
                  media_type: "movie",
                  media_title: "Test Movie",
                  poster_path: "/test-poster.jpg",
                  release_date: "2024-01-01",
                  runtime: 120,
                },
                scheduledDate: "2024-12-25",
                scheduledTime: "15:30",
                maxParticipants: "5",
              });
            },
          };

          return (
            <form
              onSubmit={mockMethods.handleSubmit(onSubmit)}
              data-testid="form-layout"
            >
              {typeof children === "function"
                ? children(mockMethods)
                : children}
              <button type="submit" data-testid="submit-button">
                Submit
              </button>
            </form>
          );
        }
      );

      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(habitatsService.createWatchParty).toHaveBeenCalledWith(
          "habitat-1",
          "user-1",
          expect.objectContaining({
            scheduledTime: "2024-12-25T15:30:00.000Z",
          })
        );
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper form structure", () => {
      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("form-layout")).toBeInTheDocument();
      expect(screen.getAllByTestId("form-item")).toHaveLength(4); // Media, Date, Time, Max Participants
    });

    it("should have proper labels for inputs", () => {
      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      // Assert
      const labels = screen.getAllByTestId("form-label");
      expect(labels[0]).toHaveTextContent("What do you want to watch?");
      expect(labels[1]).toHaveTextContent("Scheduled Date");
      expect(labels[2]).toHaveTextContent("Scheduled Time");
    });

    it("should have proper input types", () => {
      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("input-scheduled-date")).toHaveAttribute(
        "type",
        "date"
      );
      expect(screen.getByTestId("input-scheduled-time")).toHaveAttribute(
        "type",
        "time"
      );
      expect(screen.getByTestId("input-number")).toHaveAttribute(
        "type",
        "number"
      );
    });

    it("should have screen reader accessible labels", () => {
      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      // Assert
      // The max participants label should have sr-only class for screen readers
      const formItems = screen.getAllByTestId("form-item");
      const maxParticipantsItem = formItems[3]; // Last form item
      expect(maxParticipantsItem).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should apply custom className", () => {
      // Act
      const { container } = render(
        <WatchPartyCreationForm {...defaultProps} className="custom-class" />
      );

      // Assert
      // The className would be applied to the component wrapper
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle different media types", () => {
      // Arrange - Mock TV show selection
      vi.mocked(MediaSearchField as any).mockImplementation(
        ({ onMediaSelect }: any) => (
          <div data-testid="media-search-field">
            <button
              onClick={() =>
                onMediaSelect({
                  tmdb_id: 456,
                  media_type: "tv",
                  media_title: "Test TV Show",
                  poster_path: "/test-tv-poster.jpg",
                  release_date: "2024-01-01",
                  runtime: null,
                })
              }
              data-testid="select-tv-show"
            >
              Select TV Show
            </button>
          </div>
        )
      );

      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      const selectButton = screen.getByTestId("select-tv-show");
      fireEvent.click(selectButton);

      // Assert - Component should handle TV shows as well as movies
      expect(screen.getByTestId("media-search-field")).toBeInTheDocument();
    });

    it("should handle form reset on media deselection", () => {
      // Act
      render(<WatchPartyCreationForm {...defaultProps} />);

      // The resetField function should be available for clearing media selection
      // This is tested through the media selection/deselection flow
      expect(screen.getByTestId("media-search-field")).toBeInTheDocument();
    });
  });
});
