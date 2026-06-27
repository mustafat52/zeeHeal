"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import clsx from "clsx";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/login")}
      aria-label="Log out"
      className={clsx(
        "tap-scale w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shrink-0",
        className
      )}
    >
      <LogOut size={15} className="text-moss-600" />
    </button>
  );
}