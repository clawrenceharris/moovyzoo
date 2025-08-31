"use client";
import "../globals.css";

import { QueryProvider, UserProvider } from "@/app/(app)/providers";
import Header from "@/components/Header";
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
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <div className="flex min-h-screen flex-col">
          <Header />

          {/* Page Content */}
          <main className="flex-1">
            <QueryProvider>
              <UserProvider user={user}>
                <Header />
                <main className="flex-1">{children}</main>
              </UserProvider>
            </QueryProvider>
          </main>
          <AIChatProvider />
        </div>
      </body>
    </html>
  );
}
