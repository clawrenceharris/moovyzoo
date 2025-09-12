/**
 * Base mutation hook with common logic and error handling
 * Provides consistent mutation behavior across the Habitats feature
 */

import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
  MutationFunction,
} from "@tanstack/react-query";
import { normalizeError } from "@/utils/normalize-error";
import { AppErrorCode } from "@/utils/error-codes";

/**
 * Base mutation result interface
 */
export interface MutationResult<T> {
  data?: T;
  error?: {
    code: AppErrorCode;
    message: string;
    details?: Record<string, any>;
  };
  success: boolean;
}

/**
 * Enhanced mutation options with error handling and cache invalidation
 */
export interface BaseMutationOptions<TData, TError, TVariables, TContext>
  extends Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    "mutationFn"
  > {
  /**
   * Query keys to invalidate on successful mutation
   */
  invalidateQueries?: readonly (readonly string[])[];

  /**
   * Query keys to remove from cache on successful mutation
   */
  removeQueries?: readonly (readonly string[])[];

  /**
   * Custom success handler
   */
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;

  /**
   * Custom error handler
   */
  onError?: (
    error: TError,
    variables: TVariables,
    context: TContext | undefined
  ) => void;

  /**
   * Show success toast message
   */
  successMessage?: string;

  /**
   * Show error toast message (if not provided, uses normalized error message)
   */
  errorMessage?: string;

  /**
   * Enable optimistic updates
   */
  optimistic?: boolean;
}

/**
 * Base mutation hook with consistent error handling and cache management
 */
export function useBaseMutation<
  TData,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  mutationFn: MutationFunction<TData, TVariables>,
  options: BaseMutationOptions<TData, TError, TVariables, TContext> = {}
): UseMutationResult<TData, TError, TVariables, TContext> {
  const queryClient = useQueryClient();

  const {
    invalidateQueries = [],
    removeQueries = [],
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    optimistic = false,
    ...mutationOptions
  } = options;

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      try {
        return await mutationFn(variables);
      } catch (error) {
        // Normalize error for consistent handling
        const normalizedError = normalizeError(error);
        throw normalizedError;
      }
    },
    onSuccess: async (data, variables, context) => {
      // Invalidate specified queries
      for (const queryKey of invalidateQueries) {
        await queryClient.invalidateQueries({ queryKey });
      }

      // Remove specified queries from cache
      for (const queryKey of removeQueries) {
        queryClient.removeQueries({ queryKey });
      }

      // Show success message if provided
      if (successMessage) {
        // Note: In a real app, you'd integrate with your toast system here
        console.log("Success:", successMessage);
      }

      // Call custom success handler
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Get error message
      const message =
        errorMessage || (error as any)?.message || "An error occurred";

      // Show error message
      // Note: In a real app, you'd integrate with your toast system here
      console.error("Mutation error:", message);

      // Call custom error handler
      if (onError) {
        onError(error, variables, context);
      }
    },
    ...mutationOptions,
  });
}

/**
 * Base mutation hook for create operations
 */
export function useBaseCreateMutation<TData, TVariables = void>(
  mutationFn: MutationFunction<TData, TVariables>,
  options: BaseMutationOptions<TData, Error, TVariables, unknown> = {}
) {
  return useBaseMutation(mutationFn, {
    successMessage: "Created successfully",
    ...options,
  });
}

/**
 * Base mutation hook for update operations
 */
export function useBaseUpdateMutation<TData, TVariables = void>(
  mutationFn: MutationFunction<TData, TVariables>,
  options: BaseMutationOptions<TData, Error, TVariables, unknown> = {}
) {
  return useBaseMutation(mutationFn, {
    successMessage: "Updated successfully",
    optimistic: true,
    ...options,
  });
}

/**
 * Base mutation hook for delete operations
 */
export function useBaseDeleteMutation<TData, TVariables = void>(
  mutationFn: MutationFunction<TData, TVariables>,
  options: BaseMutationOptions<TData, Error, TVariables, unknown> = {}
) {
  return useBaseMutation(mutationFn, {
    successMessage: "Deleted successfully",
    ...options,
  });
}

/**
 * Optimistic update helper for mutations
 */
export interface OptimisticUpdateConfig<TData, TVariables> {
  queryKey: string[];
  updater: (oldData: TData | undefined, variables: TVariables) => TData;
}

/**
 * Base mutation hook with optimistic updates
 */
export function useOptimisticMutation<TData, TVariables = void>(
  mutationFn: MutationFunction<TData, TVariables>,
  optimisticConfig: OptimisticUpdateConfig<TData, TVariables>,
  options: BaseMutationOptions<
    TData,
    Error,
    TVariables,
    { previousData?: TData }
  > = {}
) {
  const queryClient = useQueryClient();

  return useBaseMutation(mutationFn, {
    ...options,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: optimisticConfig.queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(
        optimisticConfig.queryKey
      );

      // Optimistically update the cache
      queryClient.setQueryData<TData>(optimisticConfig.queryKey, (oldData) =>
        optimisticConfig.updater(oldData, variables)
      );

      // Return context with previous data for rollback
      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          optimisticConfig.queryKey,
          context.previousData
        );
      }

      // Call original error handler
      options.onError?.(error, variables, context);
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: optimisticConfig.queryKey });
    },
  });
}
