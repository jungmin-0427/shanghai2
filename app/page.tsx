"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import CategoryTabs from "@/components/CategoryTabs";
import HeroBanner from "@/components/HeroBanner";
import PlaceCard from "@/components/PlaceCard";
import Toast, { type ToastData } from "@/components/Toast";
import { places } from "@/data/places";
import type { Category } from "@/data/places";
import { filterPlaces, sortByPopularity } from "@/lib/utils";

const popularPlaces = sortByPopularity(places).slice(0, 6);

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [toast, setToast] = useState<ToastData | null>(null);

  // 검색어·카테고리 필터 적용 시 전체 데이터에서 검색, 아닐 때는 인기 상위 6개
  const isFiltering = query.trim() !== "" || category !== "all";
  const filteredPopular = isFiltering
    ? sortByPopularity(filterPlaces(places, { query, category, area: "all" }))
    : popularPlaces;

  return (
    <main className="pt-12 pb-24 bg-stone-50">
      {/* Hero Banner + 검색창 */}
      <HeroBanner searchValue={query} onSearchChange={setQuery} />

      {/* 카테고리 — sticky */}
      <div className="bg-white border-b border-gray-100 pt-2 pb-2 sticky top-12 z-20 shadow-sm">
        <CategoryTabs selected={category} onChange={setCategory} />
      </div>

      <div className="px-4 pt-5">
        {/* 장소 섹션 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-bold text-gray-900">
                {isFiltering ? "검색 결과" : "주요 장소"}
              </h2>
              <span className="text-xs text-gray-400">
                총 <span className="font-semibold text-gray-700">{isFiltering ? filteredPopular.length : places.length}</span>개 장소
              </span>
            </div>
          </div>

          {filteredPopular.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <Image
                src="/mascot2.png"
                alt="상하이콕"
                width={80}
                height={80}
                className="mb-3 opacity-50"
                unoptimized
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
                />
              ))}
            </div>
          )}

          {!isFiltering && (
            <Link
              href="/places"
              className="mt-4 flex items-center justify-center gap-1.5 w-full py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-all"
            >
              전체 {places.length}개 장소 보기 <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </section>
      </div>

{toast && <Toast data={toast} onClose={() => setToast(null)} />}
    </main>
  );
}
