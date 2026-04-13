/**
 * 고도 지도 Web 서비스 `place/text`로 POI를 조회해 `data/amap-poi-resolved.json`에 저장합니다.
 *
 * 사용법:
 *   1) https://console.amap.com/ 에서 Web 서비스용 Key 발급
 *   2) 프로젝트 루트에 `.env.local` 파일 생성:
 *        AMAP_WEB_SERVICE_KEY=여기에_키
 *   3) 실행:
 *        npm run amap:poi
 *
 * 선정 규칙(보수적):
 * - 응답 pois 중 `name`이 `nameZh`와 **완전 일치**하는 항목만 후보.
 * - 후보가 2개 이상이면 `addressZh`의 주요 구간(도로명·번지)이 POI `address`에 포함되는 것만 남김.
 * - 그래도 복수이거나 없으면 해당 장소는 파일에 넣지 않음(잘못된 ID 방지).
 *
 * 우선순위: 스크립트 내 `targets` 배열 순서(랜드마크 → 지점명 식당 → 기타).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data", "amap-poi-resolved.json");

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

const KEY = process.env.AMAP_WEB_SERVICE_KEY || process.env.AMAP_KEY || process.env.GAODE_WEB_KEY;

/** @type {{ id: string; nameZh: string; addressZh?: string; category: string; note?: string }[]} */
const targets = [
  // --- landmark: 모두 시도 ---
  { id: "l1", category: "landmark", nameZh: "外滩", addressZh: "上海市黄浦区中山东一路" },
  { id: "l2", category: "landmark", nameZh: "豫园", addressZh: "上海市黄浦区安仁街218号" },
  { id: "l3", category: "landmark", nameZh: "东方明珠广播电视塔", addressZh: "上海市浦东新区世纪大道1号" },
  { id: "l4", category: "landmark", nameZh: "上海迪士尼乐园", addressZh: "上海市浦东新区川沙新镇黄赵路310号" },
  { id: "l5", category: "landmark", nameZh: "静安寺", addressZh: "上海市静安区华山路1686号" },
  { id: "l6", category: "landmark", nameZh: "田子坊", addressZh: "上海市黄浦区泰康路210弄" },
  { id: "l7", category: "landmark", nameZh: "新天地", addressZh: "上海市黄浦区马当路181号" },
  { id: "l8", category: "landmark", nameZh: "上海中心大厦", addressZh: "上海市浦东新区陆家嘴环路501号" },
  { id: "l9", category: "landmark", nameZh: "大韩民国临时政府旧址", addressZh: "上海市黄浦区马当路306弄" },
  { id: "l10", category: "landmark", nameZh: "武康路", addressZh: "上海市徐汇区武康路" },
  { id: "l11", category: "landmark", nameZh: "武康大楼", addressZh: "上海市徐汇区淮海中路1850号" },
  { id: "l12", category: "landmark", nameZh: "朱家角古镇", addressZh: "上海市青浦区朱家角镇课植园路555号" },
  { id: "l13", category: "landmark", nameZh: "蟠龙天地", addressZh: "上海市青浦区蟠鼎路123弄" },
  { id: "l14", category: "landmark", nameZh: "南京东路", addressZh: "上海市黄浦区南京东路" },
  { id: "l15", category: "landmark", nameZh: "人民广场", addressZh: "上海市黄浦区人民大道185号" },

  // --- restaurant: 지점명(공백/괄호) 포함 우선 ---
  { id: "r2", category: "restaurant", nameZh: "鼎泰丰(新天地店)", addressZh: "上海市黄浦区马当路181号新天地时尚购物中心L108" },
  { id: "r11", category: "restaurant", nameZh: "莱莱小笼", addressZh: "上海市黄浦区天津路506号" },
  { id: "r12", category: "restaurant", nameZh: "很久以前羊肉串 第一百货商业中心店", addressZh: "上海市黄浦区南京东路800号第一百货商业中心" },
  { id: "r13", category: "restaurant", nameZh: "点都德(环宇荟店)", addressZh: "上海市黄浦区黄陂南路838弄环宇荟B1层" },
  { id: "r14", category: "restaurant", nameZh: "小杨生煎(四川中路店)", addressZh: "上海市黄浦区四川中路136号" },
  { id: "r16", category: "restaurant", nameZh: "夜上海 新天地店", addressZh: "上海市黄浦区兴业路118号新天地南里" },
  { id: "r17", category: "restaurant", nameZh: "左庭右院 上海新世界城店", addressZh: "上海市黄浦区南京西路2-68号新世界城" },
  { id: "r18", category: "restaurant", nameZh: "费大厨辣椒炒肉", addressZh: "上海市黄浦区南京东路829号世茂广场" },
  { id: "r19", category: "restaurant", nameZh: "外婆家", addressZh: "上海市黄浦区中山东二路600号BFC外滩金融中心南区" },
  { id: "r20", category: "restaurant", nameZh: "海底捞火锅", addressZh: "上海市黄浦区南京东路299号宏伊国际广场" },
  { id: "r21", category: "restaurant", nameZh: "高老九火锅", addressZh: "上海市黄浦区湖滨路202号湖滨道购物中心" },
  { id: "r22", category: "restaurant", nameZh: "朱光玉火锅馆", addressZh: "上海市黄浦区南京东路720号第一食品商店" },

  // --- cafe / shopping / hotel / delivery: 체인·지점 위주(이미 위에서 커버된 항목 제외) ---
  { id: "c7", category: "cafe", nameZh: "喜茶", addressZh: "上海市黄浦区南京东路299号宏伊国际广场" },
  { id: "c8", category: "cafe", nameZh: "霸王茶姬", addressZh: "上海市黄浦区西藏中路268号来福士广场" },
  { id: "c9", category: "cafe", nameZh: "瑞幸咖啡", addressZh: "上海市黄浦区南京东路819号" },
  { id: "c14", category: "cafe", nameZh: "FASCINO BAKERY 新天地店", addressZh: "上海市黄浦区马当路159号" },
  { id: "s7", category: "shopping", nameZh: "大润发", addressZh: "上海市黄浦区南京东路800号第一百货商业中心" },
  { id: "s8", category: "shopping", nameZh: "名创优品", addressZh: "上海市黄浦区南京东路353号悦荟广场" },
  { id: "s11", category: "shopping", nameZh: "好利来", addressZh: "上海市黄浦区马当路159号" },
  { id: "h6", category: "hotel", nameZh: "上海大酒店", addressZh: "上海市黄浦区南京西路505号" },
  { id: "h7", category: "hotel", nameZh: "全季酒店 人民广场店", addressZh: "上海市黄浦区西藏中路500号" },
  { id: "h8", category: "hotel", nameZh: "24K国际酒店 南京东路店", addressZh: "上海市黄浦区福建中路242号" },
];

function tokenHint(addr) {
  if (!addr) return "";
  const m = addr.match(/([\u4e00-\u9fa5]{2,8}(路|街|大道|弄|号))/);
  return m ? m[1] : addr.slice(4, 14);
}

function pickStrict(nameZh, addressZh, pois) {
  if (!Array.isArray(pois) || pois.length === 0) return null;
  const exact = pois.filter((p) => p.name === nameZh);
  if (exact.length === 1) return exact[0];
  if (exact.length === 0) return null;

  const hint = tokenHint(addressZh);
  if (!hint) return null;
  const narrowed = exact.filter((p) => typeof p.address === "string" && p.address.includes(hint));
  if (narrowed.length === 1) return narrowed[0];
  return null;
}

async function textSearch(nameZh) {
  const u = new URL("https://restapi.amap.com/v3/place/text");
  u.searchParams.set("key", KEY);
  u.searchParams.set("keywords", nameZh);
  u.searchParams.set("city", "上海");
  u.searchParams.set("citylimit", "true");
  u.searchParams.set("offset", "20");
  u.searchParams.set("page", "1");
  u.searchParams.set("extensions", "base");
  u.searchParams.set("output", "json");
  const res = await fetch(u);
  const data = await res.json();
  if (data.status !== "1") {
    throw new Error(`API status ${data.status} info=${data.info} infocode=${data.infocode}`);
  }
  return data.pois ?? [];
}

async function main() {
  if (!KEY) {
    console.error(
      "AMAP_WEB_SERVICE_KEY(또는 AMAP_KEY)가 없습니다.\n" +
        "`.env.local`에 Web 서비스 Key를 넣은 뒤 `npm run amap:poi`를 다시 실행하세요.",
    );
    process.exit(1);
  }

  const resolved = {};
  const skipped = [];

  for (const t of targets) {
    try {
      const pois = await textSearch(t.nameZh);
      const picked = pickStrict(t.nameZh, t.addressZh, pois);
      if (picked?.id) {
        resolved[t.id] = {
          amapPoiId: picked.id,
          name: picked.name,
          address: picked.address,
          location: picked.location,
        };
        console.log(`OK  ${t.id}  ${t.nameZh}  ->  ${picked.id}`);
      } else {
        skipped.push({ id: t.id, nameZh: t.nameZh, reason: "no unique exact name+address match" });
        console.warn(`SKIP ${t.id}  ${t.nameZh}`);
      }
    } catch (e) {
      skipped.push({ id: t.id, nameZh: t.nameZh, reason: String(e?.message ?? e) });
      console.warn(`ERR  ${t.id}  ${t.nameZh}  ${e?.message ?? e}`);
    }
    await new Promise((r) => setTimeout(r, 220));
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ resolved, skipped, generatedAt: new Date().toISOString() }, null, 2), "utf8");
  console.log(`\nWrote ${OUT} (${Object.keys(resolved).length} resolved, ${skipped.length} skipped/errors)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
