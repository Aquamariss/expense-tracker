"use client";

import { useMemo } from "react";
import type { Expense } from "@/lib/types";

interface Props {
  expenses: Expense[];
}

function fmt(n: number) {
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const PALETTE = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-orange-100 text-orange-700",
  "bg-yellow-100 text-yellow-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-slate-100 text-slate-700",
  "bg-teal-100 text-teal-700",
  "bg-cyan-100 text-cyan-700",
  "bg-lime-100 text-lime-700",
];

const BAR_PALETTE = [
  "bg-emerald-400", "bg-blue-400", "bg-purple-400", "bg-pink-400",
  "bg-orange-400", "bg-yellow-400", "bg-rose-400", "bg-indigo-400",
  "bg-fuchsia-400", "bg-slate-400", "bg-teal-400", "bg-cyan-400", "bg-lime-400",
];

function categoryColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0x7fffffff;
  return PALETTE[h % PALETTE.length]!;
}

function categoryBar(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0x7fffffff;
  return BAR_PALETTE[h % BAR_PALETTE.length]!;
}

export default function StatsPanel({ expenses }: Props) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthTotal = useMemo(
    () => expenses.filter((e) => e.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0),
    [expenses, thisMonth]
  );

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    }
    return Object.entries(map)
      .map(([cat, total]) => ({ cat, total }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const grandTotal = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  const monthName = now.toLocaleString("ru-RU", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      {/* Month card with wave decoration */}
      <div className="relative bg-indigo-500 rounded-2xl p-6 text-white overflow-hidden">
        {/* Wave lines inside card */}
        <svg className="absolute bottom-0 left-0 w-full opacity-20 pointer-events-none" viewBox="0 0 300 60" preserveAspectRatio="none" fill="none">
          <path d="M0,40 C50,20 100,50 150,35 C200,20 250,45 300,30" stroke="white" strokeWidth="1.5"/>
          <path d="M0,50 C60,30 120,55 180,42 C230,32 270,50 300,45" stroke="white" strokeWidth="1"/>
          <path d="M0,28 C40,45 90,18 140,38 C190,55 250,25 300,42" stroke="white" strokeWidth="0.8"/>
        </svg>
        {/* Anchor watermark */}
        <svg className="absolute right-4 bottom-3 w-12 h-12 opacity-10 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="5" r="2.5"/>
          <line x1="12" y1="7.5" x2="12" y2="20"/>
          <path d="M5 20a7 7 0 0 0 14 0"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>

        <p className="text-indigo-200 text-sm capitalize">{monthName}</p>
        <p className="text-3xl font-bold mt-1">{fmt(monthTotal)} €</p>
        <p className="text-indigo-200 text-xs mt-1">расходов в этом месяце</p>
      </div>

      {/* All time */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">Всего за всё время</span>
        <span className="font-semibold text-gray-900">{fmt(grandTotal)} €</span>
      </div>

      {/* By category */}
      {byCategory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            По категориям
          </h3>
          <div className="space-y-2.5">
            {byCategory.map(({ cat, total }) => {
              const pct = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full truncate ${categoryColor(cat)}`}>
                      {cat}
                    </span>
                    <span className="text-sm font-semibold text-gray-800 shrink-0">
                      {fmt(total)} €
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${categoryBar(cat)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
