"use client";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useUser } from "@/hooks";

export default function Home() {
  const { user } = useUser();
  const { profile } = useProfile(user.id);

  return (
    <div>
      <h1>Welcome, {profile?.displayName}</h1>
    </div>
  );
}
