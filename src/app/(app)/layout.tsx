import "./globals.css";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import { AIChatProvider } from "@/features/ai";

export const metadata = {
  title: "MoovyZoo",
  description: "Watch, chat, and play with your movie crew",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[--brand-black-06] text-white">
        <div className="flex min-h-screen flex-col">
          {/* Global Header */}
          <Header />

          {/* Page Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t border-[--brand-black-15] p-4 text-center text-sm text-[--brand-grey-70]">
            © {new Date().getFullYear()} MoovyZoo
          </footer>

          {/* AI Chat Provider - FAB and Sidebar */}
          <AIChatProvider />
        </div>
      </body>
    </html>
  );
}
