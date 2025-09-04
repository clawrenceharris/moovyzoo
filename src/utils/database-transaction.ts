import { supabase } from "@/utils/supabase/client";

/**
 * Error thrown when a transaction operation fails.
 */
export class TransactionError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
    public readonly rollbackSuccessful?: boolean
  ) {
    super(message);
    this.name = "TransactionError";
  }
}

/**
 * Transaction context providing manual commit and rollback operations.
 * Each method can only be called once per transaction.
 */
export interface TransactionContext {
  /**
   * Manually commit the transaction.
   * If called, prevents auto-commit at the end of the operation.
   */
  commit(): Promise<void>;

  /**
   * Manually rollback the transaction.
   * If called, prevents auto-rollback on error.
   */
  rollback(): Promise<void>;
}

/**
 * Executes an operation within a database transaction.
 *
 * Automatically begins a transaction, executes the operation, and commits on success.
 * If the operation throws an error, the transaction is automatically rolled back.
 *
 * The operation can manually commit or rollback using the provided context methods.
 * Manual commit/rollback prevents automatic transaction completion.
 *
 * @param operation - Function to execute within the transaction
 * @returns Promise resolving to the operation result
 * @throws Re-throws any error from the operation after attempting rollback
 *
 * @example
 * ```typescript
 * // Auto-commit on success
 * const result = await withTransaction(async (ctx) => {
 *   await updateHabitat(habitatId, data);
 *   await updateMemberCount(habitatId);
 *   return "success";
 * });
 *
 * // Manual commit
 * await withTransaction(async (ctx) => {
 *   await updateHabitat(habitatId, data);
 *   if (shouldCommit) {
 *     await ctx.commit();
 *   } else {
 *     await ctx.rollback();
 *   }
 * });
 * ```
 */
export async function withTransaction<T>(
  operation: (ctx: TransactionContext) => Promise<T>
): Promise<T> {
  // Begin transaction
  try {
    await supabase.rpc("begin_transaction");
  } catch (error) {
    throw new TransactionError(
      "Failed to begin transaction",
      error instanceof Error ? error : new Error(String(error))
    );
  }

  let transactionCompleted = false;

  const context: TransactionContext = {
    commit: async () => {
      if (!transactionCompleted) {
        try {
          await supabase.rpc("commit_transaction");
          transactionCompleted = true;
        } catch (error) {
          throw new TransactionError(
            "Failed to commit transaction",
            error instanceof Error ? error : new Error(String(error))
          );
        }
      }
    },
    rollback: async () => {
      if (!transactionCompleted) {
        try {
          await supabase.rpc("rollback_transaction");
          transactionCompleted = true;
        } catch (error) {
          throw new TransactionError(
            "Failed to rollback transaction",
            error instanceof Error ? error : new Error(String(error))
          );
        }
      }
    },
  };

  try {
    const result = await operation(context);

    // Auto-commit if operation succeeds and no manual commit/rollback was called
    if (!transactionCompleted) {
      try {
        await supabase.rpc("commit_transaction");
        transactionCompleted = true;
      } catch (error) {
        throw new TransactionError(
          "Failed to commit transaction",
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }

    return result;
  } catch (error) {
    // Auto-rollback on error if not already completed
    if (!transactionCompleted) {
      let rollbackSuccessful = false;
      try {
        await supabase.rpc("rollback_transaction");
        transactionCompleted = true;
        rollbackSuccessful = true;
      } catch (rollbackError) {
        // Log rollback error but still throw original error
        console.error("Failed to rollback transaction:", rollbackError);
        rollbackSuccessful = false;
      }

      // If the original error is already a TransactionError, preserve it
      if (error instanceof TransactionError) {
        throw error;
      }

      // Wrap other errors in TransactionError with rollback status
      throw new TransactionError(
        `Transaction failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error : new Error(String(error)),
        rollbackSuccessful
      );
    }

    throw error;
  }
}
