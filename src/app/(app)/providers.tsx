"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { User } from "@supabase/supabase-js";
import { UserContext } from "@/hooks/use-user";
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: (failureCount, error) => {
              // Don't retry on client errors (4xx)
              if (error && typeof error === "object" && "status" in error) {
                const status = (error as any).status;
                if (status >= 400 && status < 500) {
                  return false;
                }
              }
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: (failureCount, error) => {
              // Don't retry mutations on client errors
              if (error && typeof error === "object" && "status" in error) {
                const status = (error as any).status;
                if (status >= 400 && status < 500) {
                  return false;
                }
              }
              // Retry up to 2 times for server errors
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      {children}
    </QueryClientProvider>
  );
}

export function UserProvider({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) {
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}
