import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRecommendations } from "../use-recommendations";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockRecommendationsResponse = {
  success: true,
  data: {
    content_recommendations: [
      {
        tmdb_id: 12345,
        title: "Inception",
        media_type: "movie",
        match_score: 85,
        short_explanation: "Matches your love for sci-fi thrillers",
      },
    ],
    friend_suggestions: [
      {
        user_id: "user-123",
        display_name: "John Doe",
        taste_match_score: 92,
        short_rationale: "Also gave Parasite & Whiplash 9/10",
      },
    ],
    cached: false,
    generated_at: "2024-01-15T10:00:00Z",
  },
};

describe("useRecommendations", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("should fetch recommendations successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRecommendationsResponse,
    });

    const { result } = renderHook(() => useRecommendations("user-123"));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recommendations).toEqual(mockRecommendationsResponse.data);
    expect(result.current.error).toBeNull();
  });

  it("should handle fetch error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to load recommendations" }),
    });

    const { result } = renderHook(() => useRecommendations("user-123"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recommendations).toBeNull();
    expect(result.current.error).toBe("Failed to load recommendations");
  });

  it("should refresh recommendations when refreshRecommendations is called", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecommendationsResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            ...mockRecommendationsResponse.data,
            generated_at: "2024-01-15T11:00:00Z",
          },
        }),
      });

    const { result } = renderHook(() => useRecommendations("user-123"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.refreshRecommendations();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenLastCalledWith("/api/recommendations/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ force_refresh: true }),
    });
  });

  it("should not fetch when userId is not provided", () => {
    renderHook(() => useRecommendations(undefined));

    expect(mockFetch).not.toHaveBeenCalled();
  });
});