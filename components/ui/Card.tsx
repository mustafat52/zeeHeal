import { ReactNode } from "react";
import clsx from "clsx";

export function Card({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-white rounded-xl shadow-card border border-sage-100/60 p-4",
        onClick && "tap-scale cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
