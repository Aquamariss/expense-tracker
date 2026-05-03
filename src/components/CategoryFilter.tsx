"use client";

const ALL = "Все" as const;

interface Props {
  categories: string[];
  active: string | "Все";
  onChange: (cat: string | "Все") => void;
}

export default function CategoryFilter({ categories, active, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar sm:flex-wrap pb-0.5">
      {[ALL, ...categories].map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 shrink-0 ${
            active === cat
              ? "bg-indigo-500 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
