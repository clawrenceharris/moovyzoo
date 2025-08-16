"use client";
import { useAuth } from "@/features/auth/hooks";

export default function Header({}) {
  const { logout, error } = useAuth(); // implement with supabase.auth

  return (
    <div>
      <header className="text-center">
        <h1 className="text-2xl font-semibold">MoovyZoo</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, cinephile.</p>
        <p className="mt-1 text-sm text-gray-500">{error}</p>

        <button onClick={logout}>Log Out</button>
      </header>
    </div>
  );
}
