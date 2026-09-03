"use client";

import { useMemo, useState } from "react";
import { CARD } from "@/lib/ui";
import type { ApplicationRecord } from "./ApplicationsTable";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function ApplicationActivity({
  applications,
}: {
  applications: ApplicationRecord[];
}) {
  const [monthOffset, setMonthOffset] = useState(0);

  const { year, month, monthLabel } = useMemo(() => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + monthOffset);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      monthLabel: date.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }),
    };
  }, [monthOffset]);

  const countsByDay = useMemo(() => {
    const counts = new Map<number, number>();
    for (const application of applications) {
      if (!application.dateApplied) continue;
      const date = new Date(application.dateApplied);
      if (date.getFullYear() === year && date.getMonth() === month) {
        counts.set(date.getDate(), (counts.get(date.getDate()) ?? 0) + 1);
      }
    }
    return counts;
  }, [applications, year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const maxCount = Math.max(1, ...Array.from(countsByDay.values()));
  const totalThisMonth = Array.from(countsByDay.values()).reduce(
    (sum, n) => sum + n,
    0
  );

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className={`${CARD} p-5`}>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            Applications by Date
          </p>
          <MonthNav
            monthLabel={monthLabel}
            monthOffset={monthOffset}
            onChange={setMonthOffset}
          />
        </div>
        {totalThisMonth === 0 ? (
          <p className="flex h-32 items-center justify-center text-sm text-slate-400">
            No applications in {monthLabel}.
          </p>
        ) : (
          <div className="flex h-32 items-end gap-[3px]">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
              (day) => {
                const count = countsByDay.get(day) ?? 0;
                const heightPercent =
                  count === 0 ? 3 : (count / maxCount) * 100;

                return (
                  <div
                    key={day}
                    className="group relative flex h-full flex-1 items-end"
                    title={`${monthLabel.split(" ")[0]} ${day}: ${count} application${count === 1 ? "" : "s"}`}
                  >
                    <div
                      className={`w-full rounded-sm transition-colors ${
                        count > 0
                          ? "bg-indigo-500 group-hover:bg-indigo-600"
                          : "bg-slate-100"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      <div className={`${CARD} p-5`}>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">Calendar</p>
          <MonthNav
            monthLabel={monthLabel}
            monthOffset={monthOffset}
            onChange={setMonthOffset}
          />
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="pb-1 text-[11px] font-medium text-slate-400"
            >
              {label}
            </div>
          ))}
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const count = countsByDay.get(day) ?? 0;
            return (
              <div
                key={day}
                title={
                  count > 0
                    ? `${count} application${count === 1 ? "" : "s"}`
                    : undefined
                }
                className={`flex aspect-square items-center justify-center rounded-md text-xs ${
                  count > 0
                    ? "bg-indigo-600 font-semibold text-white"
                    : "text-slate-500"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MonthNav({
  monthLabel,
  monthOffset,
  onChange,
}: {
  monthLabel: string;
  monthOffset: number;
  onChange: (updater: (n: number) => number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-slate-400 sm:inline">
        {monthLabel}
      </span>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => onChange((n) => n - 1)}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Previous month"
        >
          ‹
        </button>
        {monthOffset !== 0 && (
          <button
            type="button"
            onClick={() => onChange(() => 0)}
            className="rounded px-1.5 py-0.5 text-[11px] text-indigo-600 hover:bg-slate-100"
          >
            Today
          </button>
        )}
        <button
          type="button"
          onClick={() => onChange((n) => n + 1)}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Next month"
        >
          ›
        </button>
      </div>
    </div>
  );
}
