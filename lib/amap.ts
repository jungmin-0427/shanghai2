import type { Place } from "@/data/places";

export function getAmapUrl(place: Place): string {
  if (place.amapUrl) {
    return place.amapUrl;
  }
  const query = encodeURIComponent(`${place.nameZh} ${place.addressZh}`);
  return `https://uri.amap.com/search?keyword=${query}&src=shanghaitrip`;
}

export function getAmapDirectUrl(place: Place): string {
  if (place.amapUrl) {
    return place.amapUrl;
  }
  const name = encodeURIComponent(place.nameZh);
  const address = encodeURIComponent(place.addressZh);
  return `https://uri.amap.com/search?keyword=${name}&address=${address}&src=shanghaitrip`;
}
