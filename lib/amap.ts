import type { Place } from "@/data/places";

function hasPoiId(place: Place): boolean {
  return Boolean(place.amapPoiId && place.amapPoiId.trim().length > 0);
}

function getNativeUrl(place: Place): string {
  const scheme = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? "iosamap" : "androidamap";

  if (hasPoiId(place)) {
    return `${scheme}://poi?sourceApplication=shanghaicok&businessId=${encodeURIComponent(place.amapPoiId!.trim())}&businessName=${encodeURIComponent(place.nameZh)}&dev=0`;
  }

  const loc = place.amapLocation?.trim();
  if (loc) {
    const [lng, lat] = loc.split(",");
    const name = encodeURIComponent(place.nameZh);
    // 고덕 공식 스펙: viewMap + poilat/poilon
    return `${scheme}://viewMap?sourceApplication=shanghaicok&poiname=${name}&poilat=${lat}&poilon=${lng}&dev=0`;
  }

  // 좌표 없는 장소: 키워드 검색
  return `${scheme}://poi?sourceApplication=shanghaicok&keywords=${encodeURIComponent(place.nameZh)}&dev=0`;
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
  let appOpened = false;

  // 앱이 열리면 blur 또는 visibilitychange 중 하나가 먼저 감지됨
  const onBlur = () => { appOpened = true; };
  const onVisibility = () => { if (document.hidden) appOpened = true; };

  window.addEventListener("blur", onBlur, { once: true });
  document.addEventListener("visibilitychange", onVisibility, { once: true });

  // 네이티브 스킴으로 앱 실행 시도
  window.location.href = getNativeUrl(place);

  // 2초 후에도 앱 전환이 감지되지 않으면 앱 미설치로 판단 → 스토어로 이동 (같은 탭, 팝업 없음)
  setTimeout(() => {
    window.removeEventListener("blur", onBlur);
    document.removeEventListener("visibilitychange", onVisibility);
    if (!appOpened) {
      window.location.href = storeUrl;
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
