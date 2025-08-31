import { User } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

export const UserContext = createContext<{
  user: User;
} | null>(null);
export function useUser() {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("UserContext not set. Use inside (authed) layout.");
  return context;
}
