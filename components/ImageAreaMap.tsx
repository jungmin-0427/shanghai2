"use client";

import { useState } from "react";
import type { Area } from "@/data/places";

const CALIBRATION_MODE = false;

const PINS: { id: Area; label: string; x: number; y: number }[] = [
  { id: "징안사",       label: "징안사",       x: 12.3, y: 11.2 },
  { id: "난징동루",     label: "난징동루",     x: 37.9, y: 17.5 },
  { id: "창러루",       label: "창러루",       x: 14.1, y: 40.6 },
  { id: "인민광장",     label: "인민광장",     x: 28.9, y: 31   },
  { id: "와이탄",       label: "와이탄",       x: 44,   y: 36   },
  { id: "우캉루",       label: "우캉루",       x: 17.3, y: 57.8 },
  { id: "신천지",       label: "신천지",       x: 33,   y: 55   },
  { id: "예원",         label: "예원",         x: 38.9, y: 71   },
  { id: "칭푸",         label: "칭푸",         x: 10,   y: 80   },
  { id: "티엔쯔팡",     label: "티엔쯔팡",     x: 28.4, y: 82.8 },
  { id: "루자주이",     label: "루자주이",     x: 80.5, y: 15   },
  { id: "푸동신구",     label: "푸동신구",     x: 90.2, y: 34.2 },
  { id: "세기공원",     label: "세기공원",     x: 82.4, y: 60   },
  { id: "디즈니",       label: "디즈니",       x: 75,   y: 79.6 },
  { id: "푸동국제공항", label: "푸동국제공항", x: 85.2, y: 92.4 },
];

type Props = {
  selected: Area | "all";
  onSelect: (area: Area | "all") => void;
};

export default function ImageAreaMap({ selected, onSelect }: Props) {
  const [clickLog, setClickLog] = useState<{ x: number; y: number } | null>(null);

  function handleMapClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!CALIBRATION_MODE) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(1));
    const y = parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(1));
    setClickLog({ x, y });
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-stone-100 shadow-sm"
      onClick={handleMapClick}
    >
      {CALIBRATION_MODE && clickLog && (
        <div className="absolute top-2 left-2 z-50 bg-black/80 text-white text-xs font-mono px-2 py-1 rounded shadow-lg pointer-events-none">
          x: {clickLog.x}% / y: {clickLog.y}%
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/newshanghaimap.png?v=3"
        alt="상하이 지도"
        className="w-full h-auto block"
      />
      {PINS.map((pin) => {
        const isSelected = selected === pin.id;
        return (
          <button
            key={pin.id}
            onClick={() => onSelect(isSelected ? "all" : pin.id)}
            style={{
              position: "absolute",
              left: `${pin.x}%`,
              top: `${pin.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            className="flex flex-col items-center focus:outline-none active:scale-110 transition-transform"
            aria-label={pin.label}
          >
            <span
              className={`
                px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap shadow-md leading-tight
                ${isSelected
                  ? "bg-red-500 text-white"
                  : "bg-white/95 text-gray-800 border border-gray-200"
                }
              `}
            >
              📍 {pin.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
