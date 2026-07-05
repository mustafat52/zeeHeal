"use client";

function barHeight(value: number, max: number) {
  return Math.max(Math.min((value / max) * 100, 100), 8);
}

export function DailyBarStrip({
  label,
  data,
  totalDays,
  max,
  colorClass,
}: {
  label: string;
  data: (number | null | undefined)[];
  totalDays: number;
  max: number;
  colorClass: string;
}) {
  const loggedCount = data
    .slice(0, totalDays)
    .filter((v) => v !== null && v !== undefined).length;

  return (
    <div className="bg-white rounded-xl border border-sage-100/60 p-3.5 mb-3">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-xs font-medium text-moss-600">{label}</p>
        <span className="text-[10px] text-moss-400">
          {loggedCount}/{totalDays} days logged
        </span>
      </div>
      <div className="flex items-end gap-[3px] h-14">
        {Array.from({ length: totalDays }, (_, i) => {
          const v = data[i];
          const has = v !== null && v !== undefined;
          return (
            <div key={i} className="flex-1 flex flex-col justify-end h-full">
              {has ? (
                <div
                  className={`rounded-t-sm ${colorClass}`}
                  style={{ height: `${barHeight(v as number, max)}%` }}
                />
              ) : (
                <div className="h-1 rounded-full bg-moss-900/10" />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[9px] text-moss-400">Day 1</span>
        <span className="text-[9px] text-moss-400">Day {totalDays}</span>
      </div>
    </div>
  );
}