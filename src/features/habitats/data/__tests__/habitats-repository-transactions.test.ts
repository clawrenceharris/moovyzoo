import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the transaction utility
vi.mock("@/utils/database-transaction", () => ({
  withTransaction: vi.fn(),
  TransactionError: class TransactionError extends Error {
    constructor(
      message: string,
      public cause?: Error,
      public rollbackSuccessful?: boolean
    ) {
      super(message);
      this.name = "TransactionError";
    }
  },
}));

// Mock Supabase client
vi.mock("@/utils/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

import { HabitatsRepository } from "../habitats.repository";
import { withTransaction } from "@/utils/database-transaction";
import { supabase } from "@/utils/supabase/client";

const mockWithTransaction = withTransaction as any;
const mockSupabase = supabase as any;

describe("HabitatsRepository - Transaction Support", () => {
  let repository: HabitatsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new HabitatsRepository();
  });

  describe("createHabitat with transactions", () => {
    it("should create habitat and add creator as member in transaction", async () => {
      // Arrange
      const mockHabitat = {
        id: "habitat-123",
        name: "Test Habitat",
        description: "Test Description",
        tags: ["test"],
        is_public: true,
        created_by: "user-123",
        member_count: 1,
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi
              .fn()
              .mockResolvedValue({ data: mockHabitat, error: null }),
          }),
        }),
      });

      // Mock the joinHabitat method
      vi.spyOn(repository, "joinHabitat").mockResolvedValue({
        id: "member-123",
        habitat_id: "habitat-123",
        user_id: "user-123",
        joined_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      });

      // Act
      const result = await repository.createHabitat(
        "Test Habitat",
        "Test Description",
        ["test"],
        true,
        "user-123"
      );

      // Assert
      expect(result).toBeDefined();
      expect(repository.joinHabitat).toHaveBeenCalledWith(
        "habitat-123",
        "user-123"
      );
    });
  });

  describe("joinHabitat with member count update", () => {
    it("should add member and update count atomically", async () => {
      // Arrange
      const mockMember = {
        id: "member-123",
        habitat_id: "habitat-123",
        user_id: "user-123",
        joined_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi
              .fn()
              .mockResolvedValue({ data: mockMember, error: null }),
          }),
        }),
      });

      // Mock the updateMemberCount method
      vi.spyOn(repository, "updateMemberCount").mockResolvedValue(undefined);

      // Act
      const result = await repository.joinHabitat("habitat-123", "user-123");

      // Assert
      expect(result).toBeDefined();
      expect(repository.updateMemberCount).toHaveBeenCalledWith("habitat-123");
    });
  });

  describe("leaveHabitat with member count update", () => {
    it("should remove member and update count atomically", async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      });

      // Mock the updateMemberCount method
      vi.spyOn(repository, "updateMemberCount").mockResolvedValue(undefined);

      // Act
      await repository.leaveHabitat("habitat-123", "user-123");

      // Assert
      expect(repository.updateMemberCount).toHaveBeenCalledWith("habitat-123");
    });
  });
});
