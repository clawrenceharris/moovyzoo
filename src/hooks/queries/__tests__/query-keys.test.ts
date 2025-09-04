/**
 * Unit tests for query key factory
 */

import { describe, it, expect } from "vitest";
import { queryKeys, queryKeyHelpers } from "../query-keys";

describe("queryKeys", () => {
  describe("habitats", () => {
    it("should generate correct habitat query keys", () => {
      expect(queryKeys.habitats.all).toEqual(["habitats"]);
      expect(queryKeys.habitats.lists()).toEqual(["habitats", "list"]);
      expect(queryKeys.habitats.detail("123")).toEqual([
        "habitats",
        "detail",
        "123",
      ]);
      expect(queryKeys.habitats.dashboard("123")).toEqual([
        "habitats",
        "detail",
        "123",
        "dashboard",
      ]);
    });

    it("should generate correct habitat list keys with filters", () => {
      const filters = { genre: "sci-fi", public: true };
      expect(queryKeys.habitats.list(filters)).toEqual([
        "habitats",
        "list",
        { filters },
      ]);
    });
  });

  describe("discussions", () => {
    it("should generate correct discussion query keys", () => {
      expect(queryKeys.discussions.all).toEqual(["discussions"]);
      expect(queryKeys.discussions.byHabitat("habitat-123")).toEqual([
        "discussions",
        "list",
        "habitat",
        "habitat-123",
      ]);
      expect(queryKeys.discussions.detail("discussion-456")).toEqual([
        "discussions",
        "detail",
        "discussion-456",
      ]);
    });
  });

  describe("messages", () => {
    it("should generate correct message query keys", () => {
      expect(queryKeys.messages.all).toEqual(["messages"]);
      expect(queryKeys.messages.byHabitat("habitat-123")).toEqual([
        "messages",
        "habitat",
        "habitat-123",
      ]);
      expect(queryKeys.messages.byDiscussion("discussion-456")).toEqual([
        "messages",
        "discussion",
        "discussion-456",
      ]);
    });
  });
});

describe("queryKeyHelpers", () => {
  it("should provide correct invalidation keys for habitats", () => {
    const habitatId = "habitat-123";
    const invalidationKeys =
      queryKeyHelpers.getHabitatInvalidationKeys(habitatId);

    expect(invalidationKeys).toContainEqual(
      queryKeys.habitats.detail(habitatId)
    );
    expect(invalidationKeys).toContainEqual(
      queryKeys.habitats.dashboard(habitatId)
    );
    expect(invalidationKeys).toContainEqual(
      queryKeys.discussions.byHabitat(habitatId)
    );
    expect(invalidationKeys).toContainEqual(
      queryKeys.messages.byHabitat(habitatId)
    );
  });

  it("should provide correct invalidation keys for discussions", () => {
    const discussionId = "discussion-456";
    const habitatId = "habitat-123";
    const invalidationKeys = queryKeyHelpers.getDiscussionInvalidationKeys(
      discussionId,
      habitatId
    );

    expect(invalidationKeys).toContainEqual(
      queryKeys.discussions.detail(discussionId)
    );
    expect(invalidationKeys).toContainEqual(
      queryKeys.discussions.byHabitat(habitatId)
    );
    expect(invalidationKeys).toContainEqual(
      queryKeys.messages.byDiscussion(discussionId)
    );
    expect(invalidationKeys).toContainEqual(
      queryKeys.habitats.dashboard(habitatId)
    );
  });
});
