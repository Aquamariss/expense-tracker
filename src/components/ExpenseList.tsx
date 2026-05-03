"use client";

import { useState } from "react";
import type { Expense } from "@/lib/types";

interface Props {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

function formatAmount(n: number) {
  return n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

export default function ExpenseList({ expenses, onDelete }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
        Трат не найдено
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
      {expenses.map((expense) => {
        const isExpanded = expandedId === expense.id;
        return (
          <div key={expense.id}>
            {/* Main row */}
            <div
              className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 hover:bg-gray-50 transition-colors group cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : expense.id)}
            >
              {/* Date */}
              <span className="text-sm text-gray-400 w-20 sm:w-24 shrink-0">
                {formatDate(expense.date)}
              </span>

              {/* Category + description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium text-gray-800 truncate flex-1 min-w-0">
                    {expense.category}
                  </p>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`w-3 h-3 shrink-0 text-gray-300 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    style={{ display: "block" }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {expense.source}
                  {expense.description ? ` · ${expense.description}` : ""}
                </p>
              </div>

              {/* Amount */}
              <span className="text-base font-semibold text-gray-900 shrink-0">
                {formatAmount(expense.amount)} €
              </span>

              {/* Delete — visible on hover (desktop) */}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(expense.id); }}
                aria-label="Удалить"
                className="text-gray-300 hover:text-red-400 transition-colors duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  style={{ display: "block", overflow: "hidden" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="px-4 sm:px-5 py-3 bg-indigo-50/30 border-t border-indigo-50">
                <div className="sm:ml-28 border-l-2 border-indigo-100 pl-3 space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Описание</p>
                    {expense.description ? (
                      <p className="text-sm text-gray-700 mt-0.5">{expense.description}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic mt-0.5">Не указано</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Источник</p>
                    <p className="text-sm text-gray-700 mt-0.5">{expense.source}</p>
                  </div>
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors pt-0.5"
                  >
                    Удалить расход
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
