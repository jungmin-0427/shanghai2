/**
 * `data/amap-poi-resolved.json`의 `resolved` 맵을 `data/places.ts`에 반영합니다.
 * 각 장소 객체에서 `nameZh` 줄 바로 아래에 `amapPoiId`가 없으면 추가하고, 있으면 값만 교체합니다.
 *
 *   npm run amap:poi:apply
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "data", "places.ts");
const MAP = path.join(ROOT, "data", "amap-poi-resolved.json");

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function patchBlock(block, poiId) {
  if (/amapPoiId\s*:/.test(block)) {
    return block.replace(/amapPoiId\s*:\s*"[^"]*"\s*,?/m, `amapPoiId: "${poiId}",`);
  }
  return block.replace(/(\n\s*nameZh:\s*"[^"]+",)/m, `$1\n    amapPoiId: "${poiId}",`);
}

function main() {
  if (!fs.existsSync(MAP)) {
    console.error(`Missing ${MAP}. Run npm run amap:poi first.`);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(MAP, "utf8"));
  const resolved = raw.resolved ?? raw;
  let text = fs.readFileSync(SRC, "utf8");

  for (const [id, info] of Object.entries(resolved)) {
    const poiId = info?.amapPoiId;
    if (!poiId || typeof poiId !== "string") continue;

    const re = new RegExp(
      `(\\{\\s*\\n\\s*id:\\s*"${escapeRegExp(id)}"[\\s\\S]*?)(\\n\\s*\\},)`,
      "m",
    );
    const m = text.match(re);
    if (!m) {
      console.warn(`Block not found for id=${id}`);
      continue;
    }
    const body = m[1];
    const tail = m[2];
    text = text.replace(re, `${patchBlock(body, poiId)}${tail}`);
    console.log(`patched ${id} -> ${poiId}`);
  }

  fs.writeFileSync(SRC, text, "utf8");
  console.log(`Updated ${SRC}`);
}

main();
