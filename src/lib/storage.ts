import { DEFAULT_CATEGORIES, type Expense } from "./types";

const EXPENSES_KEY = "expenses_v1";
const CATEGORIES_KEY = "categories_v1";

export function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EXPENSES_KEY);
    return raw ? (JSON.parse(raw) as Expense[]) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

export function loadCategories(): string[] {
  if (typeof window === "undefined") return [...DEFAULT_CATEGORIES];
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [...DEFAULT_CATEGORIES];
  } catch {
    return [...DEFAULT_CATEGORIES];
  }
}

export function saveCategories(categories: string[]): void {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}
