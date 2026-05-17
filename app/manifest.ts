import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "상하이콕",
    short_name: "상하이콕",
    description: "상하이 맛집·카페·관광지의 중국어 주소를 원탭으로 복사하고 고덕지도에서 바로 열어보세요.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff5f5",
    theme_color: "#D4271B",
    orientation: "portrait",
    icons: [
      {
        src: "/appicon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/appicon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/appicon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
