"use client";
import { useAuth } from "@/features/auth/hooks";
import { cn } from "@/styles/styles";

export default function Header({}) {
  const { logout, error } = useAuth(); // implement with supabase.auth

  return (
    <div className={cn("mx-auto flex w-full max-w-xl flex-col gap-6 p-6")}>
      <header className="text-center">
        <h1 className="text-2xl font-semibold">MoovyZoo</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, cinephile.</p>
        <p className="mt-1 text-sm text-gray-500">{error}</p>

        <button onClick={logout}>Log Out</button>
      </header>
    </div>
  );
}
