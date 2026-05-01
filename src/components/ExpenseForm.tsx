"use client";

import { useState } from "react";
import type { Expense } from "@/lib/types";

interface Props {
  categories: string[];
  onAdd: (expense: Expense) => void;
}

export default function ExpenseForm({ categories, onAdd }: Props) {
  const today = new Date().toISOString().split("T")[0] as string;

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "");
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(",", "."));
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError("Введите корректную сумму");
      return;
    }
    if (!date) {
      setError("Выберите дату");
      return;
    }
    setError("");
    onAdd({
      id: crypto.randomUUID(),
      amount: parsed,
      category: category || (categories[0] ?? ""),
      date,
      description: description.trim(),
    });
    setAmount("");
    setDescription("");
    setDate(today);
    setCategory(categories[0] ?? "");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
    >
      <h2 className="text-lg font-semibold text-gray-800">Новая трата</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Amount */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">Сумма (₽)</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
        </div>

        {/* Date */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">Дата</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
        </div>

        {/* Category */}
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium text-gray-600">Категория</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium text-gray-600">
            Описание <span className="text-gray-400 font-normal">(необязательно)</span>
          </label>
          <input
            type="text"
            placeholder="Коротко опишите трату"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        className="w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold rounded-xl py-2.5 transition-colors duration-150"
      >
        Добавить трату
      </button>
    </form>
  );
}
