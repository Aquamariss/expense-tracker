"use client";

import { useEffect, useMemo, useState } from "react";
import { loadCategories, loadExpenses, saveCategories, saveExpenses } from "@/lib/storage";
import type { Expense } from "@/lib/types";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";
import CategoryFilter from "./CategoryFilter";
import StatsPanel from "./StatsPanel";
import CategoryManager from "./CategoryManager";

type SortKey = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

const SORT_LABELS: Record<SortKey, string> = {
  date_desc: "Сначала новые",
  date_asc: "Сначала старые",
  amount_desc: "По сумме ↓",
  amount_asc: "По сумме ↑",
};

/* ── SVG icons ── */
function AnchorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2.5" />
      <line x1="12" y1="7.5" x2="12" y2="20" />
      <path d="M5 20a7 7 0 0 0 14 0" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

/* ── Background wave lines ── */
function WaveBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 w-full h-full"
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0,80 C200,40 400,110 600,80 C800,50 1000,110 1200,80" stroke="#818cf8" strokeWidth="2" opacity="0.10" />
      <path d="M0,100 C150,70 350,120 550,95 C750,70 950,115 1200,95" stroke="#818cf8" strokeWidth="1.5" opacity="0.07" />
      <path d="M0,55 C250,85 450,30 650,60 C850,90 1050,38 1200,62" stroke="#818cf8" strokeWidth="1" opacity="0.06" />
      <path d="M0,120 C300,95 600,140 900,115 C1050,103 1150,118 1200,120" stroke="#6366f1" strokeWidth="1" opacity="0.05" />
    </svg>
  );
}

/* ── Main component ── */
export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("Все");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setExpenses(loadExpenses());
    setCategories(loadCategories());
    setMounted(true);
  }, []);

  /* ── Expense handlers ── */
  function handleAdd(expense: Expense) {
    const next = [expense, ...expenses];
    setExpenses(next);
    saveExpenses(next);
    setShowForm(false);
  }

  function handleDelete(id: string) {
    const next = expenses.filter((e) => e.id !== id);
    setExpenses(next);
    saveExpenses(next);
  }

  /* ── Category handlers ── */
  function handleAddCategory(name: string) {
    const next = [...categories, name];
    setCategories(next);
    saveCategories(next);
  }

  function handleRenameCategory(oldName: string, newName: string) {
    const nextCategories = categories.map((c) => (c === oldName ? newName : c));
    const nextExpenses = expenses.map((e) =>
      e.category === oldName ? { ...e, category: newName } : e
    );
    if (filter === oldName) setFilter(newName);
    setCategories(nextCategories);
    setExpenses(nextExpenses);
    saveCategories(nextCategories);
    saveExpenses(nextExpenses);
  }

  function handleDeleteCategory(name: string) {
    if (expenses.some((e) => e.category === name)) return;
    const next = categories.filter((c) => c !== name);
    if (filter === name) setFilter("Все");
    setCategories(next);
    saveCategories(next);
  }

  /* ── Filtered & sorted list ── */
  const filtered = useMemo(() => {
    const base = filter === "Все" ? expenses : expenses.filter((e) => e.category === filter);
    return [...base].sort((a, b) => {
      switch (sort) {
        case "date_desc":   return b.date.localeCompare(a.date);
        case "date_asc":    return a.date.localeCompare(b.date);
        case "amount_desc": return b.amount - a.amount;
        case "amount_asc":  return a.amount - b.amount;
      }
    });
  }, [expenses, filter, sort]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Загрузка…
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #f0f2ff 0%, #f9fafb 40%, #ffffff 100%)" }}>
      {/* ── Header ── */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100/60 sticky top-0 z-10 overflow-hidden">
        {/* Wave decoration behind header content */}
        <div className="absolute inset-0 pointer-events-none">
          <WaveBackground />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo / title */}
          <div className="flex items-center gap-3">
            {/* Shell / wave icon */}
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9" />
                <path d="M12 3c2.5 2 4 5 4 9" />
                <path d="M3 12c2-2 5-3.5 9-3.5" />
                <path d="M12 8c1 1.5 1.5 3 1.5 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Трекер расходов</h1>
              <p className="text-xs text-indigo-400 mt-0">Учёт личных трат</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Category manager button */}
            <button
              onClick={() => setShowCategoryManager(true)}
              title="Управление категориями"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-150"
            >
              <CompassIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Категории</span>
            </button>

            {/* Add button */}
            <button
              onClick={() => setShowForm((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors duration-150 ${
                showForm
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm shadow-indigo-200"
              }`}
            >
              {showForm ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  Отмена
                </>
              ) : (
                <>
                  <AnchorIcon className="w-4 h-4" />
                  Добавить
                </>
              )}
            </button>
          </div>
        </div>

        {/* Wavy bottom border */}
        <div className="relative h-3 overflow-hidden -mt-px">
          <svg viewBox="0 0 1200 12" preserveAspectRatio="none" className="absolute w-full h-full" fill="none">
            <path d="M0,6 C150,12 300,0 450,6 C600,12 750,0 900,6 C1050,12 1150,2 1200,6 L1200,12 L0,12 Z" fill="white" fillOpacity="0.8"/>
          </svg>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Form (animated) */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            showForm
              ? "max-h-[600px] opacity-100 pointer-events-auto"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <ExpenseForm categories={categories} onAdd={handleAdd} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: list + controls */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-3">
              <CategoryFilter
                categories={categories}
                active={filter}
                onChange={setFilter}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {filtered.length}{" "}
                  {filtered.length === 1
                    ? "запись"
                    : filtered.length < 5
                    ? "записи"
                    : "записей"}
                </span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                >
                  {(Object.entries(SORT_LABELS) as [SortKey, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <ExpenseList expenses={filtered} onDelete={handleDelete} />
          </div>

          {/* Right: stats */}
          <aside>
            <StatsPanel expenses={expenses} />
          </aside>
        </div>
      </main>

      {/* Category manager modal */}
      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          expenses={expenses}
          onAdd={handleAddCategory}
          onRename={handleRenameCategory}
          onDelete={handleDeleteCategory}
          onClose={() => setShowCategoryManager(false)}
        />
      )}
    </div>
  );
}
