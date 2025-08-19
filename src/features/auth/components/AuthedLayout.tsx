"use client";

import { UserProvider } from "@/app/(app)/providers";
import { useAuth } from "../hooks";

export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user) return null;

  return <UserProvider user={user}>{children}</UserProvider>;
}
