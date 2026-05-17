import type { Place } from "@/data/places";

function hasPoiId(place: Place): boolean {
  return Boolean(place.amapPoiId && place.amapPoiId.trim().length > 0);
}

function getNativeUrl(place: Place): string {
  const scheme = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? "iosamap" : "androidamap";

  if (hasPoiId(place)) {
    return `${scheme}://poi?sourceApplication=shanghaitrip&poiid=${encodeURIComponent(place.amapPoiId!.trim())}&dev=0`;
  }

  const loc = place.amapLocation?.trim();
  if (loc) {
    const [lng, lat] = loc.split(",");
    const name = encodeURIComponent(place.nameZh);
    return `${scheme}://viewMap?sourceApplication=shanghaitrip&poiname=${name}&lat=${lat}&lon=${lng}&dev=0`;
  }

  return `${scheme}://poi?sourceApplication=shanghaitrip&keywords=${encodeURIComponent(place.nameZh)}&dev=0`;
}

const STORE_URL = {
  ios: "https://apps.apple.com/cn/app/id461703208",
  android: "https://play.google.com/store/search?q=amap&c=apps",
};

export function openAmap(place: Place): void {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  if (!isIOS && !isAndroid) {
    window.open(getAmapUrl(place), "_blank");
    return;
  }

  const storeUrl = isIOS ? STORE_URL.ios : STORE_URL.android;

  // 네이티브 스킴으로 바로 앱 실행 시도
  window.location.href = getNativeUrl(place);

  // 앱 미설치 시 1.5초 후 스토어로 이동
  const timer = setTimeout(() => {
    window.open(storeUrl, "_blank");
  }, 1500);

  // 앱이 열리면 페이지가 hidden 상태로 전환 → 타이머 취소
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearTimeout(timer);
  }, { once: true });
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
