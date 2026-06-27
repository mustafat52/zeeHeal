import Link from "next/link";
import { DigestItem } from "@/lib/digest";
import { AlertCircle, Sparkles, UserPlus } from "lucide-react";
import clsx from "clsx";

const iconByType = {
  attention: AlertCircle,
  win: Sparkles,
  new: UserPlus,
};

const colorByType = {
  attention: "text-clay-600 bg-clay-100",
  win: "text-sage-600 bg-sage-100",
  new: "text-moss-600 bg-moss-900/5",
};

export function DigestCard({ items }: { items: DigestItem[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-sage-50 rounded-xl border border-sage-100 p-4 mb-6">
        <p className="text-sm text-moss-600">All quiet today. Nothing needs your attention.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-sage-100/60 shadow-card p-4 mb-6">
      <p className="text-xs font-medium text-moss-400 mb-3">Today&apos;s digest</p>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => {
          const Icon = iconByType[item.type];
          return (
            <Link
              key={i}
              href={`/client/${item.clientId}`}
              className="tap-scale flex items-start gap-2.5"
            >
              <div
                className={clsx(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  colorByType[item.type]
                )}
              >
                <Icon size={12} />
              </div>
              <p className="text-sm text-moss-900 leading-snug">{item.text}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
