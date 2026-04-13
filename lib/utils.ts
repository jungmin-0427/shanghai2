import type { Place, Category, Area } from "@/data/places";

export function filterPlaces(
  places: Place[],
  {
    query,
    category,
    area,
  }: {
    query: string;
    category: Category | "all";
    area: Area | "all";
  }
): Place[] {
  return places.filter((place) => {
    const matchCategory = category === "all" || place.category === category;
    const matchArea = area === "all" || place.area === area;
    const q = query.trim().toLowerCase();
    const addr = place.addressZh?.toLowerCase() ?? "";
    const matchQuery =
      !q ||
      place.nameKo.toLowerCase().includes(q) ||
      place.nameZh.toLowerCase().includes(q) ||
      place.area.toLowerCase().includes(q) ||
      addr.includes(q) ||
      (place.description?.toLowerCase().includes(q) ?? false);
    return matchCategory && matchArea && matchQuery;
  });
}

export function sortByPopularity(places: Place[]): Place[] {
  return [...places].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
}

export const CATEGORY_LABEL: Record<string, string> = {
  landmark: "관광지",
  restaurant: "맛집",
  cafe: "카페",
  shopping: "쇼핑",
  hotel: "호텔",
  delivery: "배달",
};

export const CATEGORY_COLOR: Record<string, string> = {
  landmark: "bg-blue-100 text-blue-700",
  restaurant: "bg-orange-100 text-orange-700",
  cafe: "bg-amber-100 text-amber-700",
  shopping: "bg-pink-100 text-pink-700",
  hotel: "bg-purple-100 text-purple-700",
  delivery: "bg-emerald-100 text-emerald-800",
};

export const CATEGORY_EMOJI: Record<string, string> = {
  landmark: "🏛️",
  restaurant: "🍜",
  cafe: "☕",
  shopping: "🛍️",
  hotel: "🏨",
  delivery: "🛵",
};
