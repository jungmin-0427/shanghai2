"use client";

import { useState } from "react";
import { X, MapPin, Copy, Check, ExternalLink } from "lucide-react";
import type { Place } from "@/data/places";
import { openAmap } from "@/lib/amap";
import { CATEGORY_COLOR, CATEGORY_LABEL, CATEGORY_EMOJI } from "@/lib/utils";

interface PlaceDetailModalProps {
  place: Place;
  onClose: () => void;
  onCopied?: (message: string) => void;
}

export default function PlaceDetailModal({ place, onClose, onCopied }: PlaceDetailModalProps) {
  const [copied, setCopied] = useState(false);

  const addressText = place.addressZh?.trim() || "주소 정보 없음";
  const copyPayload = place.addressZh?.trim() || `${place.nameZh} 上海市`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyPayload);
      setCopied(true);
      onCopied?.(`"${place.nameKo}" 주소 복사 완료!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onCopied?.("클립보드 복사에 실패했습니다.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="닫기"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLOR[place.category]}`}>
            <span>{CATEGORY_EMOJI[place.category]}</span>
            {CATEGORY_LABEL[place.category]}
          </span>
          <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
            {place.area}
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-0.5">{place.nameKo}</h2>
        <p className="text-base text-gray-500 mb-3">{place.nameZh}</p>

        {place.description && (
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{place.description}</p>
        )}

        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">중국어 주소</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed break-all font-medium">{addressText}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all
              ${copied ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "복사 완료!" : "주소 복사"}
          </button>
          <button
            onClick={() => openAmap(place)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            고덕지도 열기
          </button>
        </div>
      </div>
    </div>
  );
}
