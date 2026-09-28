/**
 * 네이버 블로그 검색 API로 "상하이 맛집/카페/핫플" 등 키워드를 훑어서
 * 여러 글에서 반복 언급되는 장소명 후보를 빈도순으로 뽑아 data/naver-blog-candidates.json에 저장합니다.
 *
 * 사용법:
 *   1) NAVER API HUB(https://api.ncloud-docs.com , NCP 콘솔)에서 검색 API 신청 후 Client ID/Secret 발급
 *      (2026-07-31부로 기존 developers.naver.com 검색 API 신규 발급이 종료돼 API HUB로 이전됨)
 *   2) 프로젝트 루트에 `.env.local` 파일 생성:
 *        NAVER_CLIENT_ID=여기에_Client_ID
 *        NAVER_CLIENT_SECRET=여기에_Client_Secret
 *   3) 실행:
 *        npm run naver:candidates
 *
 * 결과는 어디까지나 "후보"입니다 — 실제 존재 여부, 정확한 중문명/주소는
 * 최종 확정 후 amap:poi 스크립트로 별도 검증하세요.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PLACES_SRC = path.join(ROOT, "data", "places.ts");
const OUT = path.join(ROOT, "data", "naver-blog-candidates.json");

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const k = m[1];
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadDotEnv(path.join(ROOT, ".env.local"));
loadDotEnv(path.join(ROOT, ".env"));

const CLIENT_ID = process.env.NAVER_CLIENT_ID;
const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

// 카테고리별 검색 키워드 (기존 Category 타입과 대략 매칭)
const QUERIES = [
  { category: "landmark", query: "상하이 가볼만한곳" },
  { category: "landmark", query: "상하이 여행 필수코스" },
  { category: "landmark", query: "상하이 야경 명소" },
  { category: "restaurant", query: "상하이 맛집 추천" },
  { category: "restaurant", query: "상하이 딤섬 맛집" },
  { category: "restaurant", query: "상하이 훠궈 맛집" },
  { category: "cafe", query: "상하이 카페 추천" },
  { category: "cafe", query: "상하이 브런치 맛집" },
  { category: "shopping", query: "상하이 쇼핑 거리" },
  { category: "hotel", query: "상하이 호텔 추천" },
];

// 결과에서 걸러낼 일반 단어(검색 키워드 자체, 흔한 여행 블로그 상투어)
const STOPWORDS = new Set([
  "상하이", "여행", "맛집", "카페", "추천", "코스", "필수", "야경", "명소",
  "딤섬", "훠궈", "브런치", "쇼핑", "거리", "호텔", "가볼만한곳", "가볼만한", "곳",
  "후기", "리뷰", "정보", "예약", "위치", "주소", "시간", "영업", "메뉴", "가격",
  "베스트", "인생샷", "포토스팟", "데이트", "당일치기", "자유여행", "패키지",
  "오늘", "진짜", "정말", "완전", "너무", "근처", "그냥", "우리", "제가", "이번",
  // 여행 블로그에서 흔히 반복되는 일반 명사/부사 (장소명이 아닌 것들)
  "중국", "상해", "홍콩", "숙소", "도시", "최고", "함께", "특히", "가볼", "가장",
  "다양", "주변", "그리고", "가성비", "아름다운", "아름다운곳", "사람들", "여행지",
  "블로그", "포스팅", "사진", "영상", "링크", "클릭", "참고", "이곳", "그곳", "저곳",
  "여기", "거기", "저기", "지난", "이런", "저런", "그런", "대표적", "유명한", "유명",
  "인기", "친구", "남편", "아내", "아이", "저희", "느낌", "분위기", "만한", "볼만한",
  "다녀온", "다녀왔던", "방문", "방문한", "모두", "전부", "총", "약간", "정도",
]);

// URL/블로그 플랫폼 관련 잡토큰 (스니펫에 도메인이 섞여 들어오는 경우 제거)
const URL_NOISE = /^(https?|www|com|co|kr|net|tistory|naver|blogspot|blog|html?)$/i;

// 한국어 용언(동사/형용사) 종결·연결어미로 끝나는 토큰은 대부분 서술어라 장소명이 아님
const PREDICATE_ENDING = /(다|요|니다|한|는|고|며|서|지만|으며|든지|거나)$/;

function stripHtml(s) {
  return s
    .replace(/<\/?b>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'");
}

// 흔한 한국어 조사를 어절 끝에서 제거 (완벽하진 않지만 후보 정제엔 충분)
function stripJosa(token) {
  return token.replace(
    /(으로|에서|에게|이나|까지|부터|한테|보다|이라|라서|이랑|랑|의|을|를|은|는|이|가|도|만|와|과|에|로)$/,
    "",
  );
}

function isNoiseToken(token) {
  if (token.length < 2 || token.length > 12) return true;
  if (STOPWORDS.has(token)) return true;
  if (/^\d+$/.test(token)) return true;
  if (!/[가-힣一-鿿 A-Za-z]/.test(token)) return true;
  if (URL_NOISE.test(token)) return true;
  // 순한글 토큰만 어미 검사 (중문/영문 장소명은 이 규칙에서 제외)
  if (/^[가-힣]+$/.test(token) && PREDICATE_ENDING.test(token)) return true;
  return false;
}

function extractCandidatePhrases(text) {
  const rawTokens = stripHtml(text)
    .replace(/[.,!?~^"'()\[\]{}:;·•\-–—\/|]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(stripJosa)
    .filter((t) => !isNoiseToken(t));

  const phrases = new Set();
  for (let i = 0; i < rawTokens.length; i++) {
    phrases.add(rawTokens[i]);
    if (i + 1 < rawTokens.length) {
      phrases.add(`${rawTokens[i]} ${rawTokens[i + 1]}`);
    }
  }
  return phrases;
}

function loadExistingPlaceNames() {
  const names = new Set();
  if (!fs.existsSync(PLACES_SRC)) return names;
  const text = fs.readFileSync(PLACES_SRC, "utf8");
  for (const m of text.matchAll(/name(?:Ko|Zh):\s*"([^"]+)"/g)) {
    names.add(m[1].replace(/\s+/g, ""));
  }
  return names;
}

function isAlreadyCovered(phrase, existingNames) {
  const normalized = phrase.replace(/\s+/g, "");
  for (const name of existingNames) {
    if (name.includes(normalized) || normalized.includes(name)) return true;
  }
  return false;
}

async function searchBlog(query, display = 100) {
  const u = new URL("https://naverapihub.apigw.ntruss.com/search/v1/blog");
  u.searchParams.set("query", query);
  u.searchParams.set("display", String(display));
  u.searchParams.set("sort", "sim");
  const res = await fetch(u, {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": CLIENT_ID,
      "X-NCP-APIGW-API-KEY": CLIENT_SECRET,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} ${body}`);
  }
  const data = await res.json();
  return data.items ?? [];
}

async function main() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error(
      "NAVER_CLIENT_ID / NAVER_CLIENT_SECRET이 없습니다.\n" +
        "`.env.local`에 네이버 오픈API 키를 넣은 뒤 `npm run naver:candidates`를 다시 실행하세요.",
    );
    process.exit(1);
  }

  const existingNames = loadExistingPlaceNames();
  const perQuery = {};
  const overall = new Map(); // phrase -> { count, examples: [{title, link}] }

  for (const { category, query } of QUERIES) {
    let items;
    try {
      items = await searchBlog(query);
    } catch (e) {
      console.warn(`ERR  ${query}  ${e?.message ?? e}`);
      perQuery[query] = { category, error: String(e?.message ?? e) };
      continue;
    }

    const phraseHits = new Map(); // phrase -> { count, examples }
    for (const item of items) {
      const title = stripHtml(item.title ?? "");
      const link = item.link ?? "";
      const phrases = extractCandidatePhrases(`${item.title ?? ""} ${item.description ?? ""}`);
      for (const phrase of phrases) {
        if (isAlreadyCovered(phrase, existingNames)) continue;
        if (!phraseHits.has(phrase)) phraseHits.set(phrase, { count: 0, examples: [] });
        const entry = phraseHits.get(phrase);
        entry.count += 1;
        if (entry.examples.length < 2) entry.examples.push({ title, link });

        if (!overall.has(phrase)) overall.set(phrase, { count: 0, examples: [] });
        const oEntry = overall.get(phrase);
        oEntry.count += 1;
        if (oEntry.examples.length < 2) oEntry.examples.push({ title, link });
      }
    }

    const ranked = [...phraseHits.entries()]
      .filter(([, v]) => v.count >= 3)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 15)
      .map(([phrase, v]) => ({ phrase, count: v.count, examples: v.examples }));

    perQuery[query] = { category, fetched: items.length, candidates: ranked };
    console.log(`${query} (${category}): ${items.length}건 조회, 후보 ${ranked.length}개`);

    await new Promise((r) => setTimeout(r, 150));
  }

  const overallTop = [...overall.entries()]
    .filter(([, v]) => v.count >= 3)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 50)
    .map(([phrase, v]) => ({ phrase, count: v.count, examples: v.examples }));

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(
    OUT,
    JSON.stringify({ generatedAt: new Date().toISOString(), perQuery, overallTop }, null, 2),
    "utf8",
  );

  console.log(`\n상위 후보 (전체 합산 상위 ${overallTop.length}개):`);
  for (const c of overallTop.slice(0, 20)) {
    console.log(`  ${String(c.count).padStart(3)}회  ${c.phrase}`);
  }
  console.log(`\nWrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
