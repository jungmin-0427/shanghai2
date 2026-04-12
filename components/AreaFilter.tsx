"use client";

import type { Area } from "@/data/places";
import { AREAS } from "@/data/places";

interface AreaFilterProps {
  selected: Area | "all";
  onChange: (area: Area | "all") => void;
}

export default function AreaFilter({ selected, onChange }: AreaFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {AREAS.map((area) => (
        <button
          key={area.value}
          onClick={() => onChange(area.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border
            ${
              selected === area.value
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
            }`}
        >
          {area.label}
        </button>
      ))}
    </div>
  );
}
