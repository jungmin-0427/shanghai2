import type { Place } from "@/data/places";

function hasPoiId(place: Place): boolean {
  return Boolean(place.amapPoiId && place.amapPoiId.trim().length > 0);
}

function getNativeUrl(place: Place): string {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const scheme = isIOS ? "iosamap" : "androidamap";
  const keywords = encodeURIComponent(place.addressZh ?? place.nameZh);

  return `${scheme}://poi?keywords=${keywords}&dev=0`;
}

function getWebFallbackUrl(place: Place): string {
  const address = encodeURIComponent(place.addressZh ?? place.nameZh);
  return `https://uri.amap.com/search?keyword=${address}`;
}

export function openAmap(place: Place): void {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  if (!isIOS && !isAndroid) {
    window.open(getWebFallbackUrl(place), "_blank");
    return;
  }

  let appOpened = false;

  const onBlur = () => { appOpened = true; };
  const onVisibility = () => { if (document.hidden) appOpened = true; };

  window.addEventListener("blur", onBlur, { once: true });
  document.addEventListener("visibilitychange", onVisibility, { once: true });

  // 네이티브 스킴으로 앱 실행 시도
  window.location.href = getNativeUrl(place);

  // 2초 후에도 앱 전환 미감지 → 앱 미설치로 판단, 웹 버전으로 폴백
  setTimeout(() => {
    window.removeEventListener("blur", onBlur);
    document.removeEventListener("visibilitychange", onVisibility);
    if (!appOpened) {
      window.location.href = getWebFallbackUrl(place);
    }
  }, 2000);
}

export function getAmapUrl(place: Place): string {
  if (place.amapUrl) {
    return place.amapUrl;
  }
  if (hasPoiId(place)) {
    return `https://uri.amap.com/poidetail?poiid=${encodeURIComponent(place.amapPoiId!.trim())}&src=shanghaicok`;
  }
  const loc = place.amapLocation?.trim();
  if (loc) {
    const name = encodeURIComponent(place.nameZh);
    return `https://uri.amap.com/marker?position=${encodeURIComponent(loc)}&name=${name}&coordinate=gaode&src=shanghaicok`;
  }
  const query = encodeURIComponent(`${place.nameZh} ${place.addressZh ?? "上海"}`);
  return `https://uri.amap.com/search?keyword=${query}&src=shanghaicok`;
}

export function getAmapDirectUrl(place: Place): string {
  if (place.amapUrl) {
    return place.amapUrl;
  }
  if (hasPoiId(place)) {
    return `https://uri.amap.com/poidetail?poiid=${encodeURIComponent(place.amapPoiId!.trim())}&src=shanghaicok`;
  }
  const loc = place.amapLocation?.trim();
  if (loc) {
    const name = encodeURIComponent(place.nameZh);
    return `https://uri.amap.com/marker?position=${encodeURIComponent(loc)}&name=${name}&coordinate=gaode&src=shanghaicok`;
  }
  const name = encodeURIComponent(place.nameZh);
  const address = encodeURIComponent(place.addressZh ?? "上海");
  return `https://uri.amap.com/search?keyword=${name}&address=${address}&src=shanghaicok`;
}
