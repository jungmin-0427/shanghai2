"use client";

import { useState, useMemo } from "react";
import { places, type Area } from "@/data/places";

type AreaOrAll = Area | "all";

interface RegionDef {
  id: Area;
  label: string;
  points: string;
  cx: number;
  cy: number;
  fontSize?: number;
}

// 대략적인 상하이 중심부 지도 기반 좌표 (SVG viewBox 0 0 280 360)
// 황푸강: x=177~190 수직 밴드 / 쑤저우허: y=115 수평선
const REGIONS: RegionDef[] = [
  {
    id: "칭푸",
    label: "칭푸",
    points: "8,22 48,22 48,115 8,115",
    cx: 28,
    cy: 68,
    fontSize: 9,
  },
  {
    id: "징안사",
    label: "징안사",
    points: "48,22 177,22 177,115 48,115",
    cx: 112,
    cy: 68,
  },
  {
    id: "창러루",
    label: "창러루",
    points: "8,115 102,115 98,193 8,193",
    cx: 50,
    cy: 154,
  },
  {
    id: "인민광장",
    label: "인민광장",
    points: "102,115 177,115 177,145 102,145",
    cx: 139,
    cy: 130,
    fontSize: 9,
  },
  {
    id: "난징동루",
    label: "난징동루",
    points: "102,145 177,145 177,193 98,193 102,145",
    cx: 138,
    cy: 169,
    fontSize: 9,
  },
  {
    id: "신천지",
    label: "신천지",
    points: "8,193 88,193 84,270 8,270",
    cx: 44,
    cy: 231,
  },
  {
    id: "예원",
    label: "예원",
    points: "88,193 140,193 136,270 84,270",
    cx: 112,
    cy: 231,
  },
  {
    id: "와이탄",
    label: "와이탄",
    points: "140,193 177,193 177,270 136,270",
    cx: 156,
    cy: 231,
    fontSize: 9,
  },
  {
    id: "티엔쯔팡",
    label: "티엔쯔팡",
    points: "8,270 177,270 177,338 8,338",
    cx: 93,
    cy: 304,
    fontSize: 9,
  },
  {
    id: "푸동",
    label: "푸동",
    points: "190,22 272,22 272,255 190,255",
    cx: 231,
    cy: 138,
  },
  {
    id: "디즈니",
    label: "디즈니",
    points: "190,255 272,255 272,338 190,338",
    cx: 231,
    cy: 296,
  },
];

interface Props {
  selected: AreaOrAll;
  onSelect: (area: AreaOrAll) => void;
}

export default function ShanghaiMap({ selected, onSelect }: Props) {
  const [hovered, setHovered] = useState<Area | null>(null);

  const countByArea = useMemo(() => {
    const map: Partial<Record<Area, number>> = {};
    for (const p of places) {
      map[p.area] = (map[p.area] ?? 0) + 1;
    }
    return map;
  }, []);

  function getFill(id: Area) {
    if (selected === id) return "#D4271B";
    if (hovered === id) return "#FEE2E2";
    return "#FFF5F5";
  }

  function getTextColor(id: Area) {
    return selected === id ? "white" : "#374151";
  }

  function getCountColor(id: Area) {
    return selected === id ? "rgba(255,255,255,0.75)" : "#9CA3AF";
  }

  return (
    <div className="px-4 pb-2">
      {/* 전체 버튼 */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => onSelect("all")}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
            selected === "all"
              ? "bg-gray-800 text-white border-gray-800"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
          }`}
        >
          전체 보기
        </button>
      </div>

      {/* SVG 지도 */}
      <svg
        viewBox="0 0 280 360"
        className="w-full rounded-2xl overflow-hidden shadow-sm"
        style={{ maxHeight: 320, cursor: "default" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 바다/외곽 배경 */}
        <rect width="280" height="360" fill="#E0F2FE" />

        {/* 황푸강 (수직 밴드) */}
        <rect x="177" y="22" width="13" height="316" fill="#7DD3FC" />
        <text
          x="183.5"
          y="180"
          textAnchor="middle"
          fontSize="6.5"
          fill="#3B82F6"
          fontFamily="system-ui, sans-serif"
          transform="rotate(-90, 183.5, 180)"
        >
          황 푸 강
        </text>

        {/* 쑤저우허 (수평선) */}
        <path
          d="M 8,115 Q 90,107 177,115"
          stroke="#7DD3FC"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />

        {/* 지역 폴리곤 */}
        {REGIONS.map((r) => {
          const count = countByArea[r.id] ?? 0;
          const fs = r.fontSize ?? 11;
          return (
            <g
              key={r.id}
              onClick={() => onSelect(r.id === selected ? "all" : r.id)}
              onMouseEnter={() => setHovered(r.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <polygon
                points={r.points}
                fill={getFill(r.id)}
                stroke="#D4271B"
                strokeWidth="0.6"
                strokeOpacity="0.25"
              />
              {/* 지역명 */}
              <text
                x={r.cx}
                y={count > 0 ? r.cy - 6 : r.cy}
                textAnchor="middle"
                fontSize={fs}
                fontWeight="700"
                fill={getTextColor(r.id)}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {r.label}
              </text>
              {/* 장소 수 */}
              {count > 0 && (
                <text
                  x={r.cx}
                  y={r.cy + 7}
                  textAnchor="middle"
                  fontSize="8"
                  fill={getCountColor(r.id)}
                  fontFamily="system-ui, sans-serif"
                >
                  {count}곳
                </text>
              )}
            </g>
          );
        })}

        {/* 외곽 테두리 */}
        <rect
          x="8"
          y="22"
          width="264"
          height="316"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="1"
          rx="2"
        />

        {/* 푸시/푸동 구분 라벨 */}
        <text x="88" y="15" textAnchor="middle" fontSize="7" fill="#94A3B8" fontFamily="system-ui">
          푸시 (浦西)
        </text>
        <text x="231" y="15" textAnchor="middle" fontSize="7" fill="#94A3B8" fontFamily="system-ui">
          푸동 (浦东)
        </text>
      </svg>

      {/* 선택된 지역 표시 */}
      {selected !== "all" && (
        <p className="text-center text-xs text-red-600 font-semibold mt-2">
          {selected} · {countByArea[selected as Area] ?? 0}곳 표시 중
        </p>
      )}
    </div>
  );
}
