/**
 * Toss WebView 브릿지 API 유틸리티
 * - Toss 앱 환경: SDK 브릿지 API 사용
 * - 일반 브라우저(Vercel 등): 브라우저 네이티브 API 폴백
 */

/**
 * 텍스트를 클립보드에 복사해요.
 * Toss WebView에서는 setClipboardText 브릿지를 사용하고,
 * 그 외 환경에서는 navigator.clipboard를 사용해요.
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    const { setClipboardText } = await import("@apps-in-toss/web-bridge");
    await setClipboardText(text);
  } catch {
    // Toss 브릿지 미지원 환경 → 브라우저 API 폴백
    await navigator.clipboard.writeText(text);
  }
}

/**
 * 장소를 공유해요.
 * Toss WebView에서는 getTossShareLink + share 브릿지를 사용하고,
 * 그 외 환경에서는 navigator.share를 사용해요.
 */
export async function sharePlace(params: {
  placeId: string;
  title: string;
  text: string;
}): Promise<void> {
  const { placeId, title, text } = params;

  try {
    const { getTossShareLink, share } = await import("@apps-in-toss/web-bridge");
    // Toss 딥링크 공유 링크 생성
    const tossLink = await getTossShareLink(
      `intoss://shanghaikok/places?place=${placeId}`
    );
    await share({ message: `${title}\n${text}\n${tossLink}` });
  } catch {
    // Toss 브릿지 미지원 환경 → 브라우저 share API 폴백
    const url = `${window.location.origin}/places?place=${placeId}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title, text, url });
    }
  }
}
