"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import PlaceCard from "@/components/PlaceCard";
import Toast from "@/components/Toast";
import PlaceDetailModal from "@/components/PlaceDetailModal";
import { places, AREAS } from "@/data/places";
import type { Category, Area, Place } from "@/data/places";
import { filterPlaces, sortByPopularity } from "@/lib/utils";

const popularPlaces = sortByPopularity(places).slice(0, 6);

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [toast, setToast] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const filteredPopular = filterPlaces(popularPlaces, { query, category, area: "all" });

  return (
    <main className="pb-24">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 px-5 pt-12 pb-8 text-white">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🇨🇳</span>
          <h1 className="text-xl font-bold tracking-tight">상하이 여행 가이드</h1>
        </div>
        <p className="text-red-100 text-sm leading-relaxed">
          중국어 주소를 쉽게 복사하고<br />
          고덕지도에서 바로 열어보세요
        </p>
      </div>

      <div className="px-4 -mt-4">
        {/* 검색창 */}
        <div className="mb-4">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        {/* 카테고리 탭 */}
        <div className="mb-5">
          <CategoryTabs selected={category} onChange={setCategory} />
        </div>

        {/* 인기 지역 바로가기 */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">인기 지역</h2>
            <Link href="/places" className="text-xs text-red-500 flex items-center gap-0.5">
              전체보기 <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {AREAS.filter((a) => a.value !== "all").map((area) => (
              <Link
                key={area.value}
                href={`/places?area=${area.value}`}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm text-sm text-gray-700 font-medium hover:border-red-200 hover:text-red-600 transition-all active:scale-95"
              >
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                {area.label}
              </Link>
            ))}
          </div>
        </section>

        {/* 인기 장소 리스트 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">
              {query || category !== "all" ? "검색 결과" : "인기 장소"}
            </h2>
            <Link href="/places" className="text-xs text-red-500 flex items-center gap-0.5">
              전체보기 <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {filteredPopular.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🔍</p>
              <p className="text-sm">검색 결과가 없습니다</p>
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
