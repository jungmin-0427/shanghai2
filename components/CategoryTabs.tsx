"use client";

import type { Category } from "@/data/places";
import { CATEGORIES } from "@/data/places";

interface CategoryTabsProps {
  selected: Category | "all";
  onChange: (category: Category | "all") => void;
}

export default function CategoryTabs({ selected, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
            ${
              selected === cat.value
                ? "bg-red-500 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-500"
            }`}
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
