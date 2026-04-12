"use client";

import { useState } from "react";
import { Copy, MapPin, Check } from "lucide-react";
import type { Place } from "@/data/places";
import { getAmapDirectUrl } from "@/lib/amap";
import { CATEGORY_COLOR, CATEGORY_LABEL, CATEGORY_EMOJI } from "@/lib/utils";

interface PlaceCardProps {
  place: Place;
  onCopied?: (message: string) => void;
  onClick?: () => void;
}

export default function PlaceCard({ place, onCopied, onClick }: PlaceCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(place.addressZh);
      setCopied(true);
      onCopied?.(`"${place.nameKo}" 주소 복사 완료!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onCopied?.("클립보드 복사에 실패했습니다.");
    }
  }

  function handleAmap(e: React.MouseEvent) {
    e.stopPropagation();
    window.open(getAmapDirectUrl(place), "_blank");
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.99] transition-all cursor-pointer hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLOR[place.category]}`}
          >
            <span>{CATEGORY_EMOJI[place.category]}</span>
            {CATEGORY_LABEL[place.category]}
          </span>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
            {place.area}
          </span>
        </div>
      </div>

      <div className="mb-1">
        <h3 className="text-base font-bold text-gray-900">{place.nameKo}</h3>
        <p className="text-sm text-gray-500">{place.nameZh}</p>
      </div>

      {place.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{place.description}</p>
      )}

      <div className="flex items-start gap-1.5 mb-3 bg-gray-50 rounded-lg px-3 py-2">
        <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
        <p className="text-xs text-gray-600 leading-relaxed break-all">{place.addressZh}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all
            ${copied ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"}`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "복사됨" : "주소 복사"}
        </button>
        <button
          onClick={handleAmap}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 active:bg-red-700 transition-all"
        >
          <MapPin className="w-4 h-4" />
          고덕지도 열기
        </button>
      </div>
    </div>
  );
}
