"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, LineChart, MessageCircle } from "lucide-react";
import clsx from "clsx";

const tabs = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/plan", label: "Plan", icon: CalendarDays },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/chat", label: "Chat", icon: MessageCircle },
];

export function ClientBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-sage-100 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] z-40">
      <div className="flex justify-between">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 py-1.5 tap-scale"
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.2 : 1.6}
                className={clsx(active ? "text-sage-600" : "text-moss-400")}
              />
              <span
                className={clsx(
                  "text-[11px]",
                  active ? "text-sage-800 font-medium" : "text-moss-400"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}