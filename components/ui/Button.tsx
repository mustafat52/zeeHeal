import { ReactNode } from "react";
import clsx from "clsx";

export function Button({
  children,
  onClick,
  variant = "primary",
  className,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(
        "tap-scale rounded-xl px-5 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
        variant === "primary" && "bg-sage-600 text-white hover:bg-sage-800",
        variant === "secondary" && "bg-sage-100 text-sage-800 hover:bg-sage-200",
        variant === "ghost" && "bg-transparent text-moss-600 hover:bg-sage-50",
        className
      )}
    >
      {children}
    </button>
  );
}
