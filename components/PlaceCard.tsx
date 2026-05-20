"use client";

import { Copy, Map, MapPin, Send } from "lucide-react";
import type { Place } from "@/data/places";
import { openAmap } from "@/lib/amap";
import { copyToClipboard, sharePlace } from "@/lib/toss";
import { CATEGORY_COLOR, CATEGORY_LABEL, CATEGORY_EMOJI } from "@/lib/utils";
import type { ToastData } from "@/components/Toast";

interface PlaceCardProps {
  place: Place;
  onCopied?: (data: ToastData) => void;
  onClick?: () => void;
  isHighlighted?: boolean;
}

export default function PlaceCard({ place, onCopied, onClick, isHighlighted }: PlaceCardProps) {
  const addressText = place.addressZh?.trim() || "주소 정보 없음";
  const copyPayload = place.addressZh?.trim() || `${place.nameZh} 上海市`;

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await copyToClipboard(copyPayload);
      onCopied?.({ label: place.nameKo, message: "주소 복사 완료!" });
    } catch {
      onCopied?.({ message: "클립보드 복사에 실패했습니다." });
    }
  }

  function handleAmap(e: React.MouseEvent) {
    e.stopPropagation();
    openAmap(place);
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await sharePlace({
        placeId: place.id,
        title: place.nameKo,
        text: `${place.nameKo} (${place.nameZh})${place.addressZh ? `\n📍 ${place.addressZh}` : ""}`,
      });
    } catch {
      // 사용자가 공유 취소하거나 미지원 환경
    }
  }

  return (
    <div
      id={place.id}
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 shadow-sm border active:scale-[0.99] transition-all cursor-pointer hover:shadow-md ${
        isHighlighted ? "border-red-300 ring-2 ring-red-200 ring-offset-1" : "border-gray-100"
      }`}
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
        <button
          onClick={handleShare}
          className="shrink-0 p-1.5 rounded-full text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-all"
          aria-label="공유하기"
        >
          <Send className="w-4 h-4" />
        </button>
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
        <p className="text-xs text-gray-600 leading-relaxed break-all">{addressText}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all bg-red-50 text-red-400 hover:bg-red-100 active:bg-red-100"
        >
          <Copy className="w-4 h-4" />
          주소 복사
        </button>
        <button
          onClick={handleAmap}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 active:bg-red-700 transition-all"
        >
          <Map className="w-4 h-4" />
          고덕지도 열기
        </button>
      </div>
    </div>
  );
}
