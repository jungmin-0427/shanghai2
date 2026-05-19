import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const mascotData = readFileSync(join(process.cwd(), "public/mascot2.png"));
  const mascotSrc = `data:image/png;base64,${mascotData.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff9f9",
        fontFamily: "sans-serif",
        padding: "0 80px",
        gap: 64,
      }}
    >
      {/* 상단 레드 바 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 10,
          background: "#D4271B",
        }}
      />

      {/* 마스코트 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mascotSrc}
        width={380}
        height={380}
        style={{ objectFit: "contain" }}
        alt=""
      />

      {/* 텍스트 영역 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: "#111",
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          상하이콕
        </div>

        <div
          style={{
            width: 64,
            height: 5,
            borderRadius: 9999,
            background: "#D4271B",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 36,
            color: "#444",
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          <span>상하이 인기 스팟</span>
          <span>주소 복사&amp;고덕지도 이동까지</span>
        </div>
      </div>

      {/* 하단 도메인 */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 80,
          fontSize: 22,
          color: "#bbb",
        }}
      >
        shanghai2-rho.vercel.app
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
