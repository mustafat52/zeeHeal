import clsx from "clsx";

export function Pill({
  children,
  tone = "sage",
}: {
  children: React.ReactNode;
  tone?: "sage" | "clay" | "neutral";
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full",
        tone === "sage" && "bg-sage-100 text-sage-800",
        tone === "clay" && "bg-clay-100 text-clay-600",
        tone === "neutral" && "bg-moss-900/5 text-moss-600"
      )}
    >
      {children}
    </span>
  );
}
