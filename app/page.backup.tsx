"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ChevronRight } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import ExchangeRateCard from "@/components/ExchangeRateCard";
import PlaceCard from "@/components/PlaceCard";
import Toast from "@/components/Toast";
import PlaceDetailModal from "@/components/PlaceDetailModal";
import { places, AREAS } from "@/data/places";
import type { Category, Area, Place } from "@/data/places";
import { filterPlaces, sortByPopularity } from "@/lib/utils";

const popularPlaces = sortByPopularity(places).slice(0, 6);

const TIPS = [
  "와이탄 야경은 저녁 7시가 최고예요 ✨",
  "디즈니 티켓은 미리 예매하세요! 🎢",
  "예원은 저녁 방문이 더 예뻐요 🏮",
  "난징동루에서 쇼핑 즐기세요 🛍️",
  "신천지 카페 거리 꼭 가보세요 ☕",
  "푸동 야경은 와이탄에서 봐요 🌃",
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [toast, setToast] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * TIPS.length));
  }, []);

  const filteredPopular = filterPlaces(popularPlaces, { query, category, area: "all" });

  return (
    <main className="pb-24 bg-stone-50">
      {/* Compact Hero Banner */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 px-5 pt-14 pb-5 relative overflow-hidden">
        {/* 배경 장식 원 */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -left-6 w-28 h-28 bg-white/5 rounded-full" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          {/* 왼쪽: 타이틀 + 설명 */}
          <div className="flex-1 min-w-0">
            <p className="text-red-200/80 text-[11px] font-medium tracking-widest uppercase mb-0.5">
              Shanghai Trip
            </p>
            <h1 className="text-white text-lg font-bold tracking-tight leading-snug">
              상하이 여행 가이드
            </h1>
            <p className="text-red-200/70 text-xs mt-1 leading-relaxed">
              중국어 주소 복사 · 고덕지도 연결
            </p>
          </div>

          {/* 오른쪽: 말풍선 + 마스코트 */}
          <div className="flex items-end gap-1.5 flex-shrink-0">
            {/* 말풍선 */}
            <div className="relative bg-amber-50 text-gray-700 text-[11px] font-medium rounded-2xl rounded-br-none px-2.5 py-2 shadow-lg max-w-[130px] leading-snug">
              {TIPS[tipIndex]}
            </div>
            {/* 마스코트 */}
            <Image
              src="/mascot.png"
              alt="상하이콕"
              width={100}
              height={100}
              className="flex-shrink-0 drop-shadow-md"
            />
          </div>
        </div>
      </div>

      {/* 환율 카드 */}
      <ExchangeRateCard />

      {/* 검색 + 카테고리 — sticky */}
      <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-2 sticky top-12 z-20 shadow-sm">
        <SearchBar value={query} onChange={setQuery} />
        <div className="mt-2">
          <CategoryTabs selected={category} onChange={setCategory} />
        </div>
      </div>

      <div className="px-4 pt-5">
        {/* 인기 지역 */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">인기 지역</h2>
            <Link
              href="/places"
              className="text-xs text-red-500 flex items-center gap-0.5 font-medium"
            >
              전체보기 <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {AREAS.filter((a) => a.value !== "all").map((area) => (
              <Link
                key={area.value}
                href={`/places?area=${area.value}`}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm text-xs text-gray-700 font-medium hover:border-red-200 hover:text-red-500 transition-all active:scale-95"
              >
                <MapPin className="w-3 h-3 text-red-400" />
                {area.label}
              </Link>
            ))}
          </div>
        </section>

        {/* 인기 장소 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">
              {query || category !== "all" ? "검색 결과" : "인기 장소"}
            </h2>
            <Link
              href="/places"
              className="text-xs text-red-500 flex items-center gap-0.5 font-medium"
            >
              전체보기 <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {filteredPopular.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <Image
                src="/mascot.png"
                alt="상하이콕"
                width={80}
                height={80}
                className="mb-3 opacity-50"
              />
              <p className="text-sm text-gray-400">장소를 찾을 수 없어요</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredPopular.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onCopied={setToast}
                  onClick={() => setSelectedPlace(place)}
                />
              ))}
            </div>
          )}

          {!query && category === "all" && (
            <Link
              href="/places"
              className="mt-4 flex items-center justify-center gap-1.5 w-full py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-all"
            >
              전체 {places.length}개 장소 보기 <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </section>
      </div>

      {selectedPlace && (
        <PlaceDetailModal
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          onCopied={setToast}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </main>
  );
}
