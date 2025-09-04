import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client - must be defined before the mock
vi.mock("@/utils/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

import {
  withTransaction,
  TransactionContext,
  TransactionError,
} from "../database-transaction";
import { supabase } from "@/utils/supabase/client";

const mockSupabase = supabase as any;

describe("database-transaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.rpc.mockReset();
  });

  describe("withTransaction", () => {
    it("should execute operation and commit on success", async () => {
      // Arrange
      const mockOperation = vi.fn().mockResolvedValue("success");
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await withTransaction(mockOperation);

      // Assert
      expect(result).toBe("success");
      expect(mockSupabase.rpc).toHaveBeenCalledWith("begin_transaction");
      expect(mockSupabase.rpc).toHaveBeenCalledWith("commit_transaction");
      expect(mockOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          commit: expect.any(Function),
          rollback: expect.any(Function),
        })
      );
    });

    it("should rollback transaction on operation failure", async () => {
      // Arrange
      const error = new Error("Operation failed");
      const mockOperation = vi.fn().mockRejectedValue(error);
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      // Act & Assert
      await expect(withTransaction(mockOperation)).rejects.toThrow(
        "Operation failed"
      );
      expect(mockSupabase.rpc).toHaveBeenCalledWith("begin_transaction");
      expect(mockSupabase.rpc).toHaveBeenCalledWith("rollback_transaction");
      expect(mockSupabase.rpc).not.toHaveBeenCalledWith("commit_transaction");
    });

    it("should provide transaction context with commit and rollback methods", async () => {
      // Arrange
      let capturedContext: TransactionContext | null = null;
      const mockOperation = vi
        .fn()
        .mockImplementation((ctx: TransactionContext) => {
          capturedContext = ctx;
          return Promise.resolve("success");
        });
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      // Act
      await withTransaction(mockOperation);

      // Assert
      expect(capturedContext).not.toBeNull();
      expect(capturedContext).toHaveProperty("commit");
      expect(capturedContext).toHaveProperty("rollback");
      expect(typeof capturedContext?.commit).toBe("function");
      expect(typeof capturedContext?.rollback).toBe("function");
    });

    it("should handle transaction begin failure", async () => {
      // Arrange
      const mockOperation = vi.fn();
      const beginError = new Error("Failed to begin transaction");
      mockSupabase.rpc.mockRejectedValue(beginError);

      // Act & Assert
      await expect(withTransaction(mockOperation)).rejects.toThrow(
        "Failed to begin transaction"
      );
      expect(mockOperation).not.toHaveBeenCalled();
    });

    it("should handle commit failure", async () => {
      // Arrange
      const mockOperation = vi.fn().mockResolvedValue("success");
      mockSupabase.rpc
        .mockResolvedValueOnce({ data: null, error: null }) // begin_transaction
        .mockRejectedValueOnce(new Error("Commit failed")); // commit_transaction

      // Act & Assert
      await expect(withTransaction(mockOperation)).rejects.toThrow(
        "Failed to commit transaction"
      );
      expect(mockOperation).toHaveBeenCalled();
    });

    it("should handle rollback failure gracefully", async () => {
      // Arrange
      const operationError = new Error("Operation failed");
      const rollbackError = new Error("Rollback failed");
      const mockOperation = vi.fn().mockRejectedValue(operationError);
      mockSupabase.rpc
        .mockResolvedValueOnce({ data: null, error: null }) // begin_transaction
        .mockRejectedValueOnce(rollbackError); // rollback_transaction

      // Act & Assert
      await expect(withTransaction(mockOperation)).rejects.toThrow(
        "Transaction failed: Operation failed"
      );
      expect(mockSupabase.rpc).toHaveBeenCalledWith("rollback_transaction");
    });
  });

  describe("TransactionError", () => {
    it("should create TransactionError with proper properties", () => {
      // Arrange
      const cause = new Error("Original error");

      // Act
      const error = new TransactionError("Transaction failed", cause, true);

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TransactionError);
      expect(error.name).toBe("TransactionError");
      expect(error.message).toBe("Transaction failed");
      expect(error.cause).toBe(cause);
      expect(error.rollbackSuccessful).toBe(true);
    });

    it("should handle TransactionError without optional parameters", () => {
      // Act
      const error = new TransactionError("Simple error");

      // Assert
      expect(error.message).toBe("Simple error");
      expect(error.cause).toBeUndefined();
      expect(error.rollbackSuccessful).toBeUndefined();
    });
  });

  describe("TransactionContext methods", () => {
    it("should allow manual commit through context", async () => {
      // Arrange
      let context: TransactionContext | null = null;
      const mockOperation = vi
        .fn()
        .mockImplementation(async (ctx: TransactionContext) => {
          context = ctx;
          await ctx.commit();
          return "manual commit";
        });
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await withTransaction(mockOperation);

      // Assert
      expect(result).toBe("manual commit");
      expect(mockSupabase.rpc).toHaveBeenCalledWith("commit_transaction");
    });

    it("should allow manual rollback through context", async () => {
      // Arrange
      let context: TransactionContext | null = null;
      const mockOperation = vi
        .fn()
        .mockImplementation(async (ctx: TransactionContext) => {
          context = ctx;
          await ctx.rollback();
          return "manual rollback";
        });
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await withTransaction(mockOperation);

      // Assert
      expect(result).toBe("manual rollback");
      expect(mockSupabase.rpc).toHaveBeenCalledWith("rollback_transaction");
    });

    it("should prevent double commit calls", async () => {
      // Arrange
      let context: TransactionContext | null = null;
      const mockOperation = vi
        .fn()
        .mockImplementation(async (ctx: TransactionContext) => {
          context = ctx;
          await ctx.commit();
          await ctx.commit(); // Second call should be ignored
          return "double commit";
        });
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await withTransaction(mockOperation);

      // Assert
      expect(result).toBe("double commit");
      expect(mockSupabase.rpc).toHaveBeenCalledWith("begin_transaction");
      expect(mockSupabase.rpc).toHaveBeenCalledWith("commit_transaction");
      // Should only call commit once despite two calls
      expect(mockSupabase.rpc).toHaveBeenCalledTimes(2);
    });

    it("should prevent double rollback calls", async () => {
      // Arrange
      let context: TransactionContext | null = null;
      const mockOperation = vi
        .fn()
        .mockImplementation(async (ctx: TransactionContext) => {
          context = ctx;
          await ctx.rollback();
          await ctx.rollback(); // Second call should be ignored
          return "double rollback";
        });
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await withTransaction(mockOperation);

      // Assert
      expect(result).toBe("double rollback");
      expect(mockSupabase.rpc).toHaveBeenCalledWith("begin_transaction");
      expect(mockSupabase.rpc).toHaveBeenCalledWith("rollback_transaction");
      // Should only call rollback once despite two calls
      expect(mockSupabase.rpc).toHaveBeenCalledTimes(2);
    });
  });
});
