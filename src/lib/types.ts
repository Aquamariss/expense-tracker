export const DEFAULT_CATEGORIES = [
  "Продукты питания",
  "Интернет и телефоны",
  "Страховки",
  "Подписки",
  "Компенсируемые командировки",
  "Развлечения",
  "Здоровье и красота",
  "Техника",
  "Одежда и аксессуары",
  "Авто: топливо и содержание",
  "Другое",
] as const;

export type Category = string;

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string; // YYYY-MM-DD
  description: string;
}
