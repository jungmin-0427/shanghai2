"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import AreaFilter from "@/components/AreaFilter";
import PlaceCard from "@/components/PlaceCard";
import Toast from "@/components/Toast";
import PlaceDetailModal from "@/components/PlaceDetailModal";
import { places } from "@/data/places";
import type { Category, Area, Place } from "@/data/places";
import { filterPlaces, sortByPopularity } from "@/lib/utils";

function PlacesContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [area, setArea] = useState<Area | "all">("all");
  const [toast, setToast] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  useEffect(() => {
    const areaParam = searchParams.get("area") as Area | null;
    if (areaParam) setArea(areaParam);
    const categoryParam = searchParams.get("category") as Category | null;
    if (categoryParam) setCategory(categoryParam);
  }, [searchParams]);

  const filtered = sortByPopularity(filterPlaces(places, { query, category, area }));

  return (
    <main className="pb-24">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 sticky top-0 z-30">
        <h1 className="text-lg font-bold text-gray-900 mb-3">장소 탐색</h1>
        <div className="mb-3">
          <SearchBar value={query} onChange={setQuery} />
        </div>
        <div className="mb-2">
          <CategoryTabs selected={category} onChange={setCategory} />
        </div>
        <AreaFilter selected={area} onChange={setArea} />
      </div>

      {/* 결과 카운트 */}
      <div className="px-4 py-3">
        <p className="text-xs text-gray-500">
          {filtered.length > 0 ? (
            <>
              총 <span className="font-semibold text-gray-800">{filtered.length}</span>개 장소
            </>
          ) : null}
        </p>
      </div>

      {/* 리스트 */}
      <div className="px-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-sm font-medium mb-1">검색 결과가 없어요</p>
            <p className="text-xs text-gray-400">다른 키워드나 필터를 시도해보세요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onCopied={setToast}
                onClick={() => setSelectedPlace(place)}
              />
            ))}
          </div>
        )}
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

export default function PlacesPage() {
  return (
    <Suspense>
      <PlacesContent />
    </Suspense>
  );
}
