"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  APPLICATION_STATUSES,
  STATUS_BADGE_STYLES,
  STATUS_BAR_COLORS,
  type ApplicationStatus,
} from "@/lib/applicationStatus";
import { CARD } from "@/lib/ui";
import type { ApplicationRecord } from "./ApplicationsTable";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const CHART_HEIGHT = 176;
const HEAT_LEVELS = [
  "bg-slate-100",
  "bg-indigo-200",
  "bg-indigo-400",
  "bg-indigo-600",
  "bg-indigo-800",
];

/**
 * Evenly-spaced integer gridline values from 0 to max, deduped — a naive
 * 5-way split (0/25/50/75/100%) produces repeated rounded labels like
 * "1, 1, 1, 0, 0" when max is small, so the step count is capped at max.
 */
function getGridlines(max: number): { value: number; fraction: number }[] {
  const steps = Math.min(max, 4);
  const seen = new Set<number>();
  const lines: { value: number; fraction: number }[] = [];

  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    const value = Math.round(fraction * max);
    if (seen.has(value)) continue;
    seen.add(value);
    lines.push({ value, fraction });
  }

  return lines;
}

/** 5-step heat intensity (0 = none, 4 = at/near the month's busiest day). */
function heatLevel(count: number, max: number): number {
  if (count === 0) return 0;
  if (max <= 1) return 3;
  const ratio = count / max;
  if (ratio >= 0.99) return 4;
  if (ratio >= 0.66) return 3;
  if (ratio >= 0.33) return 2;
  return 1;
}

export default function ApplicationActivity({
  applications,
}: {
  applications: ApplicationRecord[];
}) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    setSelectedDay(null);
  }, [monthOffset]);

  const { year, month, monthLabel } = useMemo(() => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + monthOffset);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      // Pinned locale avoids a server/client hydration mismatch (see
      // formatDate in ApplicationsTable.tsx for the same reasoning).
      monthLabel: date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    };
  }, [monthOffset]);

  const { countsByDay, applicationsByDay, statusesUsed } = useMemo(() => {
    const counts = new Map<number, Partial<Record<ApplicationStatus, number>>>();
    const byDay = new Map<number, ApplicationRecord[]>();
    const used = new Set<ApplicationStatus>();

    for (const application of applications) {
      if (!application.dateApplied) continue;
      const date = new Date(application.dateApplied);
      if (date.getFullYear() !== year || date.getMonth() !== month) continue;

      const day = date.getDate();
      const dayCounts = counts.get(day) ?? {};
      dayCounts[application.status] = (dayCounts[application.status] ?? 0) + 1;
      counts.set(day, dayCounts);
      used.add(application.status);

      const dayApplications = byDay.get(day) ?? [];
      dayApplications.push(application);
      byDay.set(day, dayApplications);
    }

    return { countsByDay: counts, applicationsByDay: byDay, statusesUsed: used };
  }, [applications, year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const dayTotals = Array.from(countsByDay.values()).map((c) =>
    Object.values(c).reduce((sum, n) => sum + (n ?? 0), 0)
  );
  const maxDayTotal = Math.max(1, ...dayTotals);
  const totalThisMonth = dayTotals.reduce((sum, n) => sum + n, 0);
  const orderedStatusesUsed = APPLICATION_STATUSES.filter((s) =>
    statusesUsed.has(s)
  );
  const monthShort = monthLabel.split(" ")[0];
  const gridlines = getGridlines(maxDayTotal);

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  const selectedApplications =
    selectedDay !== null ? (applicationsByDay.get(selectedDay) ?? []) : [];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className={`${CARD} p-5`}>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            Applications by Date
          </p>
          <MonthNav
            monthLabel={monthLabel}
            monthOffset={monthOffset}
            onChange={setMonthOffset}
          />
        </div>
        <p className="mb-4 text-xs text-slate-400">
          {totalThisMonth} application{totalThisMonth === 1 ? "" : "s"} in{" "}
          {monthLabel}
        </p>

        {totalThisMonth === 0 ? (
          <p
            className="flex items-center justify-center text-sm text-slate-400"
            style={{ height: CHART_HEIGHT }}
          >
            No applications in {monthLabel}.
          </p>
        ) : (
          <>
            <div className="flex gap-2">
              <div
                className="relative w-4 text-right text-[10px] text-slate-400"
                style={{ height: CHART_HEIGHT }}
              >
                {gridlines.map((g) => (
                  <span
                    key={g.value}
                    className="absolute right-0 -translate-y-1/2"
                    style={{ bottom: `${g.fraction * 100}%` }}
                  >
                    {g.value}
                  </span>
                ))}
              </div>

              <div
                className="relative flex flex-1 items-end gap-[3px]"
                style={{ height: CHART_HEIGHT }}
              >
                {gridlines.map((g) => (
                  <div
                    key={g.value}
                    className="pointer-events-none absolute left-0 right-0 border-t border-slate-100"
                    style={{ bottom: `${g.fraction * 100}%` }}
                  />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => {
                    const dayCounts = countsByDay.get(day);
                    const dayTotal = dayCounts
                      ? Object.values(dayCounts).reduce(
                          (sum, n) => sum + (n ?? 0),
                          0
                        )
                      : 0;
                    const barHeightPercent =
                      dayTotal === 0 ? 0 : (dayTotal / maxDayTotal) * 100;

                    return (
                      <div
                        key={day}
                        className="group relative z-[1] flex h-full flex-1 items-end"
                        title={
                          dayTotal === 0
                            ? undefined
                            : `${monthShort} ${day}: ${dayTotal} application${dayTotal === 1 ? "" : "s"}`
                        }
                      >
                        <div
                          className="flex w-full flex-col-reverse overflow-hidden rounded-sm"
                          style={{ height: `${barHeightPercent}%` }}
                        >
                          {APPLICATION_STATUSES.filter(
                            (status) => (dayCounts?.[status] ?? 0) > 0
                          ).map((status) => (
                            <div
                              key={status}
                              className={STATUS_BAR_COLORS[status]}
                              style={{ flexGrow: dayCounts?.[status] ?? 0 }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div className="mt-2 flex justify-between pl-7 text-[10px] text-slate-400">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1)
                .filter(
                  (day) =>
                    day === 1 || day === daysInMonth || day % 5 === 0
                )
                .map((day) => (
                  <span key={day}>{day}</span>
                ))}
            </div>

            {orderedStatusesUsed.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3">
                {orderedStatusesUsed.map((status) => (
                  <span
                    key={status}
                    className="flex items-center gap-1.5 text-xs text-slate-500"
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${STATUS_BAR_COLORS[status]}`}
                    />
                    {status}
                  </span>
                ))}
              </div>
            )}
          </>
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
            const dayCounts = countsByDay.get(day);
            const dayTotal = dayCounts
              ? Object.values(dayCounts).reduce(
                  (sum, n) => sum + (n ?? 0),
                  0
                )
              : 0;
            const level = heatLevel(dayTotal, maxDayTotal);
            const isToday = isCurrentMonth && today.getDate() === day;
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                type="button"
                onClick={() =>
                  dayTotal > 0 &&
                  setSelectedDay((prev) => (prev === day ? null : day))
                }
                title={
                  dayTotal > 0
                    ? `${dayTotal} application${dayTotal === 1 ? "" : "s"}`
                    : undefined
                }
                className={`relative flex aspect-square flex-col items-center justify-center rounded-md text-xs transition-colors ${HEAT_LEVELS[level]} ${
                  level >= 2 ? "font-semibold text-white" : "text-slate-600"
                } ${dayTotal > 0 ? "cursor-pointer" : "cursor-default"} ${
                  dayTotal > 0 && !isSelected ? "hover:brightness-110" : ""
                } ${
                  isSelected
                    ? "ring-2 ring-slate-900 ring-offset-1"
                    : isToday
                      ? "ring-2 ring-indigo-400 ring-offset-1"
                      : ""
                }`}
              >
                {day}
                {dayTotal > 1 && (
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold ${
                      level >= 2
                        ? "bg-white text-indigo-700"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    {dayTotal}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded ring-2 ring-indigo-400" />
            Today
          </span>
          <span className="flex items-center gap-1">
            Fewer
            {HEAT_LEVELS.slice(1).map((cls) => (
              <span key={cls} className={`h-3 w-3 rounded ${cls}`} />
            ))}
            More
          </span>
        </div>

        {selectedDay !== null && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700">
                {monthShort} {selectedDay}, {year}
              </p>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="text-xs text-slate-400 hover:text-slate-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <ul className="flex flex-col gap-1.5">
              {selectedApplications.map((application) => (
                <li
                  key={application._id}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <Link
                    href={`/dashboard/${application._id}/edit`}
                    className="truncate font-medium text-slate-700 hover:text-indigo-600 hover:underline"
                  >
                    {application.company}
                    {application.role ? ` — ${application.role}` : ""}
                  </Link>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE_STYLES[application.status]}`}
                  >
                    {application.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
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
