import { ReactNode } from "react";
import "../globals.css";
import Header from "@/components/Header";
import { AIChatProvider } from "@/features/ai-chat";
import AuthedLayout from "@/features/auth/components/AuthedLayout";
import { QueryProvider } from "./providers";

export const metadata = {
  title: "Zoovie",
  description: "Watch, chat, and play with your movie crew",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <div className="flex min-h-screen flex-col">
          <Header />

          {/* Page Content */}
          <main className="flex-1">
            <QueryProvider>
              <AuthedLayout>{children}</AuthedLayout>
            </QueryProvider>
          </main>
          <AIChatProvider />
        </div>
      </body>
    </html>
  );
}
