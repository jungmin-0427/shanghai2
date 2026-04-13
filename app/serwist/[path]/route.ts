import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import { createSerwistRoute } from "@serwist/turbopack";

function getRevision(): string {
  try {
    const result = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" });
    if (result.status === 0 && result.stdout?.trim()) {
      return result.stdout.trim();
    }
  } catch {
    /* no git */
  }
  return crypto.randomUUID();
}

const revision = getRevision();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  additionalPrecacheEntries: [{ url: "/offline.html", revision }],
  swSrc: "app/sw.ts",
  useNativeEsbuild: true,
});
