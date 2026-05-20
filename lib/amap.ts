import type { Place } from "@/data/places";

function hasPoiId(place: Place): boolean {
  return Boolean(place.amapPoiId && place.amapPoiId.trim().length > 0);
}

function getNativeUrl(place: Place): string {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const scheme = isIOS ? "iosamap" : "androidamap";

  // 1순위: POI ID → 정확한 장소 상세 페이지
  if (place.amapPoiId?.trim()) {
    return `${scheme}://poi/detail?poiUid=${encodeURIComponent(place.amapPoiId.trim())}&dev=0&src=shanghaicok`;
  }

  // 2순위: 좌표 → 현재위치와 무관하게 정확한 위치로 이동
  const loc = place.amapLocation?.trim();
  if (loc) {
    const [lon, lat] = loc.split(",");
    const name = encodeURIComponent(place.nameZh);
    return `${scheme}://viewMap?sourceApplication=shanghaicok&poiname=${name}&lat=${lat}&lon=${lon}&dev=0`;
  }

  // 3순위: 키워드 검색 (좌표 없는 장소)
  // addressZh(전체 주소)는 POI 검색 키워드로 부적합 — nameZh(장소명)으로 검색하고
  // city=上海로 범위 제한해 전국 검색 방지
  const keywords = encodeURIComponent(place.nameZh);
  const city = encodeURIComponent("上海");
  return `${scheme}://poi?keywords=${keywords}&city=${city}&dev=0`;
}

function getWebFallbackUrl(place: Place): string {
  const address = encodeURIComponent(place.addressZh ?? place.nameZh);
  return `https://uri.amap.com/search?keyword=${address}`;
}

export async function openAmap(place: Place): Promise<void> {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  if (!isIOS && !isAndroid) {
    window.open(getWebFallbackUrl(place), "_blank");
    return;
  }

  // Toss WebView에서는 window.location.href로 커스텀 스킴을 열 수 없음
  // @apps-in-toss/web-bridge의 openURL(RN Linking.openURL)로 처리
  try {
    const { openURL } = await import("@apps-in-toss/web-bridge");
    // Toss WebView 환경 확인됨 — 중첩 try로 앱 미설치 케이스를 별도 처리
    try {
      await openURL(getNativeUrl(place));
    } catch {
      // 고덕지도 미설치 → window.location.href는 WKWebView에서 작동 안 하므로
      // 동일한 브릿지로 웹 fallback URL을 바로 열기
      await openURL(getWebFallbackUrl(place));
    }
    return;
  } catch {
    // import 자체가 실패 = Toss WebView 외 환경 (일반 브라우저) → 기존 방식으로 폴백
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
