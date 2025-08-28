"use client";
import "../globals.css";

import { QueryProvider, UserProvider } from "@/app/(app)/providers";
import Header from "@/components/Header";
import { useAuth } from "@/features/auth/hooks";

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
        <Header />
        <main className="flex-1">{children}</main>
      </UserProvider>
    </QueryProvider>
  );
}
