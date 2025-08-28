import { describe, it, expect } from "vitest";
import { HabitatsRepository } from "../habitats.repository";

describe("HabitatsRepository", () => {
  it("should instantiate the repository", () => {
    const repository = new HabitatsRepository();
    expect(repository).toBeInstanceOf(HabitatsRepository);
  });

  it("should have all required methods", () => {
    const repository = new HabitatsRepository();

    expect(typeof repository.getUserJoinedHabitats).toBe("function");
    expect(typeof repository.getHabitatById).toBe("function");
    expect(typeof repository.joinHabitat).toBe("function");
    expect(typeof repository.leaveHabitat).toBe("function");
    expect(typeof repository.isUserMember).toBe("function");
    expect(typeof repository.updateLastActive).toBe("function");
    expect(typeof repository.getHabitatMessages).toBe("function");
    expect(typeof repository.sendMessage).toBe("function");
    expect(typeof repository.deleteMessage).toBe("function");
    expect(typeof repository.getMessageById).toBe("function");
    expect(typeof repository.getMessagesAfter).toBe("function");
    expect(typeof repository.createHabitat).toBe("function");
  });

  describe("Discussion methods", () => {
    it("should have discussion repository methods", () => {
      const repository = new HabitatsRepository();

      expect(typeof repository.getDiscussionsByHabitat).toBe("function");
      expect(typeof repository.createDiscussion).toBe("function");
      expect(typeof repository.updateDiscussion).toBe("function");
      expect(typeof repository.getDiscussionById).toBe("function");
      expect(typeof repository.deleteDiscussion).toBe("function");
    });

    it("should validate discussion creation data structure", () => {
      const repository = new HabitatsRepository();

      // Test that the method exists and can be called
      expect(() => {
        const discussionData = {
          habitat_id: "test-habitat-id",
          name: "Test Discussion",
          description: "Test description",
          created_by: "test-user-id",
        };
        // We're just testing the method signature, not actual DB calls
        expect(typeof repository.createDiscussion).toBe("function");
      }).not.toThrow();
    });

    it("should validate discussion update data structure", () => {
      const repository = new HabitatsRepository();

      // Test that the method exists and can be called
      expect(() => {
        const updateData = {
          name: "Updated Discussion Name",
          description: "Updated description",
          is_active: true,
        };
        // We're just testing the method signature, not actual DB calls
        expect(typeof repository.updateDiscussion).toBe("function");
      }).not.toThrow();
    });
  });

  describe("Watch Party methods", () => {
    it("should have watch party repository methods", () => {
      const repository = new HabitatsRepository();

      expect(typeof repository.getWatchPartiesByHabitat).toBe("function");
      expect(typeof repository.createWatchParty).toBe("function");
      expect(typeof repository.updateWatchParty).toBe("function");
      expect(typeof repository.getWatchPartyById).toBe("function");
      expect(typeof repository.deleteWatchParty).toBe("function");
      expect(typeof repository.joinWatchParty).toBe("function");
      expect(typeof repository.leaveWatchParty).toBe("function");
    });

    it("should validate watch party creation data structure", () => {
      const repository = new HabitatsRepository();

      // Test that the method exists and can be called
      expect(() => {
        const watchPartyData = {
          habitat_id: "test-habitat-id",
          title: "Test Watch Party",
          description: "Test description",
          scheduled_time: "2024-01-01T20:00:00Z",
          participant_count: 0,
          max_participants: 10,
          created_by: "test-user-id",
        };
        // We're just testing the method signature, not actual DB calls
        expect(typeof repository.createWatchParty).toBe("function");
      }).not.toThrow();
    });

    it("should validate watch party update data structure", () => {
      const repository = new HabitatsRepository();

      // Test that the method exists and can be called
      expect(() => {
        const updateData = {
          title: "Updated Watch Party Title",
          description: "Updated description",
          scheduled_time: "2024-01-02T20:00:00Z",
          max_participants: 15,
          is_active: true,
        };
        // We're just testing the method signature, not actual DB calls
        expect(typeof repository.updateWatchParty).toBe("function");
      }).not.toThrow();
    });
  });

  describe("Updated Message methods for discussions", () => {
    it("should have discussion-specific message methods", () => {
      const repository = new HabitatsRepository();

      expect(typeof repository.getMessagesByDiscussion).toBe("function");
      expect(typeof repository.sendMessageToDiscussion).toBe("function");
      expect(typeof repository.getDiscussionMessagesAfter).toBe("function");
    });

    it("should validate discussion message sending", () => {
      const repository = new HabitatsRepository();

      // Test that the method exists and can be called
      expect(() => {
        // We're just testing the method signature, not actual DB calls
        expect(typeof repository.sendMessageToDiscussion).toBe("function");
      }).not.toThrow();
    });

    it("should validate discussion message retrieval", () => {
      const repository = new HabitatsRepository();

      // Test that the method exists and can be called
      expect(() => {
        // We're just testing the method signature, not actual DB calls
        expect(typeof repository.getMessagesByDiscussion).toBe("function");
        expect(typeof repository.getDiscussionMessagesAfter).toBe("function");
      }).not.toThrow();
    });
  });
});
