"use client";
import "../globals.css";

import { QueryProvider, UserProvider } from "@/app/(app)/providers";
import Header from "@/components/ui/Header";
import { useAuth } from "@/features/auth/hooks";
import { AIChatProvider } from "@/features/ai-chat";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <QueryProvider>
      <UserProvider user={user}>
        <div className="flex min-h-screen flex-col">
          <Header />

          {/* Page Content */}

          <main className="flex-1">{children}</main>
        </div>
        <AIChatProvider />
      </UserProvider>
    </QueryProvider>
  );
}
