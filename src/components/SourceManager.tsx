"use client";

import { useEffect, useRef, useState } from "react";
import type { Expense } from "@/lib/types";

interface Props {
  sources: string[];
  expenses: Expense[];
  onAdd: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
  onClose: () => void;
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export default function SourceManager({ sources, expenses, onAdd, onRename, onDelete, onClose }: Props) {
  const [newName, setNewName] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState("");
  const editRef = useRef<HTMLInputElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingIndex !== null) editRef.current?.focus();
  }, [editingIndex]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (editingIndex !== null) setEditingIndex(null);
        else onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingIndex, onClose]);

  function expenseCount(src: string) {
    return expenses.filter((e) => e.source === src).length;
  }

  function startEdit(i: number) {
    setEditingIndex(i);
    setEditValue(sources[i] ?? "");
    setError("");
  }

  function commitEdit() {
    if (editingIndex === null) return;
    const oldName = sources[editingIndex] ?? "";
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== oldName) {
      if (sources.includes(trimmed)) {
        setError(`Источник «${trimmed}» уже существует`);
        return;
      }
      onRename(oldName, trimmed);
    }
    setEditingIndex(null);
    setError("");
  }

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (sources.includes(trimmed)) {
      setError(`Источник «${trimmed}» уже существует`);
      return;
    }
    onAdd(trimmed);
    setNewName("");
    setError("");
    newInputRef.current?.focus();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Wave decoration */}
        <div className="absolute top-0 right-0 w-48 h-24 pointer-events-none opacity-[0.07]">
          <svg viewBox="0 0 200 100" fill="none" className="w-full h-full">
            <path d="M0,50 C40,20 80,80 120,50 C160,20 180,60 200,50" stroke="#6366f1" strokeWidth="3"/>
            <path d="M0,70 C50,40 100,90 150,65 C175,52 190,60 200,65" stroke="#6366f1" strokeWidth="2"/>
            <path d="M0,30 C60,60 120,10 200,35" stroke="#6366f1" strokeWidth="1.5"/>
          </svg>
        </div>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <path d="M2 10h20"/>
            </svg>
            <h2 className="text-base font-semibold text-gray-900">Источники средств</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
            <XIcon />
          </button>
        </div>

        {/* List */}
        <div className="px-6 py-3 max-h-72 overflow-y-auto space-y-1">
          {sources.map((src, i) => {
            const count = expenseCount(src);
            return (
              <div key={src} className="flex items-center gap-2 group rounded-xl px-1 py-0.5 hover:bg-gray-50 transition-colors">
                {editingIndex === i ? (
                  <input
                    ref={editRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit();
                      if (e.key === "Escape") { setEditingIndex(null); setError(""); }
                    }}
                    className="flex-1 text-sm border border-indigo-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  />
                ) : (
                  <button
                    onClick={() => startEdit(i)}
                    className="flex-1 text-left text-sm text-gray-700 py-1.5 px-2 rounded-lg"
                    title="Нажмите для переименования"
                  >
                    {src}
                  </button>
                )}

                {count > 0 && (
                  <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 shrink-0">
                    {count}
                  </span>
                )}

                {editingIndex !== i && (
                  <span className="opacity-0 group-hover:opacity-100 text-gray-300 transition-opacity">
                    <PencilIcon />
                  </span>
                )}

                <button
                  onClick={() => count === 0 && onDelete(src)}
                  disabled={count > 0}
                  title={count > 0 ? `${count} трат — нельзя удалить` : "Удалить источник"}
                  className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                    count > 0
                      ? "text-gray-200 cursor-not-allowed"
                      : "text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <XIcon />
                </button>
              </div>
            );
          })}
        </div>

        {error && <p className="px-6 pb-1 text-xs text-red-500">{error}</p>}

        {/* Add new */}
        <div className="px-6 py-4 border-t border-gray-100 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Новый источник</p>
          <div className="flex gap-2">
            <input
              ref={newInputRef}
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setError(""); }}
              placeholder="Название…"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
            <button
              onClick={handleAdd}
              className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
