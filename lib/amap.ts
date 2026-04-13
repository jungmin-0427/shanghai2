import type { Place } from "@/data/places";

function hasPoiId(place: Place): boolean {
  return Boolean(place.amapPoiId && place.amapPoiId.trim().length > 0);
}

export function getAmapUrl(place: Place): string {
  if (place.amapUrl) {
    return place.amapUrl;
  }
  if (hasPoiId(place)) {
    return `https://uri.amap.com/poidetail?poiid=${encodeURIComponent(place.amapPoiId!.trim())}&src=shanghaitrip`;
  }
  const loc = place.amapLocation?.trim();
  if (loc) {
    const name = encodeURIComponent(place.nameZh);
    return `https://uri.amap.com/marker?position=${encodeURIComponent(loc)}&name=${name}&coordinate=gaode&src=shanghaitrip`;
  }
  const query = encodeURIComponent(`${place.nameZh} ${place.addressZh ?? "上海"}`);
  return `https://uri.amap.com/search?keyword=${query}&src=shanghaitrip`;
}

export function getAmapDirectUrl(place: Place): string {
  if (place.amapUrl) {
    return place.amapUrl;
  }
  if (hasPoiId(place)) {
    return `https://uri.amap.com/poidetail?poiid=${encodeURIComponent(place.amapPoiId!.trim())}&src=shanghaitrip`;
  }
  const loc = place.amapLocation?.trim();
  if (loc) {
    const name = encodeURIComponent(place.nameZh);
    return `https://uri.amap.com/marker?position=${encodeURIComponent(loc)}&name=${name}&coordinate=gaode&src=shanghaitrip`;
  }
  const name = encodeURIComponent(place.nameZh);
  const address = encodeURIComponent(place.addressZh ?? "上海");
  return `https://uri.amap.com/search?keyword=${name}&address=${address}&src=shanghaitrip`;
}
