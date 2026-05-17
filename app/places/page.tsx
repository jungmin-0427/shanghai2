"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";
import ImageAreaMap from "@/components/ImageAreaMap";
import PlaceCard from "@/components/PlaceCard";
import Toast, { type ToastData } from "@/components/Toast";
import { places, AREAS } from "@/data/places";
import type { Category, Area } from "@/data/places";
import { filterPlaces, sortByPopularity } from "@/lib/utils";

function PlacesContent() {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<Category | "all">("all");
  const [area, setArea] = useState<Area | "all">("all");
  const [areasExpanded, setAreasExpanded] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const areaParam = searchParams.get("area") as Area | null;
    if (areaParam) setArea(areaParam);
    const categoryParam = searchParams.get("category") as Category | null;
    if (categoryParam) setCategory(categoryParam);
  }, [searchParams]);

  function handleMapSelect(value: Area | "all") {
    setArea(value);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  const filtered = sortByPopularity(filterPlaces(places, { query: "", category, area }));

  return (
    <main className="pt-12 pb-24 bg-stone-50">
      {/* 페이지 타이틀 */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-gray-900">탐색</h1>
      </div>

      {/* 지역 필터 */}
      <div className="bg-white mx-4 mt-4 rounded-2xl border border-gray-100 shadow-sm px-4 pt-3 pb-3 mb-4">
        <div className="grid grid-cols-3 gap-2">
          {AREAS.filter((a) => a.value !== "all")
            .slice(0, areasExpanded ? undefined : 3)
            .map((a) => (
              <button
                key={a.value}
                onClick={() => setArea(area === a.value ? "all" : a.value as Area)}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-medium transition-all active:scale-95
                  ${area === a.value
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-stone-50 text-gray-600 border-gray-200 hover:border-red-200 hover:text-red-500"
                  }`}
              >
                <MapPin className="w-3 h-3 shrink-0" />
                {a.label}
              </button>
            ))}
        </div>
        <button
          onClick={() => setAreasExpanded((v) => !v)}
          className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors"
        >
          {areasExpanded
            ? <><ChevronUp className="w-3.5 h-3.5" /> 접기</>
            : <><ChevronDown className="w-3.5 h-3.5" /> 더보기</>
          }
        </button>
      </div>

      {/* 상하이 지도 필터 */}
      <div className="mx-4 mb-4">
        <ImageAreaMap selected={area} onSelect={handleMapSelect} />
      </div>

      {/* 결과 카운트 */}
      <div ref={resultsRef} className="px-4 pb-2">
        {area !== "all" && (
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-xs font-semibold text-red-500">
              <MapPin className="w-3 h-3" />
              {area}
            </span>
            <button
              onClick={() => setArea("all")}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              초기화
            </button>
          </div>
        )}
        {filtered.length > 0 && (
          <p className="text-xs text-gray-400">
            총 <span className="font-semibold text-gray-700">{filtered.length}</span>개 장소
          </p>
        )}
      </div>

      {/* 리스트 */}
      <div className="px-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 flex flex-col items-center">
            <Image
              src="/mascot2.png"
              alt="상하이콕"
              width={80}
              height={80}
              className="mb-3 opacity-60"
            />
            <p className="text-sm font-medium mb-1 text-gray-400">장소를 찾을 수 없어요</p>
            <p className="text-xs text-gray-400">다른 키워드나 필터를 시도해보세요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onCopied={setToast}
              />
            ))}
          </div>
        )}
      </div>

      {toast && <Toast data={toast} onClose={() => setToast(null)} />}
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
