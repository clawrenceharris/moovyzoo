import { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "MoovyZoo",
  description: "Watch, chat, and play with your movie crew",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
