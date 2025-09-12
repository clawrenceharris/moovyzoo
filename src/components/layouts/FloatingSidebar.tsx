"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Home as HomeIcon,
  User as UserIcon,
  Leaf,
  Compass,
  Tv,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useChatSidebar } from "@/features/ai-chat/hooks/use-chat-sidebar";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Profile", href: "/profile", icon: UserIcon },
  { label: "Habitats", href: "/habitats", icon: Leaf },
  { label: "Friends", href: "/profile/discover", icon: Compass },
  { label: "Streams", href: "/streams", icon: Tv },
];

export default function FloatingSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen: isChatOpen, toggleSidebar } = useChatSidebar();
  const [expanded, setExpanded] = useState<boolean>(true);

  // Persist sidebar state
  useEffect(() => {
    const v = globalThis?.localStorage?.getItem("sidebar:expanded");
    if (v !== null) setExpanded(v === "1");
  }, []);
  useEffect(() => {
    globalThis?.localStorage?.setItem("sidebar:expanded", expanded ? "1" : "0");
  }, [expanded]);

  const activeMatcher = useMemo(() => {
    // page is active when the path contains complete href, not just start
    return (href: string) => (href === "/" ? pathname === "/" : pathname === href);
  }, [pathname]);

  return (
    <aside
      className={cn(
        // Floating positioning and spacing
        "fixed left-4 top-4 bottom-4 z-40",
        // Width depending on state
        expanded ? "w-60" : "w-[72px]",
        // Card-like surface with brand colors
        "rounded-2xl border backdrop-blur-md",
        "bg-brand-black-08/90 border-brand-black-15",
        // Subtle red glow shadow
        "shadow-[0_10px_30px_rgba(244,37,37,0.15)]",
        // Smooth transitions
        "transition-[width] duration-300"
      )}
      aria-label="App navigation"
    >
      {/* Inner container to give some breathing room */}
      <div className="h-full flex flex-col p-3 gap-2">
        {/* AI Chat toggle - top element */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "group w-full rounded-xl flex items-center gap-3",
            "px-3 py-2",
            "bg-gradient-to-br from-brand-red-45 to-brand-red-55",
            "hover:from-brand-red-40 hover:to-brand-red-50",
            "text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
          )}
          aria-pressed={isChatOpen}
          aria-label="Toggle AI chat"
        >
          <span className="relative inline-flex items-center justify-center size-8 rounded-lg bg-white/10">
            <Image
              src="/icons/sparkle-white.svg"
              alt="AI"
              width={18}
              height={18}
              className="opacity-90"
            />
          </span>
          {expanded && (
            <span className="text-sm font-semibold tracking-wide">Ask Zoovie AI</span>
          )}
        </button>

        {/* Divider */}
        <div className="h-px bg-brand-black-15 my-1" />

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeMatcher(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center rounded-xl",
                      expanded ? "gap-3 px-3 py-2" : "justify-center px-2.5 py-2.5",
                      active
                        ? "bg-brand-red-45/20 text-white border border-brand-red-55/40"
                        : "text-brand-grey-70 hover:text-white hover:bg-brand-black-10"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="size-5 shrink-0" />
                    {expanded && (
                      <span className="text-sm font-medium tracking-wide">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse / expand control */}
        <div className="mt-auto flex justify-end">
          <button
            onClick={() => setExpanded((v) => !v)}
            className={cn(
              "rounded-xl border border-brand-black-15",
              "bg-brand-black-10 hover:bg-brand-black-12",
              "text-brand-grey-70 hover:text-white",
              "transition-colors p-2"
            )}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
