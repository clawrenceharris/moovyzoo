import "../globals.css";
import type { ReactNode } from "react";
import Header from "@/components/Header";

export const metadata = {
  title: "MoovyZoo",
  description: "Watch, chat, and play with your movie crew",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <div className="flex min-h-screen flex-col">
          {/* Global Header could go here */}
          <Header />

          {/* Page Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t p-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} MoovyZoo
          </footer>
        </div>
      </body>
    </html>
  );
}
