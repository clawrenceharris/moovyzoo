"use client";
import "../globals.css";

import { QueryProvider, UserProvider } from "@/app/(app)/providers";
import Header from "@/components/ui/Header";
import { useAuth } from "@/features/auth/hooks";
import { AIChatProvider } from "@/features/ai-chat";
import { ChatSidebarProvider } from "@/features/ai-chat/components/ChatSidebarProvider";
import FloatingSidebar from "@/components/layouts/FloatingSidebar";

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
        <ChatSidebarProvider>
          <div className="flex min-h-screen flex-col">
            <Header />

            {/* Page Content */}
            <div className="relative flex-1">
              {/* Floating Sidebar visible across pages */}
              <FloatingSidebar />
              <main className="flex-1 pl-[88px] md:pl-[100px] pr-4 py-4 ml-4">{children}</main>
            </div>
            {/* AI Chat Provider - positioned to slide in from right edge */}
            <AIChatProvider />
          </div>
        </ChatSidebarProvider>
      </UserProvider>
    </QueryProvider>
  );
}
