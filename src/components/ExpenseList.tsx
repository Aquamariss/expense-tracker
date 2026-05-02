"use client";

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
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
        Трат не найдено
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
        >
          {/* Date */}
          <span className="text-sm text-gray-400 w-24 shrink-0">
            {formatDate(expense.date)}
          </span>

          {/* Category + description */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {expense.category}
            </p>
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {expense.source}
              {expense.description ? ` · ${expense.description}` : ""}
            </p>
          </div>

          {/* Amount */}
          <span className="text-base font-semibold text-gray-900 shrink-0">
            {formatAmount(expense.amount)} €
          </span>

          {/* Delete */}
          <button
            onClick={() => onDelete(expense.id)}
            aria-label="Удалить"
            className="text-gray-300 hover:text-red-400 transition-colors duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
