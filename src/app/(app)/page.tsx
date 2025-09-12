"use client";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useUser } from "@/hooks/use-user";
import { MockWatchHistoryDemo } from "@/features/profile/components/MockWatchHistoryDemo";

export default function Home() {
  const { user } = useUser();
  const { profile } = useProfile(user?.id);

  return (
    <div className="space-y-6">
      <div className="mt-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          <span className="text-foreground/80">Welcome, </span>
          <span className="text-primary drop-shadow-[0_2px_10px_rgba(229,9,20,0.35)]">
            {profile?.displayName || "User"}
          </span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">What would you like to watch or explore today?</p>
      </div>

      {/* Mock Watch History Tracker Demo */}
      <MockWatchHistoryDemo />
    </div>
  );
}
