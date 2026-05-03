"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import type { Expense } from "@/lib/types";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";
import CategoryFilter from "./CategoryFilter";
import StatsPanel from "./StatsPanel";
import CategoryManager from "./CategoryManager";
import SourceManager from "./SourceManager";

type SortKey = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

const SORT_LABELS: Record<SortKey, string> = {
  date_desc: "Сначала новые",
  date_asc: "Сначала старые",
  amount_desc: "По сумме ↓",
  amount_asc: "По сумме ↑",
};

interface ApiItem { id: string; name: string; }

/* ── SVG icons ── */
function AnchorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", overflow: "hidden" }}>
      <circle cx="12" cy="5" r="2.5" />
      <line x1="12" y1="7.5" x2="12" y2="20" />
      <path d="M5 20a7 7 0 0 0 14 0" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", overflow: "hidden" }}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function CardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", overflow: "hidden" }}>
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M2 10h20"/>
    </svg>
  );
}

function WaveBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 w-full h-full"
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      fill="none"
    >
      <path d="M0,80 C200,40 400,110 600,80 C800,50 1000,110 1200,80" stroke="#818cf8" strokeWidth="2" opacity="0.10" />
      <path d="M0,100 C150,70 350,120 550,95 C750,70 950,115 1200,95" stroke="#818cf8" strokeWidth="1.5" opacity="0.07" />
      <path d="M0,55 C250,85 450,30 650,60 C850,90 1050,38 1200,62" stroke="#818cf8" strokeWidth="1" opacity="0.06" />
      <path d="M0,120 C300,95 600,140 900,115 C1050,103 1150,118 1200,120" stroke="#6366f1" strokeWidth="1" opacity="0.05" />
    </svg>
  );
}

export default function ExpenseTracker() {
  const { data: session, status } = useSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [apiCategories, setApiCategories] = useState<ApiItem[]>([]);
  const [apiSources, setApiSources] = useState<ApiItem[]>([]);
  const [filter, setFilter] = useState<string>("Все");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showSourceManager, setShowSourceManager] = useState(false);

  const categories = useMemo(() => apiCategories.map((c) => c.name), [apiCategories]);
  const sources = useMemo(() => apiSources.map((s) => s.name), [apiSources]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/expenses").then((r) => r.json()).then(setExpenses).catch(console.error);
    fetch("/api/categories").then((r) => r.json()).then(setApiCategories).catch(console.error);
    fetch("/api/sources").then((r) => r.json()).then(setApiSources).catch(console.error);
  }, [status]);

  /* ── Expense handlers ── */
  async function handleAdd(data: Omit<Expense, "id">) {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const expense: Expense = await res.json();
    setExpenses((prev) => [expense, ...prev]);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  /* ── Category handlers ── */
  async function handleAddCategory(name: string) {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const cat: ApiItem = await res.json();
    setApiCategories((prev) => [...prev, cat]);
  }

  async function handleRenameCategory(oldName: string, newName: string) {
    const cat = apiCategories.find((c) => c.name === oldName);
    if (!cat) return;
    await fetch(`/api/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (filter === oldName) setFilter(newName);
    setApiCategories((prev) => prev.map((c) => c.id === cat.id ? { ...c, name: newName } : c));
    setExpenses((prev) => prev.map((e) => e.category === oldName ? { ...e, category: newName } : e));
  }

  async function handleDeleteCategory(name: string) {
    const cat = apiCategories.find((c) => c.name === name);
    if (!cat) return;
    await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
    if (filter === name) setFilter("Все");
    setApiCategories((prev) => prev.filter((c) => c.id !== cat.id));
  }

  /* ── Source handlers ── */
  async function handleAddSource(name: string) {
    const res = await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const src: ApiItem = await res.json();
    setApiSources((prev) => [...prev, src]);
  }

  async function handleRenameSource(oldName: string, newName: string) {
    const src = apiSources.find((s) => s.name === oldName);
    if (!src) return;
    await fetch(`/api/sources/${src.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    setApiSources((prev) => prev.map((s) => s.id === src.id ? { ...s, name: newName } : s));
    setExpenses((prev) => prev.map((e) => e.source === oldName ? { ...e, source: newName } : e));
  }

  async function handleDeleteSource(name: string) {
    const src = apiSources.find((s) => s.name === name);
    if (!src) return;
    await fetch(`/api/sources/${src.id}`, { method: "DELETE" });
    setApiSources((prev) => prev.filter((s) => s.id !== src.id));
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

  if (status === "loading") {
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
        <div className="absolute inset-0 pointer-events-none">
          <WaveBackground />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
          {/* Logo / title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 overflow-hidden">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" style={{ display: "block", overflow: "hidden" }}>
                <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9" />
                <path d="M12 3c2.5 2 4 5 4 9" />
                <path d="M3 12c2-2 5-3.5 9-3.5" />
                <path d="M12 8c1 1.5 1.5 3 1.5 4" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight truncate">Трекер расходов</h1>
              <p className="text-xs text-indigo-400 mt-0 truncate hidden sm:block">
                {session?.user?.email ?? "Учёт личных трат"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => setShowSourceManager(true)}
              title="Источники средств"
              className="flex items-center gap-1.5 px-2 sm:px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-150"
            >
              <CardIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Источники</span>
            </button>

            <button
              onClick={() => setShowCategoryManager(true)}
              title="Управление категориями"
              className="flex items-center gap-1.5 px-2 sm:px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-150"
            >
              <CompassIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Категории</span>
            </button>

            <button
              onClick={() => setShowForm((v) => !v)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors duration-150 ${
                showForm
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm shadow-indigo-200"
              }`}
            >
              {showForm ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4" style={{ display: "block", overflow: "hidden" }}>
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  <span className="hidden sm:inline">Отмена</span>
                </>
              ) : (
                <>
                  <AnchorIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Добавить</span>
                </>
              )}
            </button>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Выйти"
              className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors duration-150"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ display: "block", overflow: "hidden" }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative h-3 overflow-hidden -mt-px">
          <svg viewBox="0 0 1200 12" preserveAspectRatio="none" className="absolute w-full h-full" fill="none">
            <path d="M0,6 C150,12 300,0 450,6 C600,12 750,0 900,6 C1050,12 1150,2 1200,6 L1200,12 L0,12 Z" fill="white" fillOpacity="0.8"/>
          </svg>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div
          className={`overflow-hidden transition-all duration-300 ${
            showForm
              ? "max-h-[700px] opacity-100 pointer-events-auto"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <ExpenseForm categories={categories} sources={sources} onAdd={handleAdd} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-3">
              <CategoryFilter categories={categories} active={filter} onChange={setFilter} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "запись" : filtered.length < 5 ? "записи" : "записей"}
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

          <aside>
            <StatsPanel expenses={expenses} />
          </aside>
        </div>
      </main>

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

      {showSourceManager && (
        <SourceManager
          sources={sources}
          expenses={expenses}
          onAdd={handleAddSource}
          onRename={handleRenameSource}
          onDelete={handleDeleteSource}
          onClose={() => setShowSourceManager(false)}
        />
      )}
    </div>
  );
}
